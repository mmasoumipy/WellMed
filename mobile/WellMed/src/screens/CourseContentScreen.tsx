import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface CourseModule {
  id: string;
  title: string;
  content: string;
  duration: string;
  type: 'reading' | 'video' | 'interactive' | 'exercise';
  keyTakeaways: string[];
  actionItems?: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  icon: string;
  color: string;
  modules: number;
}

// Sample course content - In a real app, this would come from an API
const getCourseModules = (courseId: string): CourseModule[] => {
  switch (courseId) {
    case 'burnout-basics':
      return [
        {
          id: 'intro',
          title: 'Introduction to Burnout',
          content: `Burnout is more than just feeling tired after a long shift. It's a psychological syndrome that emerges as a prolonged response to chronic interpersonal stressors on the job.

          The three key dimensions of burnout are:

          • Emotional Exhaustion: Feeling emotionally drained and depleted
          • Depersonalization: Developing cynical attitudes toward patients and work
          • Reduced Personal Accomplishment: Feeling ineffective and questioning your competence

          Healthcare professionals are particularly vulnerable due to:
          - High-stakes decision making
          - Emotional demands of patient care
          - Long hours and shift work
          - Administrative burdens
          - Moral distress from system constraints

          Understanding these factors is the first step in prevention.`,
          duration: '4 min',
          type: 'reading',
          keyTakeaways: [
            'Burnout has three distinct dimensions',
            'Healthcare professionals face unique risk factors',
            'Early recognition is key to prevention',
          ],
        },
        {
          id: 'science',
          title: 'The Science Behind Burnout',
          content: `Research shows that burnout creates measurable changes in your brain and body:

          Neurological Impact:
          - Chronic stress shrinks the prefrontal cortex (decision-making center)
          - The amygdala (fear center) becomes hyperactive
          - Memory and concentration are impaired

          Physical Effects:
          - Elevated cortisol levels
          - Compromised immune function
          - Increased risk of cardiovascular disease
          - Sleep disruption

          The good news? These changes are largely reversible with proper intervention.`,
          duration: '3 min',
          type: 'reading',
          keyTakeaways: [
            'Burnout creates measurable brain changes',
            'Physical health is directly impacted',
            'Recovery is possible with intervention',
          ],
        },
        {
          id: 'recognition',
          title: 'Recognizing the Signs',
          content: `Early Warning Signs:

          Emotional:
          - Feeling drained, even after rest
          - Increased irritability or cynicism
          - Anxiety about work
          - Emotional numbness

          Behavioral:
          - Avoiding patient interactions
          - Procrastinating on tasks
          - Increased absences
          - Isolating from colleagues

          Physical:
          - Chronic fatigue
          - Frequent illnesses
          - Sleep problems
          - Headaches or muscle tension

          Cognitive:
          - Difficulty concentrating
          - Memory problems
          - Indecisiveness
          - Negative self-talk`,
          duration: '5 min',
          type: 'interactive',
          keyTakeaways: [
            'Burnout affects emotional, behavioral, physical, and cognitive domains',
            'Early recognition prevents progression',
            'Signs can be subtle at first',
          ],
          actionItems: [
            'Complete a self-assessment checklist',
            'Identify your personal warning signs',
            'Share concerns with a trusted colleague',
          ],
        },
        {
          id: 'prevention',
          title: 'Prevention Strategies',
          content: `Evidence-Based Prevention:

          Individual Strategies:
          - Regular self-assessment
          - Stress management techniques
          - Maintaining work-life boundaries
          - Building resilience skills
          - Seeking support when needed

          Organizational Factors:
          - Workload management
          - Control over work environment
          - Fair reward systems
          - Strong workplace community
          - Alignment with organizational values

Remember: Prevention is more effective than treatment. Small, consistent actions make a big difference.`,
          duration: '3 min',
          type: 'reading',
          keyTakeaways: [
            'Both individual and organizational factors matter',
            'Prevention is more effective than treatment',
            'Small, consistent actions create change',
          ],
          actionItems: [
            'Choose one prevention strategy to implement this week',
            'Schedule monthly burnout self-assessments',
            'Identify resources available in your workplace',
          ],
        },
      ];
    
    case 'micro-resilience':
      return [
        {
          id: 'intro-micro',
          title: 'What is Micro-Resilience?',
          content: `Micro-resilience refers to small, quick interventions that can be done in 2 minutes or less to reset your stress response and build resilience throughout your day.

          These techniques are specifically designed for healthcare professionals who:
          - Have limited time between patients
          - Need quick stress relief
          - Want to prevent stress accumulation
          - Work in high-pressure environments

          The science behind micro-interventions shows that even brief moments of intentional practice can:
          - Lower cortisol levels
          - Activate the parasympathetic nervous system
          - Improve focus and decision-making
          - Build long-term resilience`,
          duration: '3 min',
          type: 'reading',
          keyTakeaways: [
            'Micro-resilience uses brief, 2-minute interventions',
            'Perfect for busy healthcare schedules',
            'Small actions have measurable physiological benefits',
          ],
        },
        {
          id: 'breathing-reset',
          title: 'The 90-Second Breathing Reset',
          content: `This technique activates your parasympathetic nervous system in just 90 seconds:

          Steps:
          1. Find a comfortable position (sitting or standing)
          2. Place one hand on chest, one on belly
          3. Breathe in slowly through nose (4 counts)
          4. Hold breath gently (4 counts)
          5. Exhale slowly through mouth (6 counts)
          6. Repeat for 6-8 cycles

          When to use:
          - Before entering a patient room
          - After a difficult conversation
          - During transitions between tasks
          - When feeling overwhelmed`,
          duration: '2 min',
          type: 'exercise',
          keyTakeaways: [
            'Takes only 90 seconds to complete',
            'Activates parasympathetic nervous system',
            'Can be done anywhere, anytime',
          ],
          actionItems: [
            'Practice the technique now',
            'Set 3 phone reminders today to use this',
            'Notice how you feel before and after',
          ],
        },
        {
          id: 'grounding-technique',
          title: '5-4-3-2-1 Grounding Technique',
          content: `When stress or anxiety peaks, this grounding technique brings you back to the present moment:

          The 5-4-3-2-1 Method:
          - 5 things you can SEE (clock, chair, pen, etc.)
          - 4 things you can TOUCH (fabric, table surface, etc.)
          - 3 things you can HEAR (air conditioning, voices, etc.)
          - 2 things you can SMELL (coffee, sanitizer, etc.)
          - 1 thing you can TASTE (mint, water, etc.)

          This technique:
          - Interrupts the stress response
          - Grounds you in sensory experience
          - Can be done silently anywhere
          - Takes 60-90 seconds`,
          duration: '2 min',
          type: 'exercise',
          keyTakeaways: [
            'Interrupts stress response through sensory grounding',
            'Can be done discretely in any environment',
            'Effective for anxiety and overwhelm',
          ],
          actionItems: [
            'Practice right now in your current environment',
            'Use before stressful procedures or conversations',
            'Teach this technique to a colleague',
          ],
        },
        {
          id: 'micro-breaks',
          title: 'Strategic Micro-Breaks',
          content: `Research shows that strategic 30-60 second breaks can dramatically reduce fatigue and improve performance:

          Micro-Break Ideas:
          - Shoulder rolls and neck stretches
          - Three deep breaths with extended exhales
          - Brief positive self-talk or affirmation
          - Look out a window or at nature photos
          - Quick hand and wrist stretches
          - Mindful sip of water or tea

          Timing Your Breaks:
          - Between patient encounters
          - After completing documentation
          - Before difficult conversations
          - During long procedures (when safe)
          - At natural transition points

          The key is consistency, not duration.`,
          duration: '3 min',
          type: 'reading',
          keyTakeaways: [
            'Strategic micro-breaks reduce fatigue and improve performance',
            'Consistency matters more than duration',
            'Can be integrated into existing workflow',
          ],
          actionItems: [
            'Identify 3 natural break points in your typical day',
            'Choose 2-3 micro-break techniques to try',
            'Set subtle reminders for the first week',
          ],
        },
        {
          id: 'positive-anchoring',
          title: 'Positive Anchoring Technique',
          content: `Create positive emotional anchors that can instantly shift your mental state during challenging moments:

          Creating Your Anchor:
          1. Think of a recent positive moment at work (successful patient outcome, colleague appreciation, etc.)
          2. Relive it vividly - see what you saw, hear what you heard, feel what you felt
          3. While experiencing these positive emotions, create a physical anchor (touch thumb to index finger, place hand on heart, etc.)
          4. Hold for 10-15 seconds while maintaining the positive emotions
          5. Release and repeat 3-4 times

          Using Your Anchor:
          - Activate it before stressful situations
          - Use it after difficult encounters
          - Practice it during calm moments to strengthen the association
          - Share the technique with your team`,
          duration: '4 min',
          type: 'interactive',
          keyTakeaways: [
            'Physical anchors can trigger positive emotional states',
            'Must be practiced during positive moments to be effective',
            'Provides quick access to resilience during stress',
          ],
          actionItems: [
            'Create your first positive anchor right now',
            'Practice your anchor daily for one week',
            'Use it in one stressful situation today',
          ],
        },
        {
          id: 'micro-gratitude',
          title: 'Micro-Gratitude Practice',
          content: `Even 30 seconds of gratitude practice can shift your neurochemistry and improve resilience:

          The 3-Breath Gratitude Practice:
          - Breath 1: Think of something about your work that you're grateful for
          - Breath 2: Think of a colleague or patient you appreciate
          - Breath 3: Think of something about yourself as a healthcare professional that you value

          Advanced Technique - Gratitude Jar:
          - Keep a small notebook or phone note
          - Add one quick gratitude note per shift
          - Review during difficult days
          - Share positive entries with your team

          Why It Works:
          - Activates positive neural pathways
          - Counters negativity bias
          - Improves mood and job satisfaction
          - Builds psychological resilience over time`,
          duration: '2 min',
          type: 'exercise',
          keyTakeaways: [
            'Gratitude practice rewires the brain for positivity',
            'Can be done in 30 seconds or less',
            'Builds long-term resilience and job satisfaction',
          ],
          actionItems: [
            'Do the 3-breath gratitude practice right now',
            'Set a daily reminder for gratitude practice',
            'Start a gratitude jar or note for this week',
          ],
        },
      ];

    case 'values-based-prevention':
      return [
        {
          id: 'rediscovering-why',
          title: 'Rediscovering Your Why',
          content: `When burnout sets in, we often lose connection with the deeper reasons we chose healthcare. Reconnecting with your "why" is one of the most powerful burnout prevention strategies.

          Your "why" might include:
          - Desire to heal and help others
          - Interest in medical science and problem-solving
          - Want to make a meaningful difference
          - Personal experiences that drew you to medicine
          - Values like compassion, service, or excellence

          Research shows that healthcare professionals with a strong sense of purpose experience:
          - Lower rates of burnout
          - Higher job satisfaction
          - Better patient outcomes
          - Increased resilience during difficult times
          - Greater career longevity

          The goal isn't to recreate your original motivation, but to evolve and deepen your understanding of what gives your work meaning today.`,
          duration: '4 min',
          type: 'reading',
          keyTakeaways: [
            'Purpose and meaning are powerful burnout preventers',
            'Your "why" can evolve throughout your career',
            'Strong purpose correlates with better outcomes',
          ],
        },
        {
          id: 'values-assessment',
          title: 'Core Values Assessment',
          content: `Understanding your core values helps align your daily work with what matters most to you:

          Common Healthcare Values:
          - Compassion and empathy
          - Excellence and competence
          - Service to others
          - Scientific curiosity
          - Healing and restoration
          - Justice and advocacy
          - Collaboration and teamwork
          - Integrity and honesty
          - Innovation and progress
          - Work-life balance

          Values Reflection Exercise:
          1. From the list above (and others you think of), identify your top 5 values
          2. Rank them in order of importance to you personally
          3. For each top value, write one sentence about why it matters to you
          4. Consider how well your current work aligns with these values
          5. Identify areas where you might better express your values

          Remember: There are no "right" or "wrong" values - only what's authentic to you.`,
          duration: '6 min',
          type: 'interactive',
          keyTakeaways: [
            'Values provide a framework for meaningful work',
            'Alignment between values and work prevents burnout',
            'Values can guide career decisions and daily choices',
          ],
          actionItems: [
            'Complete the values assessment exercise',
            'Share your top 3 values with a trusted colleague',
            'Identify one way to better express your values at work',
          ],
        },
        {
          id: 'meaning-making',
          title: 'Daily Meaning-Making Practices',
          content: `Small daily practices can help you stay connected to the meaning in your work:

          End-of-Shift Reflection:
          - What went well today?
          - How did I make a difference (however small)?
          - What am I learning or growing in?
          - What am I grateful for from today?

          Patient Impact Journaling:
          - Keep brief notes about positive patient interactions
          - Record thank you messages or feedback
          - Document successful outcomes you contributed to
          - Note moments when you embodied your values

          Team Connection:
          - Acknowledge colleagues' contributions
          - Share positive patient stories
          - Celebrate small wins together
          - Discuss what gives your work meaning

          Legacy Thinking:
          - How do you want to be remembered as a healthcare professional?
          - What impact do you want to have on patients, colleagues, and the profession?
          - What would you tell your younger self starting in healthcare?`,
          duration: '5 min',
          type: 'reading',
          keyTakeaways: [
            'Daily practices help maintain connection to meaning',
            'Small positive moments matter as much as big ones',
            'Sharing meaning with others amplifies its impact',
          ],
          actionItems: [
            'Try the end-of-shift reflection for one week',
            'Start recording one positive patient interaction per shift',
            'Have a meaning-focused conversation with a colleague',
          ],
        },
        {
          id: 'mission-alignment',
          title: 'Aligning with Your Personal Mission',
          content: `Creating a personal mission statement for your healthcare career provides a north star during difficult times:

          Elements of a Healthcare Mission Statement:
          - Who you serve (patients, families, communities)
          - How you serve (your unique approach or style)
          - What impact you want to have
          - What values guide your practice
          - What legacy you want to leave

          Sample Mission Statements:
          "To provide compassionate, evidence-based care that honors each patient's dignity while continuously growing in knowledge and wisdom."

          "To be a healing presence in moments of vulnerability, using my skills to restore health and hope while supporting my colleagues in our shared mission."

          "To advocate for patients and families through excellent clinical care, clear communication, and systemic improvements that benefit all."

          Mission Statement Exercise:
          1. Write your first draft in 2-3 sentences
          2. Review and refine over several days
          3. Share with a mentor or trusted colleague for feedback
          4. Post it somewhere you'll see it regularly
          5. Review and update annually

          Your mission should inspire you and feel authentic to who you are as a professional.`,
          duration: '7 min',
          type: 'interactive',
          keyTakeaways: [
            'A personal mission statement provides direction and motivation',
            'Mission statements should be personal and authentic',
            'Regular review helps maintain alignment and purpose',
          ],
          actionItems: [
            'Write your first draft personal mission statement',
            'Share it with a mentor or colleague for feedback',
            'Post your final version where you can see it daily',
          ],
        },
        {
          id: 'purpose-in-difficulty',
          title: 'Finding Purpose in Difficult Moments',
          content: `Healthcare involves inevitable difficult moments. Finding purpose in these challenges is key to resilience:

          Reframing Difficult Experiences:
          - What is this situation teaching me?
          - How is this building my competence or character?
          - What would I want someone to do for my family member in this situation?
          - How can I honor the trust patients place in me?
          - What small comfort or dignity can I provide?

          Growth Mindset in Healthcare:
          - Challenges are opportunities to develop skills
          - Mistakes are learning opportunities (within safe practice)
          - Difficult patients often have unmet needs
          - System frustrations can motivate positive change
          - Suffering can deepen empathy and wisdom

          Finding Meaning in Loss:
          - Each life has value regardless of outcome
          - Providing comfort in suffering has inherent worth
          - Being present in someone's final moments is sacred
          - Supporting families through grief is meaningful service
          - Honoring patients' dignity even in death

          Remember: You don't have to fix everything to make a difference. Sometimes your presence and care are the healing.`,
          duration: '6 min',
          type: 'reading',
          keyTakeaways: [
            'Difficult moments can deepen purpose when reframed',
            'Growth mindset transforms challenges into opportunities',
            'Presence and dignity have inherent healing value',
          ],
          actionItems: [
            'Reflect on a recent difficult situation using the reframing questions',
            'Identify one growth opportunity from a current challenge',
            'Practice finding small ways to provide comfort or dignity',
          ],
        },
      ];

    case 'quick-breathing':
      return [
        {
          id: 'energy-reset',
          title: '5-Minute Energy Reset Protocol',
          content: `This evidence-based breathing sequence is designed to quickly restore energy and mental clarity:

          The Complete Protocol (5 minutes):

          Phase 1: Centering (1 minute)
          - Sit or stand comfortably
          - Close eyes or soften gaze
          - Take 5 natural breaths, just noticing your current state

          Phase 2: Energizing Breath (2 minutes)
          - Inhale for 4 counts through nose
          - Hold for 2 counts
          - Exhale for 4 counts through mouth
          - Repeat for 15-20 cycles
          - Focus on filling your belly, then chest

          Phase 3: Balancing Breath (1.5 minutes)
          - Inhale for 4 counts
          - Hold for 4 counts
          - Exhale for 6 counts
          - Repeat for 8-10 cycles

          Phase 4: Integration (30 seconds)
          - Return to natural breathing
          - Notice any changes in energy, clarity, or mood
          - Set an intention for the next part of your day

          This protocol activates the parasympathetic nervous system while providing an energy boost through improved oxygenation.`,
          duration: '5 min',
          type: 'exercise',
          keyTakeaways: [
            'Complete protocol takes exactly 5 minutes',
            'Combines centering, energizing, and balancing elements',
            'Provides both immediate and sustained benefits',
          ],
          actionItems: [
            'Practice the complete protocol right now',
            'Use it during your next break between patients',
            'Notice and record how you feel before and after',
          ],
        },
      ];
    
    default:
      return [
        {
          id: 'placeholder',
          title: 'Course Content Coming Soon',
          content: `This course is currently being developed by our team of healthcare professionals and burnout prevention experts.

          Content will include:
          - Evidence-based strategies
          - Practical exercises
          - Real-world case studies
          - Interactive assessments

          Check back soon for the complete course content!`,
          duration: '1 min',
          type: 'reading',
          keyTakeaways: [
            'Course content is in development',
            'Will include practical, evidence-based strategies',
            'Designed specifically for healthcare professionals',
          ],
        },
      ];
  }
};

export default function CourseContentScreen({ route, navigation }: any) {
  const { course }: { course: Course } = route.params;
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState(0);

  const modules = getCourseModules(course.id);
  const currentModule = modules[currentModuleIndex];

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    const progress = (completedModules.size / modules.length) * 100;
    setCourseProgress(progress);
    saveCourseProgress(progress);
  }, [completedModules, modules.length]);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(`course_${course.id}_completed_modules`);
      if (saved) {
        setCompletedModules(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
    }
  };

  const saveCourseProgress = async (progress: number) => {
    try {
      await AsyncStorage.setItem(`course_${course.id}_progress`, progress.toString());
      
      // Save completed modules
      await AsyncStorage.setItem(
        `course_${course.id}_completed_modules`,
        JSON.stringify([...completedModules])
      );

      // Update global course progress
      const allProgress = await AsyncStorage.getItem('courseProgress');
      const progressData = allProgress ? JSON.parse(allProgress) : {};
      progressData[course.id] = progress;
      await AsyncStorage.setItem('courseProgress', JSON.stringify(progressData));

      // Mark course as completed if all modules done
      if (progress === 100) {
        const completed = await AsyncStorage.getItem('completedCourses');
        const completedCourses = completed ? new Set(JSON.parse(completed)) : new Set();
        completedCourses.add(course.id);
        await AsyncStorage.setItem('completedCourses', JSON.stringify([...completedCourses]));
      }
    } catch (error) {
      console.error('Error saving course progress:', error);
    }
  };

  const completeModule = () => {
    const newCompleted = new Set(completedModules);
    newCompleted.add(currentModule.id);
    setCompletedModules(newCompleted);

    if (currentModuleIndex < modules.length - 1) {
      Alert.alert(
        'Module Complete! 🎉',
        'Great job! Ready for the next module?',
        [
          { text: 'Take a Break', style: 'cancel' },
          { text: 'Continue', onPress: () => setCurrentModuleIndex(currentModuleIndex + 1) },
        ]
      );
    } else {
      // Course completed
      Alert.alert(
        'Course Complete! 🎓',
        `Congratulations! You've completed "${course.title}". The strategies you've learned can make a real difference in preventing burnout.`,
        [
          { text: 'Back to Courses', onPress: () => navigation.goBack() },
          { text: 'Review Course', style: 'cancel' },
        ]
      );
    }
  };

  const navigateToModule = (index: number) => {
    setCurrentModuleIndex(index);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle-outline';
      case 'interactive': return 'extension-puzzle-outline';
      case 'exercise': return 'fitness-outline';
      default: return 'document-text-outline';
    }
  };

  const renderModuleNavigation = () => (
    <View style={styles.moduleNavigation}>
      <Text style={styles.navigationTitle}>Course Modules</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modulesList}>
        {modules.map((module, index) => {
          const isCompleted = completedModules.has(module.id);
          const isCurrent = index === currentModuleIndex;
          
          return (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleNavItem,
                isCurrent && styles.currentModuleNavItem,
                isCompleted && styles.completedModuleNavItem,
              ]}
              onPress={() => navigateToModule(index)}
            >
              <View style={styles.moduleNavIcon}>
                {isCompleted ? (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                ) : (
                  <Text style={styles.moduleNavNumber}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.moduleNavTitle,
                isCurrent && styles.currentModuleNavTitle,
              ]} numberOfLines={2}>
                {module.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderKeyTakeaways = () => (
    <View style={styles.takeawaysSection}>
      <Text style={styles.takeawaysTitle}>Key Takeaways</Text>
      {currentModule.keyTakeaways.map((takeaway, index) => (
        <View key={index} style={styles.takeawayItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.takeawayText}>{takeaway}</Text>
        </View>
      ))}
    </View>
  );

  const renderActionItems = () => {
    if (!currentModule.actionItems) return null;

    return (
      <View style={styles.actionSection}>
        <Text style={styles.actionTitle}>Action Items</Text>
        {currentModule.actionItems.map((action, index) => (
          <TouchableOpacity key={index} style={styles.actionItem}>
            <Ionicons name="square-outline" size={16} color={colors.primary} />
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={styles.progressText}>
            Module {currentModuleIndex + 1} of {modules.length} • {Math.round(courseProgress)}% complete
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${courseProgress}%`, backgroundColor: course.color }]} />
        </View>
      </View>

      {/* Module Navigation */}
      {renderModuleNavigation()}

      {/* Module Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.moduleHeader}>
          <View style={styles.moduleTypeContainer}>
            <Ionicons name={getModuleIcon(currentModule.type)} size={20} color={course.color} />
            <Text style={[styles.moduleType, { color: course.color }]}>
              {currentModule.type.charAt(0).toUpperCase() + currentModule.type.slice(1)}
            </Text>
          </View>
          <Text style={styles.moduleDuration}>{currentModule.duration}</Text>
        </View>

        <Text style={styles.moduleTitle}>{currentModule.title}</Text>

        <View style={styles.moduleContent}>
          <Text style={styles.contentText}>{currentModule.content}</Text>
        </View>

        {renderKeyTakeaways()}
        {renderActionItems()}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.previousButton]}
          onPress={() => setCurrentModuleIndex(Math.max(0, currentModuleIndex - 1))}
          disabled={currentModuleIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentModuleIndex === 0 ? colors.textSecondary : colors.primary} 
          />
          <Text style={[
            styles.controlButtonText,
            currentModuleIndex === 0 && styles.disabledButtonText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.completeButton, { backgroundColor: course.color }]}
          onPress={completeModule}
        >
          <Text style={styles.completeButtonText}>
            {completedModules.has(currentModule.id) 
              ? 'Completed' 
              : currentModuleIndex === modules.length - 1 
                ? 'Complete Course' 
                : 'Complete Module'
            }
          </Text>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.nextButton]}
          onPress={() => setCurrentModuleIndex(Math.min(modules.length - 1, currentModuleIndex + 1))}
          disabled={currentModuleIndex === modules.length - 1}
        >
          <Text style={[
            styles.controlButtonText,
            currentModuleIndex === modules.length - 1 && styles.disabledButtonText
          ]}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentModuleIndex === modules.length - 1 ? colors.textSecondary : colors.primary} 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  moduleNavigation: {
    backgroundColor: colors.background,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  navigationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modulesList: {
    paddingLeft: 20,
  },
  moduleNavItem: {
    width: 120,
    marginRight: 12,
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentModuleNavItem: {
    backgroundColor: colors.primary + '20',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completedModuleNavItem: {
    backgroundColor: colors.success + '20',
  },
  moduleNavIcon: {
    marginBottom: 8,
  },
  moduleNavNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  moduleNavTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  currentModuleNavTitle: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  moduleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleType: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  moduleDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 30,
  },
  moduleContent: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  takeawaysSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  takeawaysTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  takeawayText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  previousButton: {
    backgroundColor: colors.cardBackground,
  },
  nextButton: {
    backgroundColor: colors.cardBackground,
  },
  completeButton: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});