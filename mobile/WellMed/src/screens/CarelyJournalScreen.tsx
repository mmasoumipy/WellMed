import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  mood?: string;
}

export default function CarelyJournalScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'carely' | 'journal'>('carely');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Carely, your AI companion. I'm here to support you through your healthcare journey. How are you feeling today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Journal states
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [showJournalForm, setShowJournalForm] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const switchTab = (tab: 'carely' | 'journal') => {
    Animated.timing(slideAnimation, {
      toValue: tab === 'carely' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setActiveTab(tab);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response (replace with Ollama integration)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userText: string): string => {
    // Placeholder AI responses (replace with Ollama integration)
    const responses = [
      "I understand how challenging healthcare work can be. Your feelings are completely valid.",
      "It sounds like you're dealing with a lot. Remember, taking care of yourself is just as important as caring for your patients.",
      "Burnout is common in healthcare. What specific aspect is weighing on you most today?",
      "Your dedication to patient care is admirable. Have you considered any stress-relief techniques?",
      "I'm here to listen. Sometimes just talking about these challenges can help lighten the load.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const saveJournalEntry = () => {
    if (!journalTitle.trim() || !journalContent.trim()) {
      Alert.alert('Missing Information', 'Please provide both a title and content for your journal entry.');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: journalTitle.trim(),
      content: journalContent.trim(),
      timestamp: new Date(),
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    setJournalTitle('');
    setJournalContent('');
    setShowJournalForm(false);
    
    Alert.alert('Success', 'Your journal entry has been saved successfully!');
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!message.isUser && (
        <View style={styles.avatarContainer}>
          <Ionicons name="heart" size={16} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            message.isUser ? styles.userMessageTime : styles.aiMessageTime,
          ]}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderJournalEntry = (entry: JournalEntry) => (
    <TouchableOpacity key={entry.id} style={styles.journalEntryCard}>
      <View style={styles.journalEntryHeader}>
        <Text style={styles.journalEntryTitle}>{entry.title}</Text>
        <Text style={styles.journalEntryDate}>
          {entry.timestamp.toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.journalEntryPreview} numberOfLines={3}>
        {entry.content}
      </Text>
      <View style={styles.journalEntryFooter}>
        <Text style={styles.journalEntryTime}>
          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity style={styles.journalActionButton}>
          <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCarelyTab = () => (
    <View style={styles.tabContent}>
      {/* Header */}
      <View style={styles.carelyHeader}>
        <View style={styles.carelyAvatar}>
          <Ionicons name="heart" size={24} color={colors.primary} />
        </View>
        <View style={styles.carelyInfo}>
          <Text style={styles.carelyName}>Carely</Text>
          <Text style={styles.carelyStatus}>Your AI Wellness Companion</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="heart" size={16} color={colors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Share what's on your mind..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={!inputText.trim() ? colors.textSecondary : 'white'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderJournalTab = () => (
    <View style={styles.tabContent}>
      {/* Header */}
      <View style={styles.journalHeader}>
        <View style={styles.journalHeaderLeft}>
          <Ionicons name="journal" size={24} color={colors.accent} />
          <View style={styles.journalHeaderText}>
            <Text style={styles.journalHeaderTitle}>Daily Journal</Text>
            <Text style={styles.journalHeaderSubtitle}>Reflect on your day</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addJournalButton}
          onPress={() => setShowJournalForm(true)}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Journal Form */}
      {showJournalForm && (
        <View style={styles.journalForm}>
          <TextInput
            style={styles.journalTitleInput}
            placeholder="Entry title..."
            placeholderTextColor={colors.textSecondary}
            value={journalTitle}
            onChangeText={setJournalTitle}
          />
          <TextInput
            style={styles.journalContentInput}
            placeholder="How was your day? What are you thinking about?"
            placeholderTextColor={colors.textSecondary}
            value={journalContent}
            onChangeText={setJournalContent}
            multiline
            textAlignVertical="top"
          />
          <View style={styles.journalFormActions}>
            <TouchableOpacity
              style={styles.journalCancelButton}
              onPress={() => {
                setShowJournalForm(false);
                setJournalTitle('');
                setJournalContent('');
              }}
            >
              <Text style={styles.journalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.journalSaveButton}
              onPress={saveJournalEntry}
            >
              <Text style={styles.journalSaveText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Journal Entries */}
      <ScrollView
        style={styles.journalEntriesContainer}
        showsVerticalScrollIndicator={false}
      >
        {journalEntries.length === 0 ? (
          <View style={styles.emptyJournalState}>
            <Ionicons name="journal-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyJournalTitle}>No journal entries yet</Text>
            <Text style={styles.emptyJournalText}>
              Start documenting your thoughts and experiences as a healthcare professional
            </Text>
            <TouchableOpacity
              style={styles.startJournalingButton}
              onPress={() => setShowJournalForm(true)}
            >
              <Text style={styles.startJournalingText}>Start Journaling</Text>
            </TouchableOpacity>
          </View>
        ) : (
          journalEntries.map(renderJournalEntry)
        )}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carely & Journal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <View style={styles.tabBackground}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  {
                    translateX: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width / 2 - 40],
                    }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.tab, activeTab === 'carely' && styles.activeTab]}
            onPress={() => switchTab('carely')}
          >
            <Ionicons
              name="heart"
              size={18}
              color={activeTab === 'carely' ? 'white' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'carely' ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Carely
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'journal' && styles.activeTab]}
            onPress={() => switchTab('journal')}
          >
            <Ionicons
              name="journal"
              size={18}
              color={activeTab === 'journal' ? 'white' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'journal' ? styles.activeTabText : styles.inactiveTabText,
              ]}
            >
              Journal
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === 'carely' ? renderCarelyTab() : renderJournalTab()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 25,
    padding: 4,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: width / 2 - 44,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 21,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  activeTab: {
    // Styling handled by indicator
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: 'white',
  },
  inactiveTabText: {
    color: colors.textSecondary,
  },
  tabContent: {
    flex: 1,
  },
  
  // Carely Tab Styles
  carelyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  carelyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  carelyInfo: {
    flex: 1,
  },
  carelyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  carelyStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: colors.textPrimary,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: colors.textSecondary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: colors.divider,
  },

  // Journal Tab Styles
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  journalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journalHeaderText: {
    marginLeft: 12,
  },
  journalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  journalHeaderSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addJournalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalForm: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  journalTitleInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundPrimary,
    marginBottom: 12,
  },
  journalContentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundPrimary,
    height: 120,
    marginBottom: 16,
  },
  journalFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  journalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  journalCancelText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  journalSaveButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  journalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  journalEntriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  journalEntryCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  journalEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  journalEntryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  journalEntryDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  journalEntryPreview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  journalEntryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalEntryTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  journalActionButton: {
    padding: 4,
  },
  emptyJournalState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyJournalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyJournalText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  startJournalingButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startJournalingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});