import sys
import os

# Add the parent directory to Python path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Course, CourseModule
import uuid
from datetime import datetime

def seed_all_courses():
    """Comprehensive seeding of all courses and modules from the PDF"""
    db = SessionLocal()
    
    try:
        # Clear existing courses (optional - remove if you want to keep existing data)
        # db.query(CourseModule).delete()
        # db.query(Course).delete()
        
        # =====================================
        # CORE BURNOUT PREVENTION COURSES
        # =====================================
        
        # 1. WHAT IS BURNOUT COURSE
        burnout_basics = Course(
            id="what-is-burnout",
            title="Understanding Burnout",
            description="Learn the fundamentals of burnout - what it is, how to recognize it, and why it affects healthcare professionals.",
            duration="12 min",
            difficulty="Beginner",
            icon="alert-circle-outline",
            color="#FF6B6B",
            category="core",
            modules_count=3,
            sort_order=1
        )
        db.add(burnout_basics)
        
        burnout_modules = [
            {
                "module_id": "burnout-definition",
                "title": "What is Burnout?",
                "content": """Welcome to 'What Is Burnout?' I'm Dr. ..., and in this session, we'll explore what burnout really means, how to recognize it, and why understanding it matters.

Burnout isn't just about being tired or having a rough week. It's a state of emotional, physical, and mental exhaustion caused by prolonged and excessive stress—especially in caregiving professions.

The World Health Organization defines burnout as an occupational phenomenon, not a medical condition. It includes three core dimensions:

**Emotional Exhaustion:** You feel drained and depleted, like you're running on empty no matter how much you rest.

**Depersonalization (or Cynicism):** You begin to feel detached, distant, or even numb toward the people you're caring for—colleagues, patients, or clients.

**Reduced Personal Accomplishment:** You doubt the value of your work. Even when things go well, you might feel like it's never enough or that you're failing at your job.""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Burnout is emotional, physical, and mental exhaustion from prolonged stress",
                    "Three key dimensions: emotional exhaustion, depersonalization, reduced accomplishment",
                    "It's an occupational phenomenon, not a medical condition",
                    "WHO recognizes burnout as a workplace issue, not personal failure"
                ]
            },
            {
                "module_id": "recognizing-burnout",
                "title": "Recognizing Burnout Signs",
                "content": """Burnout develops gradually. You may start by saying yes to everything, skipping breaks, pushing through illness. But over time, the stress compounds. What once felt meaningful begins to feel like a burden.

Let's take a moment to reflect:
• Have you noticed yourself feeling unusually irritable or emotionally flat at work?
• Do you dread tasks that used to energize you?
• Are you struggling to find meaning or connection in your work?

These may be early signs of burnout (not just) stress, but a signal that your capacity to engage, connect, and recover is being overwhelmed.""",
                "duration": "3 min",
                "module_type": "interactive",
                "sort_order": 1,
                "key_takeaways": [
                    "Burnout develops gradually over time",
                    "Early signs include irritability, emotional flatness, and loss of meaning",
                    "Dreading previously energizing tasks is a warning sign",
                    "These signals indicate overwhelmed capacity to engage and recover"
                ]
            },
            {
                "module_id": "burnout-in-healthcare",
                "title": "Burnout in Healthcare Settings",
                "content": """Now, it's important to know: burnout isn't a personal failure. It's often a sign that something systemic needs attention, whether it's workload, lack of support, blurred boundaries, or values misalignment.

For healthcare professionals, burnout can show up in specific ways:
• Diminished empathy toward patients
• Increased medical errors or documentation fatigue
• Avoidance of difficult conversations
• Isolation from colleagues or feeling unsupported

The good news is, burnout is not permanent. With the right support, boundaries, self-awareness, and system changes, it can be addressed.

In upcoming sessions, we'll explore how to build emotional resilience, reconnect with your purpose, and create sustainable practices to protect your wellbeing.

Thank you for taking the first step by simply understanding what burnout is. Awareness is the beginning of change.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Burnout indicates systemic issues, not personal failure",
                    "Healthcare-specific signs: reduced empathy, increased errors, avoidance",
                    "Burnout is treatable and not permanent",
                    "Recovery requires support, boundaries, and system changes"
                ]
            }
        ]
        
        for module_data in burnout_modules:
            module = CourseModule(course_id="what-is-burnout", **module_data)
            db.add(module)
        
        # 2. KNOW YOUR WHY: VALUES-BASED PREVENTION
        values_course = Course(
            id="know-your-why",
            title="Know Your Why: Values-Based Burnout Prevention",
            description="Connect with your core values to build resilience and prevent burnout through meaningful work.",
            duration="15 min",
            difficulty="Beginner",
            icon="heart-outline",
            color="#4ECDC4",
            category="core",
            modules_count=2,
            sort_order=2
        )
        db.add(values_course)
        
        values_modules = [
            {
                "module_id": "discovering-values",
                "title": "Discovering Your Values",
                "content": """Welcome to 'Know Your Why,' a guided reflection on using your values to prevent burnout. I'm Dr. ..., and I'll be guiding you through this exercise.

As healthcare professionals, we often focus on what we do, but rarely pause to consider why we do it. Yet research shows that connecting with our values is one of the strongest protections against burnout.

Let's begin with a simple visualization. Close your eyes if you're comfortable doing so. Imagine it's your 80th birthday celebration. People from throughout your life are gathered. One by one, they stand to speak about what you've meant to them and the impact you've had. What would you most want them to say?

The things you imagined weren't about achievements or status, were they? They were likely about how you made others feel, the values you stood for, and the difference you made.

This exercise reveals what truly matters to you. For healthcare professionals, common values include compassion, excellence, integrity, growth, and meaningful connection. But your particular combination is unique to you.""",
                "duration": "7 min",
                "module_type": "interactive",
                "sort_order": 0,
                "key_takeaways": [
                    "Connecting with values is one of the strongest protections against burnout",
                    "Values are about impact and meaning, not achievements",
                    "Common healthcare values: compassion, excellence, integrity, growth",
                    "Your unique combination of values guides your purpose"
                ]
            },
            {
                "module_id": "living-values-daily",
                "title": "Living Your Values Daily",
                "content": """Now, let's bring this into your daily work. When you start your day, take 30 seconds to set an intention based on your values. For example: 'Today, I'll practice compassion toward my patients and colleagues, even in challenging moments.'

Throughout your day, notice activities that align with your values and those that don't. Even in administrative tasks, you can engage your values. Filing paperwork with attention and care reflects excellence. Having a difficult conversation with integrity honors your values.

Remember, living your values isn't about perfection—it's about direction. Small, daily choices add up to a meaningful career and life.

Before we end, take a moment to identify one specific way you'll engage your values tomorrow.

Thank you for your time today. By connecting with what matters most to you, you've taken an important step toward preventing burnout and building resilience.""",
                "duration": "8 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Daily values practice starts with 30-second morning intentions",
                    "Values can be engaged even in routine administrative tasks",
                    "Direction matters more than perfection",
                    "Small daily choices create meaningful careers"
                ],
                "action_items": [
                    "Set a values-based intention each morning",
                    "Notice which activities align with your values",
                    "Identify one specific way to engage values tomorrow",
                    "Practice evening reflection on values alignment"
                ]
            }
        ]
        
        for module_data in values_modules:
            module = CourseModule(course_id="know-your-why", **module_data)
            db.add(module)
        
        # 3. STRESS SIGNALS RECOGNITION
        stress_signals = Course(
            id="stress-signals-recognition",
            title="Stress Signals: Recognizing Your Personal Warning Signs",
            description="Learn to identify your unique stress signals before they escalate to burnout.",
            duration="10 min",
            difficulty="Beginner",
            icon="warning-outline",
            color="#FF9500",
            category="core",
            modules_count=2,
            sort_order=3
        )
        db.add(stress_signals)
        
        stress_modules = [
            {
                "module_id": "understanding-stress-signals",
                "title": "Understanding Your Stress Signals",
                "content": """Hello and welcome to 'Stress Signals.' I'm Dr. ..., and today we're exploring how to recognize your personal warning signs of stress before they escalate to burnout.

As healthcare professionals, we're trained to notice symptoms in others, but often miss the signs in ourselves. Many of us have normalized high levels of stress, making it even harder to recognize when we're approaching our limits.

Stress manifests differently for each person, but research shows that our bodies and minds give us clear signals when we're under too much pressure. These signals fall into four main categories:

**Physical signs:** These might include tension headaches, digestive issues, sleep disturbances, racing heart, or shallow breathing. For some, chronic pain intensifies during high-stress periods.

**Emotional signs:** Irritability is often the first emotional indicator—when small annoyances feel overwhelming. Other emotional signs include anxiety, feeling numb or detached, decreased patience with patients or colleagues, or tearfulness.

**Cognitive signs:** You might notice difficulty concentrating, forgetfulness, negative thought patterns, reduced decision-making abilities, or obsessive worrying.

**Behavioral signs:** These include changes in appetite, increased use of caffeine, alcohol, or other substances, withdrawing from social activities, or procrastination.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Healthcare professionals often miss stress signs in themselves",
                    "Stress signals fall into four categories: physical, emotional, cognitive, behavioral",
                    "Irritability is often the first emotional warning sign",
                    "Each person has unique stress manifestations"
                ]
            },
            {
                "module_id": "personal-stress-mapping",
                "title": "Mapping Your Personal Stress Signals",
                "content": """Now, let's identify your personal stress signals. What are the first three signs that appear when you're under pressure? These are your early warning signs—your body and mind's way of saying 'pay attention.'

Next, what signs appear when stress has become more severe? These are your serious warning signs that require immediate intervention.

Creating awareness of these personal signals is powerful. It allows you to implement stress-reduction strategies before burnout develops. Try keeping a 'stress log' for a week, noting when these signals appear and what triggers them.

Remember that recognizing stress isn't a sign of weakness—it's a skill that protects your wellbeing and allows you to provide better care to your patients.

Thank you for investing this time in understanding your stress signals. In our next session, we'll explore effective strategies for responding to these signs.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Early warning signs require attention, not immediate intervention",
                    "Serious warning signs demand immediate stress-reduction strategies",
                    "Stress awareness is a protective skill, not a weakness",
                    "Stress logs help identify patterns and triggers"
                ],
                "action_items": [
                    "Identify your top 3 early warning stress signals",
                    "Recognize your serious warning signs",
                    "Keep a stress log for one week",
                    "Note triggers that activate your stress signals"
                ]
            }
        ]
        
        for module_data in stress_modules:
            module = CourseModule(course_id="stress-signals-recognition", **module_data)
            db.add(module)
        
        # 4. POSITIVE REFRAMING
        reframing_course = Course(
            id="positive-reframing",
            title="Positive Reframing: Cognitive Strategies for Stressful Situations",
            description="Transform your experience of stressful situations through evidence-based cognitive techniques.",
            duration="12 min",
            difficulty="Intermediate",
            icon="refresh-outline",
            color="#34C759",
            category="core",
            modules_count=2,
            sort_order=4
        )
        db.add(reframing_course)
        
        reframing_modules = [
            {
                "module_id": "thought-patterns",
                "title": "Common Thought Patterns in Healthcare",
                "content": """Welcome to 'Positive Reframing.' I'm Dr. ..., and today we're exploring cognitive strategies that can transform your experience of stressful situations.

As healthcare professionals, we face numerous challenges daily—difficult patients, system inefficiencies, high-stakes decisions, and the emotional weight of suffering. While we can't always change these circumstances, we can change how we interpret and respond to them.

Our thoughts about situations directly influence our emotional reactions and stress levels. When we engage in negative thought patterns like catastrophizing, black-and-white thinking, or personalizing, we amplify our stress response.

Let's explore four common thought patterns in healthcare and how to reframe them:

**Pattern one: Catastrophizing.** This is assuming the worst possible outcome will occur. For example: 'If I make a mistake, my career is over.'

Reframe: 'Mistakes are part of being human. I can learn from them, make corrections when possible, and remember all the times I've provided excellent care.'

**Pattern two: Black-and-white thinking.** This is seeing situations as all good or all bad. For example: 'If I'm not the perfect clinician, I'm failing my patients.'

Reframe: 'Excellence doesn't require perfection. I can be both a skilled clinician who makes occasional mistakes AND a valuable healthcare provider.'

**Pattern three: Shoulding.** This involves rigid rules about how things should be. For example: 'The system should work more efficiently. I shouldn't need help.'

Reframe: 'While improvements would be beneficial, I can only control my response to the current reality. Accepting help allows me to provide better care.'""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Thoughts directly influence emotional reactions and stress levels",
                    "Catastrophizing assumes worst outcomes; reframe with balanced perspective",
                    "Black-and-white thinking lacks nuance; excellence doesn't require perfection",
                    "Shoulding creates rigid expectations; focus on what you can control"
                ]
            },
            {
                "module_id": "reframing-practice",
                "title": "Practicing Cognitive Reframing",
                "content": """**Pattern four: Personalization.** This is taking excessive responsibility. For example: 'If my patient isn't improving, I must be doing something wrong.'

Reframe: 'Many factors influence patient outcomes, most outside my control. I'm providing evidence-based care with compassion, which is all I can do.'

**To practice reframing, try this three-step process:**

First, notice the thought. Awareness is the essential first step.

Second, examine the evidence. Is this thought actually true? What evidence contradicts it?

Third, create a balanced alternative that acknowledges reality while being compassionate to yourself.

I encourage you to identify one recurring negative thought and practice reframing it this week. Remember, the goal isn't forced positivity—it's creating a more accurate, nuanced perspective that serves your wellbeing.

With practice, cognitive reframing becomes natural, reducing your stress response and building resilience even in challenging circumstances.

Thank you for your attention today. By caring for your thoughts, you're caring for yourself and ultimately, your patients.""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Personalization takes excessive responsibility for outcomes beyond control",
                    "Three-step reframing: notice, examine evidence, create balanced alternative",
                    "Goal is accurate perspective, not forced positivity",
                    "Regular practice makes reframing natural and automatic"
                ],
                "action_items": [
                    "Identify one recurring negative thought pattern",
                    "Practice the three-step reframing process daily",
                    "Examine evidence for and against negative thoughts",
                    "Create compassionate, balanced alternative thoughts"
                ]
            }
        ]
        
        for module_data in reframing_modules:
            module = CourseModule(course_id="positive-reframing", **module_data)
            db.add(module)
        
        # 5. COMPASSIONATE BOUNDARIES
        boundaries_course = Course(
            id="compassionate-boundaries",
            title="Boundaries: The Art of Compassionate Limits",
            description="Learn how healthy boundaries protect both you and those you care for.",
            duration="15 min",
            difficulty="Intermediate",
            icon="shield-outline",
            color="#007AFF",
            category="core",
            modules_count=2,
            sort_order=5
        )
        db.add(boundaries_course)
        
        boundaries_modules = [
            {
                "module_id": "understanding-boundaries",
                "title": "Understanding Healthy Boundaries",
                "content": """Welcome to 'Boundaries: The Art of Compassionate Limits.' I'm Dr. ..., and today we're exploring how healthy boundaries protect both you and those you care for.

As healthcare professionals, we're drawn to helping others, sometimes at our own expense. Many of us believe that setting boundaries means we're less compassionate or dedicated. In reality, boundaries are essential for sustainable caregiving and preventing burnout.

Boundaries are the limits and rules we set for ourselves and others. They define where we end and others begin. In healthcare, boundaries can be:

**Professional:** the scope of your clinical responsibilities
**Temporal:** your working hours and availability
**Emotional:** the degree of emotional involvement with patients
**Physical:** your personal space and energy reserves

Let's address a common misconception: boundaries aren't walls that disconnect you from patients or colleagues. They're filters that allow you to be present and effective without becoming depleted.""",
                "duration": "7 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Boundaries are essential for sustainable caregiving, not selfish",
                    "Four types: professional, temporal, emotional, and physical",
                    "Boundaries are filters, not walls - they enable presence without depletion",
                    "Common misconception: boundaries reduce compassion (they actually preserve it)"
                ]
            },
            {
                "module_id": "boundary-strategies",
                "title": "Five Boundary Strategies for Healthcare",
                "content": """Here are five boundary strategies specifically for healthcare settings:

**First, clarify your role.** Know what responsibilities are truly yours and which belong to others. When asked to take on tasks outside your role, practice saying: 'That's outside my scope of practice, but I can connect you with someone who can help.'

**Second, manage time boundaries.** If your shift ends at 7:00, schedule your last patient at 6:15. Plan your transition out of work with the same intention you plan your clinical day.

**Third, develop emotional boundaries.** Compassion doesn't require taking on patients' emotional states. Practice compassionate detachment by acknowledging 'This is their pain, not mine. I can support without absorbing.'

**Fourth, create transition rituals between work and home.** This might be changing clothes, taking a different route home, or a brief mindfulness practice to symbolically leave work behind.

**Fifth, practice clear communication about your limits.** Instead of vague statements, be specific: 'I'm not available after 6pm, but I'll respond to your message first thing tomorrow' or 'I can't take on another committee, as it would impact the quality of my current responsibilities.'

Now, let's address the guilt that often accompanies boundary-setting. Remember that boundaries don't just protect you—they protect your ability to provide quality care over the long term. By preventing burnout, you ensure your patients have access to your skills and compassion for years to come.

I encourage you to identify one boundary you need to strengthen. What's one small step you could take this week to maintain that boundary?

Thank you for your commitment to compassionate, sustainable care. By honoring your limits, you honor your calling to heal.""",
                "duration": "8 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Role clarity prevents scope creep and overcommitment",
                    "Time boundaries require intentional planning and communication",
                    "Emotional boundaries allow support without absorption",
                    "Boundaries protect long-term ability to provide quality care"
                ],
                "action_items": [
                    "Identify one boundary that needs strengthening",
                    "Practice clear, specific communication about limits",
                    "Create a transition ritual between work and home",
                    "Take one small step this week to maintain a boundary"
                ]
            }
        ]
        
        for module_data in boundaries_modules:
            module = CourseModule(course_id="compassionate-boundaries", **module_data)
            db.add(module)
        
        # =====================================
        # QUICK WINS MINI-COURSES
        # =====================================
        
        # 6. MICRO-RESILIENCE
        micro_resilience = Course(
            id="micro-resilience",
            title="Micro-Resilience: Two-Minute Stress Reducers",
            description="Six evidence-based stress reduction techniques you can use in just two minutes during your busy day.",
            duration="10 min",
            difficulty="Beginner",
            icon="timer-outline",
            color="#45B7D1",
            category="quick-wins",
            modules_count=2,
            sort_order=1
        )
        db.add(micro_resilience)
        
        micro_modules = [
            {
                "module_id": "breathing-physical",
                "title": "Breathing & Physical Techniques",
                "content": """Welcome to Micro-Resilience. I'm Dr. Jennifer, and I'll be sharing six evidence-based stress reduction techniques you can use in just two minutes during your busy day.

**Technique one: Box Breathing.** Find a comfortable position and follow my lead. Inhale for a count of four. Hold for four. Exhale for four. Hold for four. Let's repeat this cycle three more times. Box breathing activates your parasympathetic nervous system, reducing cortisol levels and heart rate within just a few cycles.

**Technique two: Progressive Muscle Relaxation.** Starting with your shoulders, tense them tightly, hold for five seconds, then release. Notice the difference between tension and relaxation. Now do the same with your jaw, then your hands. This technique breaks the physical stress cycle and releases muscle tension that accumulates during procedures or patient care.

**Technique three: Mindful Hand-Washing.** During your next hand-washing, bring full attention to the sensations—the temperature of the water, the texture of soap, the movement of your hands. This transforms a routine task into a mindful break.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 0,
                "key_takeaways": [
                    "Box breathing reduces cortisol and heart rate in minutes",
                    "Progressive muscle relaxation breaks the physical stress cycle",
                    "Mindful hand-washing turns routine into mindfulness practice",
                    "These techniques work because of their immediate physiological effects"
                ]
            },
            {
                "module_id": "mental-emotional",
                "title": "Mental & Emotional Techniques",
                "content": """**Technique four: Gratitude Moment.** Briefly identify three specific things you're grateful for right now. They can be simple: a supportive colleague, a moment of connection with a patient, or even your cup of coffee. Practicing gratitude activates positive neural pathways and counters the negativity bias that can develop during challenging shifts.

**Technique five: Sensory Grounding.** Name five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste. This exercise anchors you in the present moment and interrupts rumination or anxiety.

**Technique six: Values Reconnection.** Take three deep breaths, then ask yourself: 'What matters to me in this moment?' Connect with one of your core values, whether it's compassion, excellence, or making a difference. This brief reflection restores meaning during difficult days.

The power of these techniques lies not in their duration but in their regular practice. Try setting an intention to use one micro-resilience strategy every few hours during your next shift.

Which technique resonated most with you? Consider starting with that one tomorrow.

Thank you for investing these few minutes in your wellbeing. Remember, small practices add up to significant resilience over time.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Gratitude practice activates positive neural pathways",
                    "Sensory grounding interrupts anxiety and rumination",
                    "Values reconnection restores meaning during difficult times",
                    "Regular practice is more important than duration"
                ],
                "action_items": [
                    "Choose one technique to start with tomorrow",
                    "Set intention to use micro-resilience every few hours",
                    "Practice gratitude with three specific items daily",
                    "Use sensory grounding when feeling overwhelmed"
                ]
            }
        ]
        
        for module_data in micro_modules:
            module = CourseModule(course_id="micro-resilience", **module_data)
            db.add(module)
        
        # 7. MICROBREAKS RENEWAL
        microbreaks_course = Course(
            id="microbreaks-renewal",
            title="Microbreaks: Renewal Between Patients",
            description="Quick physical and cognitive reset practices for busy healthcare days.",
            duration="8 min",
            difficulty="Beginner",
            icon="refresh-circle-outline",
            color="#32D74B",
            category="quick-wins",
            modules_count=2,
            sort_order=2
        )
        db.add(microbreaks_course)
        
        microbreaks_modules = [
            {
                "module_id": "physical-exercises",
                "title": "Physical Reset Exercises",
                "content": """Welcome to Microbreaks: Renewal Between Patients. These quick exercises can help you reset physically and mentally during your busy day.

**Standing Stretch Sequence:**
- Reach arms overhead and stretch for 10 seconds
- Roll shoulders backward 5 times
- Gentle neck side stretches (hold 5 seconds each side)
- Forward fold to release lower back tension

**Eye Rest:**
- Look away from screens/close work
- Focus on something 20 feet away for 20 seconds
- Blink slowly 10 times to relubricate eyes
- Palm covering for 30 seconds in darkness

**Hand and Wrist Release:**
- Wrist circles (5 each direction)
- Finger stretches and gentle pulls
- Prayer stretch (palms together, lower hands)
- Shake out hands and fingers

**Shoulder Roll Sequence:**
- 5 forward rolls, 5 backward rolls
- Shoulder blade squeezes (hold 5 seconds)
- Cross-body arm stretch (hold 15 seconds each arm)

**Box Breathing Exercises:**
- 4 counts in, 4 hold, 4 out, 4 hold
- Repeat 4-6 cycles for maximum benefit
- Can be done anywhere, anytime""",
                "duration": "4 min",
                "module_type": "exercise",
                "sort_order": 0,
                "key_takeaways": [
                    "Physical microbreaks prevent repetitive strain and tension buildup",
                    "Eye rest is crucial for those doing close work or screen time",
                    "Hand and wrist exercises prevent occupational strain injuries",
                    "Breathing exercises can be done discretely anywhere"
                ]
            },
            {
                "module_id": "cognitive-reset",
                "title": "Mental and Emotional Reset",
                "content": """**Mindful Observation:** Take 40 seconds to 5 minutes when possible to simply observe your environment without judgment. Notice colors, textures, sounds, or movement. This brief mindfulness practice can reset your mental state.

**Social Connection Reminder:** Take a moment to call, text, or think about a loved one. Even a 30-second mental connection to your support system can provide grounding and perspective during stressful moments.

**Mental Visualization:** Briefly imagine a calming place or a moment of gratitude. This could be a peaceful beach, a favorite hiking trail, or a meaningful memory with family. Visualization activates the same neural pathways as actual experiences.

**Creative Mini-Challenge:** Engage a different part of your brain with a quick creative exercise, such as:
- Recalling 5 songs you loved as a teenager
- Naming animals that start with each letter of your name
- Thinking of 3 things you're looking forward to this week
- Visualizing your ideal vacation destination

These cognitive breaks help prevent mental fatigue and maintain creative problem-solving abilities throughout your shift.

**Implementation Tip:** Even a 40-second mindful pause can help, but optimal benefit comes from 5-25 minutes when possible. The key is consistency rather than duration.""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "Mindful observation resets mental state without special preparation",
                    "Social connection, even briefly, provides grounding and perspective",
                    "Visualization activates same neural pathways as real experiences",
                    "Creative challenges prevent mental fatigue and maintain cognitive flexibility"
                ],
                "action_items": [
                    "Try one physical and one cognitive microbreak today",
                    "Set reminders for microbreaks every 2-3 hours",
                    "Identify your preferred visualization location",
                    "Practice 40-second mindful pauses between patients"
                ]
            }
        ]
        
        for module_data in microbreaks_modules:
            module = CourseModule(course_id="microbreaks-renewal", **module_data)
            db.add(module)
        
        # =====================================
        # SPECIALTY-SPECIFIC COURSES
        # =====================================
        
        # 8. SLEEP HYGIENE FOR SHIFT WORKERS
        sleep_course = Course(
            id="sleep-hygiene-shift-workers",
            title="Sleep Hygiene for Shift Workers",
            description="Evidence-based strategies for quality sleep despite challenging healthcare schedules.",
            duration="25 min",
            difficulty="Intermediate",
            icon="moon-outline",
            color="#9B59B6",
            category="specialty",
            modules_count=6,
            sort_order=1
        )
        db.add(sleep_course)
        
        sleep_modules = [
            {
                "module_id": "sleep-environment",
                "title": "Optimizing Your Sleep Environment",
                "content": """Sleep is the foundation of wellbeing, yet for many healthcare professionals, quality sleep remains elusive. Whether you're working overnight shifts, early mornings, or rotating schedules, your circadian rhythm faces constant challenges. This guide offers evidence-based strategies specifically designed for healthcare shift workers.

**Environmental Modifications**

Your sleep environment should be:

**Completely dark:** Use blackout curtains or a sleep mask, especially when sleeping during daylight. Even small amounts of light can suppress melatonin production.

**Cool:** The ideal temperature for sleep is between 60-67°F (15-19°C). Body temperature naturally drops during sleep, and a cool environment facilitates this process.

**Quiet:** Consider using earplugs or a white noise machine to block daytime sounds. For those living with others who are awake during your sleep time, a white noise machine near your door can mask household sounds.

**Phone-free:** The blue light from devices suppresses melatonin, making it harder to fall asleep. Keep your phone outside your bedroom, or at minimum, use night mode and avoid checking it before sleep.""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Sleep environment should be dark, cool, quiet, and phone-free",
                    "Even small amounts of light can suppress melatonin production",
                    "Ideal sleep temperature is 60-67°F (15-19°C)",
                    "Blue light from devices disrupts sleep onset"
                ]
            },
            {
                "module_id": "pre-sleep-routines",
                "title": "Pre-Sleep Routines for Shift Workers",
                "content": """When working shifts, consistency in your pre-sleep ritual is crucial, even if the time of day varies. Your body learns to associate these activities with sleep:

• Create a 30-minute wind-down routine that signals to your body that it's time to sleep
• Take a warm shower or bath (the subsequent drop in body temperature promotes sleep)
• Practice relaxation techniques like progressive muscle relaxation
• Avoid caffeine within 8 hours of your planned sleep time
• Limit alcohol, which disrupts REM sleep and causes fragmented sleep cycles""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "Consistent pre-sleep routine works regardless of time of day",
                    "30-minute wind-down signals sleep time to your body",
                    "Warm bath/shower promotes sleep through temperature drop",
                    "Avoid caffeine 8 hours before sleep, limit alcohol"
                ]
            },
            {
                "module_id": "night-shift-strategies",
                "title": "Strategies for Night Shift Workers",
                "content": """Night shifts present particular challenges for your circadian rhythm:

• Wear blue-light blocking glasses during your late shift, especially in the last few hours
• Keep your brightest light exposure during the first half of your shift
• Consider using melatonin strategically (consult your physician for appropriate timing)
• Maintain complete darkness during your daytime sleep
• Use 'Do Not Disturb' signs and inform household members of your sleep schedule
• Consider a 'transition nap'—a short 20-30 minute nap before your night shift""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Blue-light blocking glasses help in late shift hours",
                    "Brightest light exposure should be in first half of shift",
                    "Wear sunglasses when commuting home after night shift",
                    "Short transition naps (20-30 min) can help before night shifts"
                ]
            },
            {
                "module_id": "rotating-shifts",
                "title": "Approaches for Rotating Shifts",
                "content": """Rotating shifts are particularly challenging for your circadian system:

• When transitioning to night shifts, try to gradually delay your bedtime over several days before
• After night shifts, sleep as soon as possible
• Limit your morning exposure to bright light by wearing sunglasses on your commute home
• For the fastest recovery after night shifts, some research suggests sleeping for a shorter period (4-5 hours) after your shift, staying awake for the remainder of the day, then going to bed early that evening""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 3,
                "key_takeaways": [
                    "Gradual bedtime delays help with night shift transitions",
                    "Sleep immediately after night shifts when possible",
                    "Limit morning light exposure after night work",
                    "Short recovery sleep may help faster circadian reset"
                ]
            },
            {
                "module_id": "nutrition-sleep",
                "title": "Nutrition and Sleep for Shift Workers",
                "content": """What and when you eat affects sleep quality:

• Avoid heavy meals within 3 hours of sleep
• Consider a light, protein-containing snack if hungry before sleep
• Stay well-hydrated during your shift, but taper fluid intake in the hours before sleep
• Be strategic with caffeine: use early in your shift and switch to non-caffeinated beverages later""",
                "duration": "4 min",
                "module_type": "reading",
                "sort_order": 4,
                "key_takeaways": [
                    "Avoid heavy meals 3 hours before sleep",
                    "Light protein snacks are okay if hungry before sleep",
                    "Taper fluid intake before sleep to avoid disruptions",
                    "Strategic caffeine use: early in shift, avoid later"
                ]
            },
            {
                "module_id": "when-seek-help",
                "title": "When to Seek Professional Help",
                "content": """While these strategies can significantly improve sleep quality, shift work does place unavoidable stress on your circadian system. Consider consulting a sleep specialist if:

• You've implemented these strategies consistently for 3-4 weeks without improvement
• You experience excessive daytime sleepiness despite adequate sleep time
• You have symptoms of sleep apnea (snoring, gasping, witnessed breathing pauses)
• Sleep difficulties are significantly impacting your wellbeing or performance

Remember that while these strategies can significantly improve sleep quality, shift work does place unavoidable stress on your circadian system. Be compassionate with yourself and prioritize sleep recovery on your days off.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 5,
                "key_takeaways": [
                    "Seek help if no improvement after 3-4 weeks of consistent practice",
                    "Excessive sleepiness despite adequate sleep time warrants evaluation",
                    "Sleep apnea symptoms require professional assessment",
                    "Shift work inherently stresses circadian systems - be compassionate"
                ],
                "action_items": [
                    "Implement one environmental modification this week",
                    "Establish a consistent 30-minute pre-sleep routine",
                    "Try strategic caffeine timing during your next shift",
                    "Consider professional help if sleep doesn't improve"
                ]
            }
        ]
        
        for module_data in sleep_modules:
            module = CourseModule(course_id="sleep-hygiene-shift-workers", **module_data)
            db.add(module)
        
        # 9. EFFECTIVE DELEGATION
        delegation_course = Course(
            id="effective-delegation",
            title="Effective Delegation: Working Smarter, Not Harder",
            description="Master the art of strategic delegation to prevent burnout and maximize efficiency.",
            duration="20 min",
            difficulty="Intermediate",
            icon="people-outline",
            color="#AF52DE",
            category="specialty",
            modules_count=4,
            sort_order=2
        )
        db.add(delegation_course)
        
        delegation_modules = [
            {
                "module_id": "delegation-barriers",
                "title": "Understanding Delegation Barriers",
                "content": """Welcome to 'Effective Delegation.' Today we'll explore how to work smarter, not harder, through strategic delegation.

For many healthcare professionals, delegation is challenging. We're trained to be highly responsible, detail-oriented, and self-reliant. However, effective delegation is essential for preventing burnout, maximizing efficiency, and developing team capabilities.

Let's begin by addressing common barriers to delegation:

**First, perfectionism.** 'Striving for unrealistic expectations or holding a personal philosophy that demands flawlessness from oneself and/or others' leads to task overload. Remember, something done 80% as well by someone else still frees your time for tasks only you can perform.

**Second, guilt.** Many feel they're 'dumping work' on others. Reframe delegation as development; you're providing growth opportunities and demonstrating trust in your colleagues' capabilities.

**Third, uncertainty about what to delegate.** This leads to either delegating too little or inappropriate tasks.

To overcome these barriers, let's explore a systematic approach to effective delegation.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Healthcare professionals often struggle with delegation due to training",
                    "Perfectionism leads to task overload - 80% by others frees you for essential tasks",
                    "Reframe delegation as development, not burden",
                    "Systematic approach overcomes uncertainty about what to delegate"
                ]
            },
            {
                "module_id": "task-person-analysis",
                "title": "Task and Person Analysis",
                "content": """**Step one: Task Analysis.** Review your responsibilities and categorize them:

• Tasks only you can legally or practically perform
• Tasks others could do with some training or guidance  
• Tasks others could easily perform now

For healthcare professionals, this might include differentiating between clinical judgments that require your expertise and routine procedures or documentation that could be appropriately delegated.

**Step two: Person Analysis.** Consider:

• Who has the skills for this task?
• Who might benefit from developing these skills?
• Who has the time and resources?
• Whose role aligns with this responsibility?""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Categorize tasks by delegation appropriateness and skill requirements",
                    "Distinguish between clinical expertise tasks and routine procedures",
                    "Consider skills, development potential, availability, and role alignment",
                    "Match tasks to people based on multiple factors, not just availability"
                ]
            },
            {
                "module_id": "communication-followup",
                "title": "Clear Communication and Follow-up",
                "content": """**Step three: Clear Communication.** When delegating, include:

• The specific task and desired outcome
• The importance and context of the task
• Any constraints or parameters
• Timeline and deadlines
• Available resources and support
• Check-in points
• How you'd like to be updated

For example, rather than saying "Could you help with dinner tonight?", try "Would you be able to prepare the salad and set the table by 7pm? I've already marinated the chicken. If you have any questions, I'll be in the kitchen until 6:30 and you can text me after that."

**Step four: Appropriate Follow-up.** This ensures quality without micromanaging:

• Schedule check-ins proportional to the task's complexity and the person's experience
• Provide specific, balanced feedback
• Express gratitude for the person's contribution""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Clear communication includes context, constraints, timeline, and resources",
                    "Specific examples work better than vague requests",
                    "Follow-up should match task complexity and person's experience",
                    "Balanced feedback and gratitude maintain positive delegation relationships"
                ]
            },
            {
                "module_id": "delegation-practice",
                "title": "Putting Delegation into Practice",
                "content": """Now, let's practice. Identify one task you currently perform that could potentially be delegated. Who might be appropriate to take on this responsibility? What specific information would they need to succeed?

Remember, effective delegation isn't about offloading work—it's about strategically distributing responsibilities to optimize team performance and prevent burnout. By delegating appropriately, you create space for your unique contributions while developing your team's capabilities.

**Key Implementation Steps:**

1. Start small with low-risk tasks to build confidence
2. Provide clear instructions and context
3. Allow for questions and clarification
4. Follow up appropriately without micromanaging
5. Acknowledge and appreciate good work

Thank you for exploring this important skill with me today. I encourage you to identify one task to delegate this week as a first step toward working smarter, not harder.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 3,
                "key_takeaways": [
                    "Delegation optimizes team performance and prevents individual burnout",
                    "Start with low-risk tasks to build delegation confidence",
                    "Strategic delegation creates space for unique contributions",
                    "Team development is a key benefit of effective delegation"
                ],
                "action_items": [
                    "Identify one task suitable for delegation this week",
                    "Choose the right person based on skills and development needs",
                    "Prepare clear instructions including context and expectations",
                    "Schedule appropriate follow-up without micromanaging"
                ]
            }
        ]
        
        for module_data in delegation_modules:
            module = CourseModule(course_id="effective-delegation", **module_data)
            db.add(module)
        
        # 10. EMOTION REGULATION
        emotion_course = Course(
            id="emotion-regulation",
            title="Emotion Regulation for High-Stress Environments",
            description="Develop skills for managing emotions effectively in healthcare settings.",
            duration="22 min",
            difficulty="Advanced",
            icon="heart-circle-outline",
            color="#FF3B30",
            category="specialty",
            modules_count=4,
            sort_order=3
        )
        db.add(emotion_course)
        
        emotion_modules = [
            {
                "module_id": "emotion-cycle",
                "title": "Understanding the Emotion Cycle",
                "content": """Welcome to 'Emotion Regulation for High-Stress Environments.' I'm Dr. ..., and today we'll explore strategies for managing emotions effectively in healthcare settings.

Healthcare work is inherently emotional. Daily, you witness suffering, make high-stakes decisions, and navigate difficult conversations—all while maintaining professionalism. Without effective emotion regulation skills, this emotional labor can lead to exhaustion and burnout.

Let's begin by understanding the emotion cycle in healthcare settings. Typically, there's an emotional trigger—perhaps a critical patient, an angry family member, or an unexpected outcome. This trigger produces automatic thoughts, physiological reactions, and behavioral urges. How we respond to these components determines whether the emotion intensifies or resolves.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Healthcare work involves inherent emotional challenges",
                    "Emotion regulation skills prevent emotional labor from causing burnout",
                    "Emotions follow a cycle: trigger → thoughts → physiology → behavior",
                    "Our response determines whether emotions intensify or resolve"
                ]
            },
            {
                "module_id": "regulation-strategies",
                "title": "Three Evidence-Based Regulation Strategies",
                "content": """I'll share three evidence-based strategies for regulating emotions in the moment:

**Strategy one: Physiological regulation through breathing.** When emotionally activated, our breathing becomes shallow and rapid. Intentionally slowing your breath interrupts the stress response. Try this 4-7-8 technique: Inhale for 4 counts, hold for 7, exhale for 8. This extended exhale activates your parasympathetic nervous system, reducing physiological arousal.

**Strategy two: Cognitive labeling.** Research shows that putting feelings into words reduces their intensity. Simply naming your emotion—'I'm feeling frustrated' or 'I notice anxiety arising'—creates psychological distance and activates regulatory brain regions. For maximum effectiveness, use a nuanced emotional vocabulary rather than broad terms like 'bad' or 'stressed.'""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "4-7-8 breathing activates parasympathetic nervous system",
                    "Cognitive labeling reduces emotional intensity through brain activation",
                    "Specific emotional vocabulary works better than general terms",
                    "These strategies interrupt automatic emotional escalation"
                ]
            },
            {
                "module_id": "perspective-processing",
                "title": "Perspective-Shifting and Emotional Processing",
                "content": """**Strategy three: Perspective-shifting.** When emotionally overwhelmed, our perspective narrows. Counteract this by asking yourself:

• 'How might someone I respect view this situation?'
• 'What might I be missing from this perspective?'
• 'How important will this seem in one week? One month? One year?'

These questions expand your perspective and reduce emotional intensity.

Now, let's address emotional processing after difficult events. While compartmentalization is necessary during crisis moments, unprocessed emotions accumulate over time, contributing to burnout. Try this three-step approach following challenging situations:""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Perspective-shifting questions expand narrowed emotional focus",
                    "Time perspective reduces immediate emotional intensity",
                    "Compartmentalization is necessary but temporary",
                    "Unprocessed emotions accumulate and contribute to burnout"
                ]
            },
            {
                "module_id": "emotional-awareness",
                "title": "Building Emotional Awareness",
                "content": """**Three-step emotional processing approach:**

First, acknowledge the emotion without judgment. All emotions are information, not character flaws.

Second, identify the unmet need behind the emotion. Anger often signals a boundary violation, sadness a loss, anxiety a threat to something valued.

Third, take appropriate action to address the need. This might involve seeking support, making system changes, or practicing self-compassion.

Healthcare culture often implicitly encourages emotional suppression. Remember that emotional awareness doesn't compromise professionalism—it enhances your effectiveness and wellbeing.

I encourage you to identify one emotion regulation strategy to practice this week. Which resonated most with you?

Thank you for your commitment to emotional wellbeing. By developing these skills, you're investing in sustainable, compassionate care for both your patients and yourself.""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 3,
                "key_takeaways": [
                    "Emotions are information, not character flaws",
                    "Different emotions signal different unmet needs",
                    "Emotional awareness enhances rather than compromises professionalism",
                    "Taking action to address needs prevents emotional accumulation"
                ],
                "action_items": [
                    "Practice one emotion regulation strategy this week",
                    "Use 4-7-8 breathing during stressful moments",
                    "Label emotions with specific vocabulary",
                    "Process difficult events using the three-step approach"
                ]
            }
        ]
        
        for module_data in emotion_modules:
            module = CourseModule(course_id="emotion-regulation", **module_data)
            db.add(module)
        
        db.commit()
        print("Successfully seeded all courses and modules from PDF content!")
        
    except Exception as e:
        print(f"Error seeding courses: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_courses()