import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

interface JournalEntry {
  id: string;
  text_content: string;
  analysis: string;
  created_at: string;
}

export default function CarelyJournalScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'carely' | 'journal'>('carely');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // Journal states
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalContent, setJournalContent] = useState('');
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (activeTab === 'carely' && currentConversationId) {
      loadConversationMessages();
    } else if (activeTab === 'journal') {
      loadJournalEntries();
    }
  }, [activeTab, currentConversationId]);

  const initializeData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      // Load conversations for Carely tab
      await loadConversations();
      
      // Load journal entries for Journal tab
      await loadJournalEntries();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.get(`/chatbot/conversations/user/${userId}`);
      const userConversations = response.data;
      
      setConversations(userConversations);
      
      if (userConversations.length > 0 && !currentConversationId) {
        // Load the most recent conversation
        setCurrentConversationId(userConversations[0].id);
      } else if (userConversations.length === 0) {
        // Create a new conversation if none exist
        await createNewConversation();
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Create new conversation on error
      await createNewConversation();
    }
  };

  const createNewConversation = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.post(`/chatbot/conversations/?user_id=${userId}`);
      const newConversation = response.data;
      
      setCurrentConversationId(newConversation.id);
      setConversations(prev => [newConversation, ...prev]);
      setMessages([]);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hello! I'm Carely, your AI wellness companion. I'm here to support you through your healthcare journey. How are you feeling today?",
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Could not create new conversation. Please try again.');
    }
  };

  const loadConversationMessages = async () => {
    if (!currentConversationId) return;
    
    try {
      const response = await api.get(`/chatbot/conversations/${currentConversationId}`);
      const conversation = response.data;
      
      if (conversation.messages) {
        setMessages(conversation.messages);
        // Scroll to bottom after loading messages
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  const loadJournalEntries = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await api.get(`/journals/user/${userId}`);
      setJournalEntries(response.data);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const switchTab = (tab: 'carely' | 'journal') => {
    Animated.timing(slideAnimation, {
      toValue: tab === 'carely' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setActiveTab(tab);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      created_at: new Date().toISOString(),
    };

    console.log('Sending message:', userMessage.content);

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Send message to backend
      const response = await api.post('/chatbot/messages/', {
        conversation_id: currentConversationId,
        content: userMessage.content,
        role: 'user',
      });

      console.log('Message sent successfully:', response.data);

      // Reset poll attempts counter
      (pollForNewMessages as any).attempts = 0;

      // Start polling for AI response with a longer initial delay
      setTimeout(() => {
        pollForNewMessages();
      }, 3000); // Wait 3 seconds before first poll

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const pollForNewMessages = async () => {
    if (!currentConversationId) return;

    try {
      const response = await api.get(`/chatbot/messages/${currentConversationId}`);
      const allMessages = response.data;
      
      console.log('Polling - Current messages count:', messages.length);
      console.log('Polling - Server messages count:', allMessages.length);
      
      // Check if there are new messages
      if (allMessages.length > messages.length) {
        console.log('New messages found, updating UI');
        setMessages(allMessages);
        setIsTyping(false);
        
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else if (allMessages.length === messages.length) {
        // Still waiting for AI response, continue polling but with limit
        const pollAttempts = (pollForNewMessages as any).attempts || 0;
        if (pollAttempts < 10) { // Max 10 attempts (20 seconds)
          (pollForNewMessages as any).attempts = pollAttempts + 1;
          console.log('Still waiting for AI response, attempt:', pollAttempts + 1);
          setTimeout(() => {
            pollForNewMessages();
          }, 2000);
        } else {
          console.log('Polling timeout, stopping');
          setIsTyping(false);
          // Reset attempts for next time
          (pollForNewMessages as any).attempts = 0;
        }
      }
    } catch (error) {
      console.error('Error polling for messages:', error);
      setIsTyping(false);
      // Reset attempts on error
      (pollForNewMessages as any).attempts = 0;
    }
  };

  const saveJournalEntry = async () => {
    if (!journalContent.trim()) {
      Alert.alert('Missing Content', 'Please write something in your journal entry.');
      return;
    }

    setIsSavingJournal(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('text_content', journalContent.trim());
      
      const response = await api.post('/journals/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add new entry to the beginning of the list
      setJournalEntries(prev => [response.data, ...prev]);
      setJournalContent('');
      setShowJournalForm(false);
      
      Alert.alert(
        'Journal Saved! 📝', 
        'Your journal entry has been saved and analyzed by Carely.',
        [{ text: 'Great!', style: 'default' }]
      );

    } catch (error: any) {
      console.error('Error saving journal:', error);
      Alert.alert(
        'Save Error', 
        'Could not save your journal entry. Please try again.'
      );
    } finally {
      setIsSavingJournal(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.role === 'user' ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {message.role === 'assistant' && (
        <View style={styles.avatarContainer}>
          <Ionicons name="heart" size={16} color={colors.primary} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.role === 'user' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.role === 'user' ? styles.userMessageText : styles.aiMessageText,
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            message.role === 'user' ? styles.userMessageTime : styles.aiMessageTime,
          ]}
        >
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const renderJournalEntry = (entry: JournalEntry) => (
    <TouchableOpacity 
      key={entry.id} 
      style={styles.journalEntryCard}
      onPress={() => {
        Alert.alert(
          'Carely\'s Analysis',
          entry.analysis,
          [{ text: 'Thank you', style: 'default' }]
        );
      }}
    >
      <View style={styles.journalEntryHeader}>
        <Text style={styles.journalEntryDate}>
          {new Date(entry.created_at).toLocaleDateString()}
        </Text>
        <Ionicons name="analytics" size={16} color={colors.primary} />
      </View>
      <Text style={styles.journalEntryPreview} numberOfLines={4}>
        {entry.text_content}
      </Text>
      <View style={styles.journalEntryFooter}>
        <Text style={styles.journalEntryTime}>
          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.analysisHint}>Tap to see Carely's insights</Text>
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
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={createNewConversation}
        >
          <Ionicons name="add-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.typingText}>Carely is thinking...</Text>
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
          disabled={!inputText.trim() || isTyping}
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
            <Text style={styles.journalHeaderTitle}>AI-Analyzed Journal</Text>
            <Text style={styles.journalHeaderSubtitle}>Reflect with Carely's insights</Text>
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
          <Text style={styles.journalFormTitle}>How was your day?</Text>
          <TextInput
            style={styles.journalContentInput}
            placeholder="Share your thoughts, experiences, and feelings. Carely will provide personalized insights to support your wellbeing."
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
                setJournalContent('');
              }}
            >
              <Text style={styles.journalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.journalSaveButton, isSavingJournal && styles.journalSaveButtonDisabled]}
              onPress={saveJournalEntry}
              disabled={isSavingJournal}
            >
              {isSavingJournal ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.journalSaveText}>Save & Analyze</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Journal Entries */}
      <ScrollView
        style={styles.journalEntriesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {journalEntries.length === 0 ? (
          <View style={styles.emptyJournalState}>
            <Ionicons name="journal-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyJournalTitle}>No journal entries yet</Text>
            <Text style={styles.emptyJournalText}>
              Start documenting your thoughts and get AI-powered insights from Carely to support your wellbeing
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
              Carely Chat
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
              AI Journal
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
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
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
  typingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  journalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.divider,
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
  analysisIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
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
  analysisHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  journalFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  journalSaveButtonDisabled: {
    backgroundColor: colors.divider,
  },
});