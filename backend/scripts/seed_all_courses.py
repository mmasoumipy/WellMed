# backend/scripts/seed_all_13_courses.py
import sys
import os

# Add the parent directory to Python path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Course, CourseModule
import uuid
from datetime import datetime

def seed_all_13_courses():
    """Comprehensive seeding of all 13 courses and modules from the PDF"""
    db = SessionLocal()
    
    try:
        print("Starting seeding of all 13 courses...")
        
        # =====================================
        # COURSE 1: LEARN ABOUT BURNOUT AMONG PHYSICIANS
        # =====================================
        
        course_1 = Course(
            id="burnout-among-physicians",
            title="Understanding Burnout Among Physicians",
            description="Learn about burnout among physicians - what it is, how it develops, and why it's prevalent in healthcare.",
            duration="12 min",
            difficulty="Beginner",
            icon="medical-outline",
            color="#FF6B6B",
            category="core",
            modules_count=3,
            sort_order=1
        )
        db.add(course_1)
        
        course_1_modules = [
            {
                "module_id": "what-is-burnout",
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
                    "WHO recognizes burnout as a workplace issue"
                ]
            },
            {
                "module_id": "burnout-development",
                "title": "How Burnout Develops",
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
                    "Burnout develops gradually through accumulated stress",
                    "Early signs include irritability and emotional flatness",
                    "Loss of meaning in previously energizing tasks is a warning sign",
                    "These signals indicate overwhelmed capacity to cope"
                ]
            },
            {
                "module_id": "physician-specific-burnout",
                "title": "Burnout Specific to Physicians",
                "content": """For healthcare professionals, burnout can show up in specific ways:
• Diminished empathy toward patients
• Increased medical errors or documentation fatigue
• Avoidance of difficult conversations
• Isolation from colleagues or feeling unsupported

The good news is, burnout is not permanent. With the right support, boundaries, self-awareness, and system changes, it can be addressed.

Thank you for taking the first step by simply understanding what burnout is. Awareness is the beginning of change.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Healthcare burnout includes diminished empathy and increased errors",
                    "Avoidance of difficult conversations is a common sign",
                    "Burnout is treatable and not permanent",
                    "Awareness is the first step toward recovery"
                ]
            }
        ]
        
        for module_data in course_1_modules:
            module = CourseModule(course_id="burnout-among-physicians", **module_data)
            db.add(module)
        
        print("✅ Course 1: Understanding Burnout Among Physicians")
        
        # =====================================
        # COURSE 2: COMMON TRIGGERS (EMOTIONAL EXHAUSTION, DEPERSONALIZATION, REDUCED ACCOMPLISHMENT)
        # =====================================
        
        course_2 = Course(
            id="burnout-triggers",
            title="Common Burnout Triggers",
            description="Explore the three main dimensions of burnout: emotional exhaustion, depersonalization, and reduced accomplishment.",
            duration="15 min",
            difficulty="Beginner",
            icon="warning-outline",
            color="#FF9500",
            category="core",
            modules_count=3,
            sort_order=2
        )
        db.add(course_2)
        
        course_2_modules = [
            {
                "module_id": "emotional-exhaustion",
                "title": "Understanding Emotional Exhaustion",
                "content": """Emotional exhaustion is the core component of burnout. It's characterized by feelings of being emotionally overextended and depleted of one's emotional and physical resources.

**Signs of Emotional Exhaustion:**
• Feeling drained at the end of each workday
• Waking up tired and having to face another day on the job
• Working with people all day is really stressful for you
• Feeling burned out from work
• Feeling frustrated by your job

**Common Triggers:**
• High patient loads and time pressures
• Emotional demands of patient care
• Lack of control over work environment
• Insufficient recovery time between shifts
• Workplace conflicts and poor communication

Emotional exhaustion often leads to cynicism and detachment as a protective mechanism.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Emotional exhaustion is the core component of burnout",
                    "It involves depletion of emotional and physical resources",
                    "High patient loads and time pressures are major triggers",
                    "Often leads to cynicism as a protective response"
                ]
            },
            {
                "module_id": "depersonalization",
                "title": "Recognizing Depersonalization",
                "content": """Depersonalization involves negative, cynical attitudes and feelings about one's patients or clients. It's a way of psychologically distancing oneself from patients.

**Signs of Depersonalization:**
• Treating patients as impersonal objects
• Developing cynical attitudes about patients
• Not caring what happens to some patients
• Feeling patients blame you for their problems
• Worrying that this job is hardening you emotionally

**Why It Develops:**
Depersonalization often emerges as a coping mechanism when emotional exhaustion becomes overwhelming. Healthcare workers may distance themselves emotionally to protect against further burnout.

**The Danger:**
While depersonalization may provide temporary relief from emotional demands, it can lead to decreased empathy and compromised patient care quality.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "Depersonalization involves cynical attitudes toward patients",
                    "It's a protective mechanism against emotional exhaustion",
                    "Can lead to treating patients as impersonal objects",
                    "May compromise empathy and care quality"
                ]
            },
            {
                "module_id": "reduced-accomplishment",
                "title": "Addressing Reduced Personal Accomplishment",
                "content": """Reduced personal accomplishment refers to feelings of incompetence and lack of achievement and productivity at work.

**Signs of Reduced Personal Accomplishment:**
• Feeling you're not positively influencing patients' lives
• Doubting the significance of your work
• Feeling less effective in helping patients
• Not dealing effectively with patients' problems
• Questioning your competence and skills

**Contributing Factors:**
• Unrealistic expectations and perfectionism
• Lack of feedback and recognition
• Insufficient resources to do the job well
• System barriers that prevent quality care
• Comparing yourself to idealized standards

**Recovery Strategies:**
• Reconnect with your initial motivation for healthcare
• Seek feedback and celebrate small wins
• Set realistic, achievable goals
• Focus on patient outcomes you can control
• Practice self-compassion and realistic self-evaluation""",
                "duration": "5 min",
                "module_type": "interactive",
                "sort_order": 2,
                "key_takeaways": [
                    "Reduced accomplishment involves doubting work significance",
                    "Often stems from unrealistic expectations and lack of feedback",
                    "Recovery involves reconnecting with initial motivation",
                    "Focus on controllable outcomes and practice self-compassion"
                ],
                "action_items": [
                    "Identify one recent positive patient interaction",
                    "Set one realistic, achievable goal for this week",
                    "Seek feedback from a trusted colleague",
                    "Practice self-compassion when facing challenges"
                ]
            }
        ]
        
        for module_data in course_2_modules:
            module = CourseModule(course_id="burnout-triggers", **module_data)
            db.add(module)
        
        print("✅ Course 2: Common Burnout Triggers")
        
        # =====================================
        # COURSE 3: MICRO-RESILIENCE STRATEGIES
        # =====================================
        
        course_3 = Course(
            id="micro-resilience-strategies",
            title="Micro-Resilience Strategies",
            description="Evidence-based micro-resilience strategies including box breathing, gratitude moments, and quick stress reducers.",
            duration="12 min",
            difficulty="Beginner",
            icon="timer-outline",
            color="#45B7D1",
            category="quick-wins",
            modules_count=2,
            sort_order=1
        )
        db.add(course_3)
        
        course_3_modules = [
            {
                "module_id": "breathing-techniques",
                "title": "Box Breathing and Physical Techniques",
                "content": """Welcome to Micro-Resilience. I'm Dr. Jennifer, and I'll be sharing six evidence-based stress reduction techniques you can use in just two minutes during your busy day.

**Technique 1: Box Breathing**
Find a comfortable position and follow this pattern:
• Inhale for a count of four
• Hold for four
• Exhale for four
• Hold for four
Repeat this cycle 3-4 times. Box breathing activates your parasympathetic nervous system, reducing cortisol levels and heart rate within just a few cycles.

**Technique 2: Progressive Muscle Relaxation**
Starting with your shoulders, tense them tightly, hold for five seconds, then release. Notice the difference between tension and relaxation. Now do the same with your jaw, then your hands. This technique breaks the physical stress cycle.

**Technique 3: Mindful Hand-Washing**
During your next hand-washing, bring full attention to the sensations—the temperature of the water, the texture of soap, the movement of your hands. This transforms a routine task into a mindful break.""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 0,
                "key_takeaways": [
                    "Box breathing reduces cortisol and heart rate in minutes",
                    "Progressive muscle relaxation breaks the physical stress cycle",
                    "Mindful hand-washing turns routine into mindfulness practice",
                    "These techniques work through immediate physiological effects"
                ]
            },
            {
                "module_id": "gratitude-grounding",
                "title": "Gratitude Moments and Mental Techniques",
                "content": """**Technique 4: Gratitude Moment**
Briefly identify three specific things you're grateful for right now. They can be simple: a supportive colleague, a moment of connection with a patient, or even your cup of coffee. Practicing gratitude activates positive neural pathways and counters negativity bias.

**Technique 5: Sensory Grounding**
Name five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste. This exercise anchors you in the present moment and interrupts rumination or anxiety.

**Technique 6: Values Reconnection**
Take three deep breaths, then ask yourself: 'What matters to me in this moment?' Connect with one of your core values, whether it's compassion, excellence, or making a difference.

The power of these techniques lies not in their duration but in their regular practice. Try setting an intention to use one micro-resilience strategy every few hours during your next shift.""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Gratitude practice activates positive neural pathways",
                    "Sensory grounding interrupts anxiety and rumination",
                    "Values reconnection restores meaning during difficult times",
                    "Regular practice is more important than duration"
                ],
                "action_items": [
                    "Choose one technique to practice today",
                    "Set reminders for micro-resilience every few hours",
                    "Practice gratitude with three specific items",
                    "Use sensory grounding when feeling overwhelmed"
                ]
            }
        ]
        
        for module_data in course_3_modules:
            module = CourseModule(course_id="micro-resilience-strategies", **module_data)
            db.add(module)
        
        print("✅ Course 3: Micro-Resilience Strategies")
        
        # =====================================
        # COURSE 4: SLEEP HYGIENE FOR SHIFT AND ROTATING WORKERS
        # =====================================
        
        course_4 = Course(
            id="sleep-hygiene-shift-workers",
            title="Sleep Hygiene for Shift and Rotating Workers",
            description="Comprehensive sleep strategies specifically designed for healthcare shift workers and rotating schedules.",
            duration="25 min",
            difficulty="Intermediate",
            icon="moon-outline",
            color="#9B59B6",
            category="specialty",
            modules_count=5,
            sort_order=1
        )
        db.add(course_4)
        
        course_4_modules = [
            {
                "module_id": "sleep-fundamentals",
                "title": "Sleep Fundamentals for Shift Workers",
                "content": """Sleep is the foundation of wellbeing, yet for many healthcare professionals, quality sleep remains elusive. Whether you're working overnight shifts, early mornings, or rotating schedules, your circadian rhythm faces constant challenges.

**Why Sleep Matters for Healthcare Workers:**
• Improved decision-making and reduced medical errors
• Better emotional regulation and patient interactions
• Enhanced immune function and physical health
• Reduced risk of burnout and depression

**The Challenge of Shift Work:**
Shift work disrupts your natural circadian rhythm, which is designed to promote alertness during the day and sleep at night. This disruption can lead to:
• Shift Work Sleep Disorder (SWSD)
• Increased fatigue and sleepiness
• Digestive issues and metabolic changes
• Mood disturbances and cognitive impairment""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Sleep is crucial for decision-making and reducing medical errors",
                    "Shift work disrupts natural circadian rhythms",
                    "Can lead to Shift Work Sleep Disorder and health issues",
                    "Sleep quality directly impacts patient care quality"
                ]
            },
            {
                "module_id": "sleep-environment",
                "title": "Optimizing Your Sleep Environment",
                "content": """Your sleep environment should be optimized for quality rest regardless of when you sleep:

**Environmental Modifications:**

**Completely Dark:** Use blackout curtains or a sleep mask, especially when sleeping during daylight. Even small amounts of light can suppress melatonin production.

**Cool:** The ideal temperature for sleep is between 60-67°F (15-19°C). Body temperature naturally drops during sleep, and a cool environment facilitates this process.

**Quiet:** Consider using earplugs or a white noise machine to block daytime sounds. For those living with others who are awake during your sleep time, a white noise machine near your door can mask household sounds.

**Phone-Free:** The blue light from devices suppresses melatonin, making it harder to fall asleep. Keep your phone outside your bedroom, or at minimum, use night mode and avoid checking it before sleep.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "Sleep environment should be dark, cool, quiet, and phone-free",
                    "Even small amounts of light can suppress melatonin",
                    "Ideal sleep temperature is 60-67°F (15-19°C)",
                    "Blue light from devices disrupts sleep onset"
                ]
            },
            {
                "module_id": "night-shift-strategies",
                "title": "Strategies for Night Shift Workers",
                "content": """Night shifts present particular challenges for your circadian rhythm:

**Light Management:**
• Wear blue-light blocking glasses during your late shift, especially in the last few hours
• Keep your brightest light exposure during the first half of your shift
• Limit morning exposure to bright light by wearing sunglasses on your commute home

**Sleep Timing:**
• Sleep as soon as possible after your night shift
• Maintain complete darkness during your daytime sleep
• Consider a 'transition nap'—a short 20-30 minute nap before your night shift

**Strategic Melatonin Use:**
Consider using melatonin strategically (consult your physician for appropriate timing and dosage).

**Communication:**
Use 'Do Not Disturb' signs and inform household members of your sleep schedule.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Blue-light blocking glasses help in late shift hours",
                    "Brightest light exposure should be in first half of shift",
                    "Wear sunglasses when commuting home after night shift",
                    "Short transition naps can help before night shifts"
                ]
            },
            {
                "module_id": "rotating-shifts",
                "title": "Managing Rotating Shifts",
                "content": """Rotating shifts are particularly challenging for your circadian system:

**Transition Strategies:**
• When transitioning to night shifts, try to gradually delay your bedtime over several days before
• For forward rotation (day→evening→night), shift your sleep later each day
• For backward rotation, the adjustment is more difficult and may require strategic napping

**Recovery Approaches:**
• After night shifts, some research suggests sleeping for a shorter period (4-5 hours) after your shift, staying awake for the remainder of the day, then going to bed early that evening for faster recovery
• Alternatively, sleep immediately after night shift for 6-8 hours

**Light Exposure:**
• Use bright light therapy during your work hours
• Avoid bright light when you want to sleep
• Consider light therapy devices for consistent exposure""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 3,
                "key_takeaways": [
                    "Gradual bedtime shifts help with transitions",
                    "Forward rotation is easier than backward rotation",
                    "Recovery strategies vary - find what works for you",
                    "Light therapy can help maintain circadian rhythm"
                ]
            },
            {
                "module_id": "nutrition-recovery",
                "title": "Nutrition and Recovery Strategies",
                "content": """**Nutrition for Sleep:**
• Avoid heavy meals within 3 hours of sleep
• Consider a light, protein-containing snack if hungry before sleep
• Stay well-hydrated during your shift, but taper fluid intake in the hours before sleep
• Be strategic with caffeine: use early in your shift and switch to non-caffeinated beverages later

**When to Seek Help:**
Consider consulting a sleep specialist if:
• You've implemented these strategies consistently for 3-4 weeks without improvement
• You experience excessive daytime sleepiness despite adequate sleep time
• You have symptoms of sleep apnea (snoring, gasping, witnessed breathing pauses)
• Sleep difficulties are significantly impacting your wellbeing or performance

Remember, shift work inherently stresses your circadian system. Be compassionate with yourself and prioritize sleep recovery on your days off.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 4,
                "key_takeaways": [
                    "Strategic nutrition timing supports better sleep",
                    "Caffeine timing is crucial for shift workers",
                    "Professional help may be needed for persistent issues",
                    "Self-compassion is important given inherent challenges"
                ],
                "action_items": [
                    "Implement one sleep environment modification",
                    "Try strategic caffeine timing during next shift",
                    "Establish a consistent pre-sleep routine",
                    "Track sleep quality for one week"
                ]
            }
        ]
        
        for module_data in course_4_modules:
            module = CourseModule(course_id="sleep-hygiene-shift-workers", **module_data)
            db.add(module)
        
        print("✅ Course 4: Sleep Hygiene for Shift Workers")
        
        # =====================================
        # COURSE 5: STRESS SIGNALS AND EARLY WARNING SIGNS
        # =====================================
        
        course_5 = Course(
            id="stress-signals-early-warning",
            title="Stress Signals and Early Warning Signs",
            description="Learn to recognize your personal stress signals and early warning signs before they escalate to burnout.",
            duration="10 min",
            difficulty="Beginner",
            icon="alert-triangle-outline",
            color="#FF9500",
            category="core",
            modules_count=2,
            sort_order=3
        )
        db.add(course_5)
        
        course_5_modules = [
            {
                "module_id": "understanding-stress-signals",
                "title": "Understanding Your Stress Signals",
                "content": """Hello and welcome to 'Stress Signals.' I'm Dr. ..., and today we're exploring how to recognize your personal warning signs of stress before they escalate to burnout.

As healthcare professionals, we're trained to notice symptoms in others, but often miss the signs in ourselves. Many of us have normalized high levels of stress, making it even harder to recognize when we're approaching our limits.

**Four Categories of Stress Signals:**

**Physical Signs:** Tension headaches, digestive issues, sleep disturbances, racing heart, shallow breathing, or chronic pain intensification.

**Emotional Signs:** Irritability is often the first emotional indicator—when small annoyances feel overwhelming. Other signs include anxiety, feeling numb or detached, decreased patience with patients or colleagues, or tearfulness.

**Cognitive Signs:** Difficulty concentrating, forgetfulness, negative thought patterns, reduced decision-making abilities, or obsessive worrying.

**Behavioral Signs:** Changes in appetite, increased use of caffeine, alcohol, or other substances, withdrawing from social activities, or procrastination.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Healthcare professionals often miss stress signs in themselves",
                    "Stress signals fall into four categories: physical, emotional, cognitive, behavioral",
                    "Irritability is often the first emotional warning sign",
                    "High stress levels have become normalized in healthcare"
                ]
            },
            {
                "module_id": "personal-stress-mapping",
                "title": "Mapping Your Personal Warning Signs",
                "content": """Now, let's identify your personal stress signals. What are the first three signs that appear when you're under pressure? These are your early warning signs—your body and mind's way of saying 'pay attention.'

**Early Warning Signs (Levels 1-3):**
• Mild physical tension or fatigue
• Slight irritability or impatience
• Minor changes in sleep or appetite
• Difficulty concentrating on complex tasks

**Serious Warning Signs (Levels 4-6):**
• Persistent physical symptoms (headaches, GI issues)
• Significant mood changes or emotional reactivity
• Avoiding colleagues or difficult conversations
• Making more mistakes than usual

**Crisis Warning Signs (Levels 7-10):**
• Physical symptoms affecting daily function
• Feeling emotionally numb or detached
• Thoughts of leaving healthcare or calling in sick
• Compromised patient care quality

Creating awareness of these personal signals is powerful. It allows you to implement stress-reduction strategies before burnout develops. Try keeping a 'stress log' for a week, noting when these signals appear and what triggers them.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Early warning signs require attention, not immediate intervention",
                    "Serious warning signs demand immediate stress-reduction strategies",
                    "Crisis signs indicate need for professional support",
                    "Stress logs help identify patterns and triggers"
                ],
                "action_items": [
                    "Identify your top 3 early warning stress signals",
                    "Recognize your serious warning signs",
                    "Keep a stress log for one week",
                    "Note specific triggers that activate stress signals"
                ]
            }
        ]
        
        for module_data in course_5_modules:
            module = CourseModule(course_id="stress-signals-early-warning", **module_data)
            db.add(module)
        
        print("✅ Course 5: Stress Signals and Early Warning Signs")
        
        # =====================================
        # COURSE 6: HEALTHY BOUNDARIES AND SELF-CARE HABITS
        # =====================================
        
        course_6 = Course(
            id="healthy-boundaries-self-care",
            title="Healthy Boundaries and Self-Care Habits",
            description="Learn to set compassionate limits and develop sustainable self-care practices for healthcare professionals.",
            duration="18 min",
            difficulty="Intermediate",
            icon="shield-checkmark-outline",
            color="#34C759",
            category="core",
            modules_count=3,
            sort_order=4
        )
        db.add(course_6)
        
        course_6_modules = [
            {
                "module_id": "understanding-boundaries",
                "title": "Understanding Healthy Boundaries",
                "content": """Welcome to 'Boundaries: The Art of Compassionate Limits.' I'm Dr. ..., and today we're exploring how healthy boundaries protect both you and those you care for.

**What Are Boundaries?**
Boundaries are the limits and rules we set for ourselves and others. They define where we end and others begin. In healthcare, boundaries can be:
• **Professional:** the scope of your clinical responsibilities
• **Temporal:** your working hours and availability
• **Emotional:** the degree of emotional involvement with patients
• **Physical:** your personal space and energy reserves

**Common Misconceptions:**
Many healthcare professionals believe that setting boundaries means being less compassionate or dedicated. In reality, boundaries are essential for sustainable caregiving and preventing burnout.

Boundaries aren't walls that disconnect you from patients or colleagues. They're filters that allow you to be present and effective without becoming depleted.""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Boundaries are essential for sustainable caregiving",
                    "Four types: professional, temporal, emotional, and physical",
                    "Boundaries are filters, not walls",
                    "They enable presence without depletion"
                ]
            },
            {
                "module_id": "boundary-strategies",
                "title": "Five Boundary Strategies for Healthcare",
                "content": """Here are five boundary strategies specifically for healthcare settings:

**1. Clarify Your Role**
Know what responsibilities are truly yours and which belong to others. When asked to take on tasks outside your role, practice saying: 'That's outside my scope of practice, but I can connect you with someone who can help.'

**2. Manage Time Boundaries**
If your shift ends at 7:00, schedule your last patient at 6:15. Plan your transition out of work with the same intention you plan your clinical day.

**3. Develop Emotional Boundaries**
Compassion doesn't require taking on patients' emotional states. Practice compassionate detachment by acknowledging 'This is their pain, not mine. I can support without absorbing.'

**4. Create Transition Rituals**
This might be changing clothes, taking a different route home, or a brief mindfulness practice to symbolically leave work behind.

**5. Practice Clear Communication**
Instead of vague statements, be specific: 'I'm not available after 6pm, but I'll respond to your message first thing tomorrow.'""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "Role clarity prevents scope creep and overcommitment",
                    "Time boundaries require intentional planning",
                    "Emotional boundaries allow support without absorption",
                    "Clear communication prevents misunderstandings"
                ]
            },
            {
                "module_id": "self-care-habits",
                "title": "Building Sustainable Self-Care Habits",
                "content": """**Self-Care Isn't Selfish**
Self-care in healthcare isn't selfish—it's essential. You can't pour from an empty cup. Regular self-care practices ensure you can provide quality care consistently.

**Physical Self-Care:**
• Regular movement and exercise appropriate for your schedule
• Nutritious meals and adequate hydration
• Sufficient sleep and rest periods
• Regular medical and dental checkups

**Emotional Self-Care:**
• Regular connection with friends and family
• Professional counseling or therapy when needed
• Engaging in hobbies and activities you enjoy
• Practicing mindfulness and stress reduction

**Professional Self-Care:**
• Setting realistic expectations and goals
• Seeking feedback and continuing education
• Building supportive relationships with colleagues
• Taking breaks and using vacation time

**Spiritual Self-Care:**
• Engaging in practices that connect you to meaning
• Spending time in nature
• Meditation, prayer, or contemplative practices
• Volunteer work or community service

Remember, self-care isn't a luxury—it's a professional responsibility that ensures you can provide the best care to your patients.""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 2,
                "key_takeaways": [
                    "Self-care is a professional responsibility, not selfish",
                    "Includes physical, emotional, professional, and spiritual dimensions",
                    "Regular practices ensure consistent quality care",
                    "Taking breaks and vacation time is essential"
                ],
                "action_items": [
                    "Identify one boundary that needs strengthening",
                    "Choose one self-care practice to implement this week",
                    "Schedule regular self-care activities in your calendar",
                    "Practice one transition ritual between work and home"
                ]
            }
        ]
        
        for module_data in course_6_modules:
            module = CourseModule(course_id="healthy-boundaries-self-care", **module_data)
            db.add(module)
        
        print("✅ Course 6: Healthy Boundaries and Self-Care")
        
        # =====================================
        # COURSE 7: MICROBREAKS BETWEEN PATIENTS (PHYSICAL AND COGNITIVE)
        # =====================================
        
        course_7 = Course(
            id="microbreaks-between-patients",
            title="Microbreaks Between Patients",
            description="Quick physical and cognitive reset practices to renew yourself between patient encounters.",
            duration="10 min",
            difficulty="Beginner",
            icon="refresh-circle-outline",
            color="#32D74B",
            category="quick-wins",
            modules_count=2,
            sort_order=2
        )
        db.add(course_7)
        
        course_7_modules = [
            {
                "module_id": "physical-microbreaks",
                "title": "Physical Reset Exercises",
                "content": """Welcome to Microbreaks Between Patients. These quick exercises help you reset physically and mentally during your busy day.

**Standing Stretch Sequence (60 seconds):**
• Reach arms overhead and stretch for 10 seconds
• Roll shoulders backward 5 times, forward 5 times
• Gentle neck side stretches (hold 5 seconds each side)
• Forward fold to release lower back tension

**Eye Rest (30 seconds):**
• Look away from screens/close work
• Focus on something 20 feet away for 20 seconds
• Blink slowly 10 times to relubricate eyes
• Palm covering for darkness and rest

**Hand and Wrist Release (45 seconds):**
• Wrist circles (5 each direction)
• Finger stretches and gentle pulls
• Prayer stretch (palms together, lower hands)
• Shake out hands and fingers vigorously

**Shoulder Roll Sequence (30 seconds):**
• 5 forward rolls, 5 backward rolls
• Shoulder blade squeezes (hold 5 seconds)
• Cross-body arm stretch (hold 15 seconds each arm)

**Box Breathing (60 seconds):**
• 4 counts in, 4 hold, 4 out, 4 hold
• Repeat 4-6 cycles for maximum benefit
• Can be done anywhere, anytime discreetly""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 0,
                "key_takeaways": [
                    "Physical microbreaks prevent repetitive strain and tension buildup",
                    "Eye rest is crucial for close work and screen time",
                    "Hand and wrist exercises prevent occupational strain",
                    "Breathing exercises provide immediate stress relief"
                ]
            },
            {
                "module_id": "cognitive-reset",
                "title": "Mental and Emotional Reset",
                "content": """**Mindful Observation (40 seconds to 5 minutes):**
Take time to simply observe your environment without judgment. Notice colors, textures, sounds, or movement. This brief mindfulness practice can reset your mental state between patients.

**Social Connection Reminder (30 seconds):**
Take a moment to think about a loved one, send a quick supportive text to a colleague, or mentally connect with your support system. Even brief social connection provides grounding and perspective.

**Mental Visualization (60 seconds):**
Briefly imagine a calming place or a moment of gratitude. This could be:
• A peaceful beach with waves
• A favorite hiking trail in nature  
• A meaningful memory with family
• Your ideal vacation destination

**Creative Mini-Challenge (90 seconds):**
Engage a different part of your brain with quick creative exercises:
• Recall 5 songs you loved as a teenager
• Name animals that start with each letter of your name
• Think of 3 things you're looking forward to this week
• Visualize your dream house or ideal workspace

**Values Reconnection (45 seconds):**
Take three deep breaths, then ask yourself: 'What matters to me in this moment?' Connect with one of your core values—compassion, excellence, making a difference.

**Implementation Tip:** Even a 40-second mindful pause can help, but optimal benefit comes from 2-5 minutes when possible. Consistency matters more than duration.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Mindful observation resets mental state without special preparation",
                    "Brief social connection provides grounding and perspective",
                    "Visualization activates same neural pathways as real experiences",
                    "Creative challenges prevent mental fatigue and maintain flexibility"
                ],
                "action_items": [
                    "Try one physical and one cognitive microbreak today",
                    "Set phone reminders for microbreaks every 2-3 hours",
                    "Identify your preferred visualization location",
                    "Practice 40-second mindful pauses between patients"
                ]
            }
        ]
        
        for module_data in course_7_modules:
            module = CourseModule(course_id="microbreaks-between-patients", **module_data)
            db.add(module)
        
        print("✅ Course 7: Microbreaks Between Patients")
        
        # =====================================
        # COURSE 8: WHAT YOU CAN DO (AWARENESS, SYSTEM CHANGES, SUPPORT)
        # =====================================
        
        course_8 = Course(
            id="awareness-system-changes-support",
            title="What You Can Do: Awareness, System Changes, and Support",
            description="Practical strategies for individual awareness, advocating for system changes, and building support networks.",
            duration="16 min",
            difficulty="Intermediate",
            icon="people-circle-outline",
            color="#007AFF",
            category="core",
            modules_count=3,
            sort_order=5
        )
        db.add(course_8)
        
        course_8_modules = [
            {
                "module_id": "building-awareness",
                "title": "Building Personal and Team Awareness",
                "content": """**Personal Awareness Strategies:**

**Self-Assessment Tools:**
• Regular use of burnout assessment scales (MBI, Professional Quality of Life Scale)
• Weekly self-check-ins on stress levels, sleep quality, and job satisfaction
• Journaling to track patterns and triggers
• Mindfulness practices to increase self-awareness

**Team Awareness Building:**
• Open discussions about burnout in team meetings
• Sharing stress management strategies with colleagues
• Creating psychological safety for discussing challenges
• Recognizing signs of burnout in teammates

**Organizational Awareness:**
• Understanding your workplace's burnout prevention resources
• Knowing who to contact for mental health support
• Awareness of employee assistance programs
• Understanding policies around workload and time off

**Red Flag Recognition:**
Learn to recognize when burnout is affecting patient care:
• Increased medical errors or near misses
• Difficulty concentrating during procedures
• Impatience or irritability with patients
• Avoiding difficult conversations or complex cases
• Calling in sick more frequently

**Creating Accountability:**
• Partner with a colleague for mutual burnout monitoring
• Schedule regular check-ins with supervisors about workload
• Set boundaries around work hours and stick to them
• Practice saying no to additional commitments when overwhelmed""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Regular self-assessment helps track burnout risk",
                    "Team awareness creates supportive work environment",
                    "Organizational resources exist but require active awareness",
                    "Early recognition prevents impact on patient care"
                ]
            },
            {
                "module_id": "advocating-system-changes",
                "title": "Advocating for System Changes",
                "content": """**Individual Advocacy Strategies:**

**Document and Report:**
• Keep records of excessive workloads and unsafe staffing
• Report near misses and incidents related to fatigue or stress
• Document time spent on non-clinical tasks
• Track overtime hours and their impact on patient care

**Constructive Communication:**
• Present solutions, not just problems, to leadership
• Use data and evidence to support requests for change
• Collaborate with colleagues to present unified concerns
• Focus on patient safety and quality care outcomes

**System-Level Changes to Advocate For:**
• Adequate staffing ratios and manageable patient loads
• Streamlined documentation and reduced administrative burden
• Flexible scheduling options and adequate break times
• Access to mental health resources and wellness programs
• Recognition and reward systems for quality care
• Investment in technology that improves efficiency

**Professional Development:**
• Join committees focused on workplace wellness
• Participate in quality improvement initiatives
• Engage with professional organizations advocating for healthcare worker wellbeing
• Pursue leadership roles to influence positive change

**Policy Advocacy:**
• Support legislation for safe staffing ratios
• Advocate for workplace safety protections
• Engage with healthcare organizations on burnout prevention
• Share your story with policymakers about healthcare working conditions

Remember: System change takes time, but individual and collective voices can create meaningful improvements.""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "Documentation provides evidence for needed changes",
                    "Present solutions along with problems",
                    "System changes require collective advocacy",
                    "Professional engagement amplifies individual voices"
                ]
            },
            {
                "module_id": "building-support-networks",
                "title": "Building and Utilizing Support Networks",
                "content": """**Professional Support Networks:**

**Workplace Support:**
• Cultivate relationships with colleagues who understand your challenges
• Create informal support groups or buddy systems
• Participate in workplace wellness initiatives
• Seek mentorship from experienced colleagues
• Build relationships across departments and specialties

**Professional Organizations:**
• Join specialty organizations that address burnout
• Participate in professional development opportunities
• Connect with peers facing similar challenges
• Access resources and continuing education
• Engage in advocacy efforts for workplace improvement

**Personal Support Networks:**

**Family and Friends:**
• Educate loved ones about the demands of healthcare work
• Set clear boundaries between work and personal time
• Ask for specific support when needed
• Maintain connections outside of healthcare
• Create rituals for transitioning between work and home

**Mental Health Professionals:**
• Establish relationship with therapist or counselor
• Consider support groups for healthcare professionals
• Use employee assistance programs if available
• Don't wait for crisis to seek professional help
• Normalize mental health care as essential self-care

**Peer Support Programs:**
• Participate in formal peer support initiatives
• Create informal check-in systems with colleagues
• Share coping strategies and resources
• Provide mutual accountability for self-care
• Celebrate successes and support during challenges

**Community Resources:**
• Engage with community organizations that support healthcare workers
• Participate in activities that provide meaning outside of work
• Volunteer for causes that align with your values
• Join groups based on interests or hobbies
• Build connections that remind you of life beyond healthcare

**Creating Your Support Plan:**
1. Identify 3-5 people in your professional support network
2. Schedule regular check-ins with key support people
3. Practice asking for help before you're in crisis
4. Reciprocate support to strengthen relationships
5. Regularly evaluate and adjust your support network""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 2,
                "key_takeaways": [
                    "Support networks should include both professional and personal connections",
                    "Mental health support should be proactive, not reactive",
                    "Peer support programs provide understanding from those with shared experiences",
                    "Regular maintenance of support relationships is essential"
                ],
                "action_items": [
                    "Identify 3 people in your professional support network",
                    "Schedule one conversation about workplace challenges this week",
                    "Research one advocacy opportunity in your organization",
                    "Practice asking for specific support from a colleague or friend"
                ]
            }
        ]
        
        for module_data in course_8_modules:
            module = CourseModule(course_id="awareness-system-changes-support", **module_data)
            db.add(module)
        
        print("✅ Course 8: Awareness, System Changes, and Support")
        
        # =====================================
        # COURSE 9: WHY VALUES ARE IMPORTANT
        # =====================================
        
        course_9 = Course(
            id="why-values-are-important",
            title="Why Values Are Important",
            description="Understand the critical role of values in preventing burnout and maintaining meaning in healthcare work.",
            duration="12 min",
            difficulty="Beginner",
            icon="heart-circle-outline",
            color="#FF3B30",
            category="core",
            modules_count=2,
            sort_order=6
        )
        db.add(course_9)
        
        course_9_modules = [
            {
                "module_id": "values-and-burnout-prevention",
                "title": "Values and Burnout Prevention",
                "content": """**The Research on Values and Burnout:**

Values serve as an internal compass that guides decisions and provides meaning during difficult times. Research consistently shows that healthcare professionals who maintain connection to their core values experience:
• Lower rates of emotional exhaustion
• Greater job satisfaction and engagement
• Improved resilience during stressful periods
• Reduced likelihood of leaving healthcare
• Better patient care outcomes

**How Values Protect Against Burnout:**

**1. Meaning-Making:** Values help you find purpose in daily tasks, even mundane ones. Filing paperwork becomes an act of caring for patients when viewed through the lens of excellence and service.

**2. Decision-Making Guide:** When faced with difficult choices, values provide clear direction. This reduces decision fatigue and internal conflict.

**3. Stress Buffer:** During high-stress situations, connecting with your values can provide emotional regulation and perspective.

**4. Identity Anchor:** Values help maintain your sense of self and professional identity even when external circumstances are chaotic.

**5. Motivation Source:** Values provide intrinsic motivation that sustains you when external rewards are limited.

**The Cost of Values Misalignment:**
When your daily work conflicts with your core values, it creates moral distress and accelerates burnout. Common misalignments include:
• Being pressured to rush patient care when you value thoroughness
• Having to prioritize productivity over quality when you value excellence
• Feeling unable to advocate for patients when you value justice
• Working in systems that prevent compassionate care when you value empathy""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Values connection reduces emotional exhaustion and improves job satisfaction",
                    "Values provide meaning-making, decision guidance, and stress buffering",
                    "Values misalignment creates moral distress and accelerates burnout",
                    "Maintaining values connection improves patient care outcomes"
                ]
            },
            {
                "module_id": "living-values-in-healthcare",
                "title": "Living Your Values in Healthcare",
                "content": """**Strategies for Values-Based Practice:**

**Daily Values Integration:**
• Start each shift by setting a values-based intention
• Before difficult conversations, connect with your values of compassion and integrity
• During routine tasks, remind yourself how they serve your deeper purposes
• End each day by reflecting on how you lived your values

**Values in Action Examples:**

**If you value Compassion:**
• Take extra time to explain procedures to anxious patients
• Advocate for pain management and comfort measures
• Show empathy for colleagues who are struggling
• Practice self-compassion during difficult days

**If you value Excellence:**
• Continuously improve your clinical skills and knowledge
• Take pride in thorough documentation and careful attention to detail
• Seek feedback and learning opportunities
• Maintain high standards while being realistic about constraints

**If you value Justice:**
• Advocate for equitable treatment of all patients
• Address disparities in care when you see them
• Support policies that improve access to healthcare
• Treat all patients with equal respect regardless of background

**If you value Growth:**
• Embrace challenges as learning opportunities
• Mentor newer healthcare professionals
• Pursue continuing education and skill development
• Reflect on experiences to extract lessons

**Overcoming Values Challenges:**

**When System Pressures Conflict with Values:**
• Focus on what you can control within your sphere of influence
• Find creative ways to honor values within constraints
• Advocate for system changes that align with your values
• Seek support from colleagues who share similar values

**When You're Too Busy to Think About Values:**
• Use brief values reminders throughout the day
• Post visual cues in your workspace
• Practice micro-meditations on your values
• Share values conversations with colleagues

**Maintaining Values During Crisis:**
• Remember that living values isn't about perfection
• Values provide direction, not rigid rules
• Adapt values expression to fit circumstances
• Use values as a source of strength during difficult times""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Daily values integration requires intentional practice",
                    "Values can be expressed creatively within system constraints",
                    "Values provide direction during crisis and uncertainty",
                    "Living values is about direction, not perfection"
                ],
                "action_items": [
                    "Set a values-based intention for your next shift",
                    "Identify how one of your core values shows up in your work",
                    "Practice one values-based behavior this week",
                    "Reflect on a time when your values guided a difficult decision"
                ]
            }
        ]
        
        for module_data in course_9_modules:
            module = CourseModule(course_id="why-values-are-important", **module_data)
            db.add(module)
        
        print("✅ Course 9: Why Values Are Important")
        
        # =====================================
        # COURSE 10: VALUES-BASED GUIDED REFLECTION ("KNOW YOUR WHY")
        # =====================================
        
        course_10 = Course(
            id="values-guided-reflection",
            title='Values-Based Guided Reflection: "Know Your Why"',
            description="Deep guided reflection to discover and connect with your core values for burnout prevention.",
            duration="20 min",
            difficulty="Intermediate",
            icon="compass-outline",
            color="#AF52DE",
            category="specialty",
            modules_count=3,
            sort_order=2
        )
        db.add(course_10)
        
        course_10_modules = [
            {
                "module_id": "discovering-your-why",
                "title": "Discovering Your Why",
                "content": """Welcome to 'Know Your Why,' a guided reflection on using your values to prevent burnout. I'm Dr. ..., and I'll be guiding you through this exercise.

**The 80th Birthday Visualization:**
Close your eyes if you're comfortable doing so. Imagine it's your 80th birthday celebration. People from throughout your life are gathered—family, friends, colleagues, patients you've cared for. One by one, they stand to speak about what you've meant to them and the impact you've had. 

What would you most want them to say? Listen to their words in your imagination:
• How did you make them feel?
• What difference did you make in their lives?
• What values did you consistently demonstrate?
• How did you show up in difficult moments?

**The Calling Reflection:**
Think back to when you first decided to pursue healthcare. What drew you to this profession?
• Was it a personal experience with illness or healthcare?
• Did you want to help people in their most vulnerable moments?
• Were you motivated by scientific curiosity and problem-solving?
• Did you want to make a difference in your community?

**The Peak Experience Exercise:**
Recall a moment in your healthcare career when you felt most alive, most engaged, and most proud of your work. This might be:
• A patient interaction that went particularly well
• A moment when you made a real difference
• A time when you felt your skills and compassion aligned perfectly
• An experience where you felt truly helpful

What values were you expressing in that moment? What made it so meaningful?""",
                "duration": "8 min",
                "module_type": "interactive",
                "sort_order": 0,
                "key_takeaways": [
                    "The 80th birthday exercise reveals what truly matters to you",
                    "Your initial calling to healthcare contains important values clues",
                    "Peak experiences show your values in action",
                    "Values are about impact and meaning, not achievements"
                ]
            },
            {
                "module_id": "identifying-core-values",
                "title": "Identifying Your Core Values",
                "content": """**Common Healthcare Values:**
Review this list and identify which resonate most strongly with you:

**Patient-Centered Values:**
• Compassion - caring deeply about patient suffering and wellbeing
• Advocacy - standing up for patient rights and needs
• Respect - honoring patient dignity and autonomy
• Service - dedicating yourself to helping others

**Professional Values:**
• Excellence - striving for the highest quality care
• Integrity - being honest and ethical in all interactions
• Competence - maintaining and improving clinical skills
• Responsibility - being accountable for your actions and decisions

**Personal Values:**
• Growth - continuously learning and developing
• Balance - maintaining harmony between work and personal life
• Connection - building meaningful relationships
• Justice - ensuring fair and equitable treatment

**Spiritual/Meaning Values:**
• Purpose - feeling that your work has deeper meaning
• Hope - believing in positive outcomes and healing
• Faith - trusting in something greater than yourself
• Legacy - leaving a positive impact for future generations

**Values Prioritization Exercise:**
1. From the above list (or your own additions), select your top 10 values
2. Narrow these down to your top 5 most important values
3. Choose your top 3 non-negotiable core values
4. For each core value, write a brief statement about what it means to you

**Values Statement Creation:**
Write a personal values statement that begins: "I am committed to..." and includes your top 3 values with specific descriptions of how they show up in your healthcare work.

Example: "I am committed to providing compassionate care that honors each patient's dignity, pursuing excellence in my clinical skills while maintaining integrity in all my professional relationships, and fostering growth in myself and others through mentorship and continuous learning."""",
                "duration": "7 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Healthcare professionals often share common values with personal variations",
                    "Prioritizing values helps clarify what matters most",
                    "Values statements provide personal mission clarity",
                    "Your unique combination of values guides your purpose"
                ]
            },
            {
                "module_id": "living-your-values",
                "title": "Living Your Values Daily",
                "content": """**From Awareness to Action:**
Now that you've identified your core values, let's explore how to live them daily in your healthcare work.

**Morning Values Intention:**
Each morning, take 30-60 seconds to set a values-based intention for your day. Examples:
• "Today I will practice compassion with difficult patients and overwhelmed colleagues"
• "I will pursue excellence by asking questions when I'm uncertain and seeking learning opportunities"
• "I will maintain integrity by being honest about my limitations and advocating for what's right"

**Values-Based Decision Making:**
When facing difficult decisions, use your values as a guide:
1. Identify the decision you need to make
2. Consider how each option aligns with your core values
3. Choose the option that best honors your values
4. Accept that perfect alignment isn't always possible
5. Focus on progress, not perfection

**Values in Challenging Moments:**
During stressful or difficult situations:
• Take three deep breaths and connect with your values
• Ask yourself: "How can I honor my values in this moment?"
• Remember that values provide direction, not rigid rules
• Use values as a source of strength and guidance
• Reflect later on how your values showed up

**Overcoming Values Conflicts:**
When system pressures conflict with your values:
• Focus on your sphere of influence and control
• Find creative ways to honor values within constraints
• Seek support from colleagues who share similar values
• Advocate for changes that better align with your values
• Remember that small acts of values-based care matter

**Weekly Values Reflection:**
End each week by reflecting:
• How did I live my values this week?
• When did I feel most aligned with my values?
• What challenges did I face in living my values?
• How can I better honor my values next week?
• What support do I need to live my values more fully?

**Creating Values Accountability:**
• Share your values with trusted colleagues
• Ask for feedback on how you're living your values
• Create reminders in your workspace
• Build values conversations into team meetings
• Celebrate when you see colleagues living their values

Remember: Living your values isn't about perfection—it's about intention and direction. Small, daily choices to honor your values add up to a meaningful and sustainable healthcare career.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 2,
                "key_takeaways": [
                    "Daily values intentions provide direction and purpose",
                    "Values-based decision making reduces internal conflict",
                    "Values provide strength during challenging moments",
                    "Weekly reflection maintains values connection"
                ],
                "action_items": [
                    "Write your personal values statement",
                    "Set a values-based intention tomorrow morning",
                    "Share your core values with a trusted colleague",
                    "Schedule weekly values reflection time"
                ]
            }
        ]
        
        for module_data in course_10_modules:
            module = CourseModule(course_id="values-guided-reflection", **module_data)
            db.add(module)
        
        print("✅ Course 10: Values-Based Guided Reflection")
        
        # =====================================
        # COURSE 11: POSITIVE REFRAMING AND THOUGHT AWARENESS
        # =====================================
        
        course_11 = Course(
            id="positive-reframing-thought-awareness",
            title="Positive Reframing and Thought Awareness",
            description="Master cognitive strategies to transform stressful thoughts and build mental resilience in healthcare.",
            duration="15 min",
            difficulty="Intermediate",
            icon="refresh-outline",
            color="#34C759",
            category="specialty",
            modules_count=3,
            sort_order=3
        )
        db.add(course_11)
        
        course_11_modules = [
            {
                "module_id": "thought-awareness-basics",
                "title": "Understanding Thought Patterns",
                "content": """Welcome to 'Positive Reframing and Thought Awareness.' Today we're exploring cognitive strategies that can transform your experience of stressful situations.

**The Thought-Emotion Connection:**
Our thoughts about situations directly influence our emotional reactions and stress levels. In healthcare, this is particularly important because:
• High-stress situations can trigger automatic negative thoughts
• These thoughts amplify stress and emotional exhaustion
• Negative thinking patterns can become habitual
• Thought patterns affect patient interactions and care quality

**Common Negative Thought Patterns in Healthcare:**

**Catastrophizing:** Assuming the worst possible outcome will occur
Example: "If I make a mistake, my career is over and I'll hurt someone"

**Black-and-White Thinking:** Seeing situations as all good or all bad
Example: "If I'm not the perfect clinician, I'm failing my patients"

**Personalization:** Taking excessive responsibility for outcomes beyond your control
Example: "If my patient isn't improving, I must be doing something wrong"

**Should Statements:** Rigid rules about how things should be
Example: "The system should work perfectly and I shouldn't need help"

**Mind Reading:** Assuming you know what others are thinking
Example: "My colleagues think I'm incompetent because I asked for help"

**Fortune Telling:** Predicting negative future outcomes
Example: "This shift is going to be terrible and everything will go wrong"

**Emotional Reasoning:** Believing feelings are facts
Example: "I feel overwhelmed, so I must be a bad nurse"

**Mental Filter:** Focusing only on negative aspects while ignoring positives
Example: Only remembering the one difficult patient while forgetting five positive interactions""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Thoughts directly influence emotions and stress levels",
                    "Healthcare settings can trigger automatic negative thinking",
                    "Common patterns include catastrophizing and black-and-white thinking",
                    "Recognizing patterns is the first step to changing them"
                ]
            },
            {
                "module_id": "reframing-techniques",
                "title": "Cognitive Reframing Techniques",
                "content": """**The ABCDE Method for Reframing:**

**A - Adversity:** Identify the stressful situation
**B - Beliefs:** Notice your automatic thoughts about the situation
**C - Consequences:** Observe the emotional and behavioral results
**D - Disputation:** Challenge the negative thoughts
**E - Energization:** Experience the new emotional and behavioral outcomes

**Reframing Examples:**

**Catastrophizing → Balanced Perspective:**
*Negative:* "If I make a mistake, my career is over"
*Reframe:* "Mistakes are part of being human. I can learn from them, make corrections when possible, and remember all the times I've provided excellent care"

**Black-and-White → Nuanced Thinking:**
*Negative:* "If I'm not perfect, I'm failing my patients"
*Reframe:* "Excellence doesn't require perfection. I can be both a skilled clinician who makes occasional mistakes AND a valuable healthcare provider"

**Personalization → Realistic Responsibility:**
*Negative:* "If my patient isn't improving, I must be doing something wrong"
*Reframe:* "Many factors influence patient outcomes, most outside my control. I'm providing evidence-based care with compassion, which is all I can do"

**Should Statements → Acceptance and Action:**
*Negative:* "The system should work perfectly and I shouldn't need help"
*Reframe:* "While improvements would be beneficial, I can only control my response to current reality. Accepting help allows me to provide better care"

**Three-Step Reframing Process:**
1. **Notice:** Become aware of the negative thought
2. **Question:** Is this thought helpful? Is it completely true? What evidence contradicts it?
3. **Replace:** Create a more balanced, compassionate alternative thought""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "The ABCDE method provides structure for reframing",
                    "Balanced perspectives acknowledge reality while reducing stress",
                    "Reframing involves questioning and replacing thoughts",
                    "Goal is helpful thinking, not forced positivity"
                ]
            },
            {
                "module_id": "building-thought-awareness",
                "title": "Building Daily Thought Awareness",
                "content": """**Developing Thought Awareness Skills:**

**Mindful Thought Observation:**
Throughout your day, practice noticing your thoughts without judgment:
• Set random phone alarms to check in with your thinking
• Notice the quality of your internal dialogue
• Observe thoughts like clouds passing through the sky
• Practice the phrase: "I'm having the thought that..."

**Thought Journaling:**
Keep a brief thought log for challenging situations:
• Situation: What happened?
• Thought: What went through your mind?
• Emotion: How did you feel?
• Behavior: What did you do?
• Reframe: What's a more balanced perspective?

**Common Healthcare Reframes:**

**For Perfectionism:**
"I need to be perfect" → "I strive for excellence while accepting that I'm human"

**For Overwhelm:**
"I can't handle this" → "This is challenging, and I have skills and support to get through it"

**For Patient Difficulties:**
"This patient is impossible" → "This patient is struggling, and I can respond with professional compassion"

**For System Frustrations:**
"Nothing ever works here" → "The system has challenges, and I can focus on what I can control"

**For Colleague Conflicts:**
"They're trying to make my life difficult" → "They may be stressed too; I can respond professionally"

**Quick Reframing Techniques:**

**The 10-10-10 Rule:**
Ask yourself: "Will this matter in 10 minutes, 10 months, or 10 years?"

**The Best Friend Test:**
"What would I tell my best friend if they were having this thought?"

**The Evidence Examination:**
"What evidence supports this thought? What evidence contradicts it?"

**The Compassionate Reframe:**
"How would a kind, wise mentor reframe this situation?"

**Building Resilient Thinking Habits:**
• Practice gratitude to balance negative bias
• Use positive self-talk during procedures
• Celebrate small wins and learning moments
• Remind yourself of your strengths and past successes
• Focus on what you can control and influence

Remember: The goal isn't to eliminate all negative thoughts or force false positivity. It's to develop more accurate, balanced, and helpful thinking patterns that serve your wellbeing and effectiveness.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 2,
                "key_takeaways": [
                    "Thought awareness can be developed through mindful observation",
                    "Thought journaling helps identify and change patterns",
                    "Quick reframing techniques provide in-the-moment tools",
                    "Goal is balanced thinking, not forced positivity"
                ],
                "action_items": [
                    "Practice the three-step reframing process with one negative thought",
                    "Set three random alarms to check in with your thinking",
                    "Try the 10-10-10 rule during a stressful moment",
                    "Keep a brief thought log for one challenging day"
                ]
            }
        ]
        
        for module_data in course_11_modules:
            module = CourseModule(course_id="positive-reframing-thought-awareness", **module_data)
            db.add(module)
        
        print("✅ Course 11: Positive Reframing and Thought Awareness")
        
        # =====================================
        # COURSE 12: EMOTION REGULATION IN HIGH-STRESS ENVIRONMENTS
        # =====================================
        
        course_12 = Course(
            id="emotion-regulation-high-stress",
            title="Emotion Regulation in High-Stress Environments",
            description="Advanced strategies for managing emotions effectively during high-stress healthcare situations.",
            duration="18 min",
            difficulty="Advanced",
            icon="heart-half-outline",
            color="#FF3B30",
            category="specialty",
            modules_count=3,
            sort_order=4
        )
        db.add(course_12)
        
        course_12_modules = [
            {
                "module_id": "understanding-emotion-cycle",
                "title": "Understanding the Emotion Cycle in Healthcare",
                "content": """Welcome to 'Emotion Regulation for High-Stress Environments.' Healthcare work is inherently emotional, and without effective regulation skills, this emotional labor can lead to exhaustion and burnout.

**The Healthcare Emotion Cycle:**
1. **Trigger:** Critical patient, angry family member, unexpected outcome, system failure
2. **Automatic Thoughts:** "I should have prevented this," "I'm not good enough," "This is hopeless"
3. **Physiological Response:** Racing heart, shallow breathing, muscle tension, adrenaline surge
4. **Emotional Experience:** Anxiety, frustration, sadness, anger, overwhelm
5. **Behavioral Urge:** Fight, flight, freeze, or fawn response
6. **Action/Reaction:** Your actual response - professional, reactive, or somewhere between

**Why Emotion Regulation Matters in Healthcare:**
• **Patient Safety:** Emotional dysregulation can impair judgment and increase errors
• **Professional Relationships:** Emotional reactivity can damage team dynamics
• **Personal Wellbeing:** Chronic emotional arousal leads to burnout and health problems
• **Care Quality:** Regulated emotions enable compassionate, thoughtful care
• **Resilience:** Emotion regulation skills build long-term career sustainability

**Common Emotional Challenges in Healthcare:**
• Managing anxiety during emergencies while appearing calm
• Processing grief and loss while continuing to care for other patients
• Dealing with frustration from system barriers while maintaining professionalism
• Handling anger from difficult patients or families with grace
• Coping with sadness from poor outcomes while staying hopeful
• Managing fear of making mistakes while taking necessary risks

**The Cost of Poor Emotion Regulation:**
• Emotional exhaustion and depersonalization
• Increased conflict with colleagues and patients
• Poor decision-making under stress
• Physical symptoms (headaches, GI issues, sleep problems)
• Increased risk of medical errors
• Higher turnover and career dissatisfaction""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Healthcare emotions follow a predictable cycle from trigger to action",
                    "Emotion regulation directly impacts patient safety and care quality",
                    "Common challenges include managing anxiety, grief, frustration, and fear",
                    "Poor regulation leads to burnout, errors, and career dissatisfaction"
                ]
            },
            {
                "module_id": "regulation-strategies",
                "title": "Evidence-Based Regulation Strategies",
                "content": """**Strategy 1: Physiological Regulation**

**4-7-8 Breathing Technique:**
• Inhale through nose for 4 counts
• Hold breath for 7 counts
• Exhale through mouth for 8 counts
• Extended exhale activates parasympathetic nervous system
• Reduces heart rate and cortisol within 60 seconds

**Progressive Muscle Relaxation (Quick Version):**
• Tense and release major muscle groups for 5 seconds each
• Start with shoulders, then jaw, hands, and core
• Notice the contrast between tension and relaxation
• Releases physical stress and reduces anxiety

**Cold Water Reset:**
• Splash cold water on face or wrists
• Activates diving reflex, slowing heart rate
• Provides immediate physiological calming
• Can be done discretely in any bathroom

**Strategy 2: Cognitive Regulation**

**Emotional Labeling:**
• Name the emotion specifically: "I'm feeling frustrated and overwhelmed"
• Use nuanced vocabulary: anxious vs. worried, irritated vs. furious
• Research shows labeling reduces emotional intensity by up to 50%
• Creates psychological distance from the emotion

**Perspective Taking:**
• "How might a respected mentor view this situation?"
• "What would I tell a colleague facing this same challenge?"
• "How important will this be in 1 week/month/year?"
• "What can I learn from this experience?"

**Cognitive Reappraisal:**
• Reframe threats as challenges: "This is difficult" → "This is a chance to grow"
• Focus on what you can control: "I can't control the outcome, but I can control my response"
• Find meaning: "This difficult situation allows me to practice compassion"

**Strategy 3: Behavioral Regulation**

**Grounding Techniques:**
• 5-4-3-2-1: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
• Feel feet on floor, notice chair supporting you
• Hold a small object and focus on its texture, weight, temperature
• Anchors you in present moment, interrupts emotional escalation""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 1,
                "key_takeaways": [
                    "Physiological strategies work through nervous system activation",
                    "Cognitive strategies use thinking to regulate emotion",
                    "Behavioral strategies use actions to interrupt emotional cycles",
                    "Multiple strategies provide options for different situations"
                ]
            },
            {
                "module_id": "advanced-regulation-skills",
                "title": "Advanced Regulation and Recovery",
                "content": """**Advanced Regulation Techniques:**

**Emotional Surfing:**
Instead of fighting intense emotions, practice "surfing" them:
• Notice the emotion's physical sensations
• Observe how it builds, peaks, and naturally subsides
• Remind yourself: "This feeling is temporary and will pass"
• Breathe through the intensity without trying to stop it
• Let the emotion move through you like a wave

**Values-Based Response:**
When emotionally triggered, connect with your core values:
• "How can I respond in a way that honors my values?"
• "What would compassion look like in this moment?"
• "How can I maintain my integrity while feeling this way?"
• Use values as an anchor during emotional storms

**Compartmentalization (Healthy Version):**
• Acknowledge the emotion: "I notice I'm feeling sad about that patient"
• Set an intention: "I'll process this fully when my shift ends"
• Use a physical gesture: "I'm putting this in my mental container for later"
• Schedule processing time: "I'll journal about this tonight"
• Trust the process: "It's okay to feel this later when I have time and space"

**Post-Incident Emotional Processing:**

**The SOAR Method:**
• **S**top: Take a moment to pause and breathe
• **O**bserve: Notice what emotions and sensations are present
• **A**llow: Give yourself permission to feel without judgment
• **R**espond: Choose how to care for yourself and move forward

**Healthy Emotional Expression:**
• Talk to trusted colleagues or supervisors
• Use employee assistance programs or counseling
• Write in a private journal
• Engage in physical activity to release tension
• Practice creative expression (art, music, poetry)
• Seek peer support groups for healthcare workers

**Building Emotional Resilience:**

**Daily Practices:**
• Morning emotion check-in: "How am I feeling as I start this day?"
• Midday reset: Brief breathing or grounding exercise
• End-of-shift decompression: 5 minutes to process the day
• Bedtime reflection: "What emotions did I experience today?"

**Weekly Practices:**
• Longer emotional processing sessions
• Professional counseling or therapy
• Peer support group participation
• Mindfulness or meditation practice
• Creative or physical outlets for emotional expression

**Monthly Practices:**
• Comprehensive stress and emotion assessment
• Adjustment of coping strategies based on what's working
• Professional development in emotional intelligence
• Relationship building with support network

**When to Seek Additional Help:**
• Emotions feel out of control or overwhelming daily
• Sleep, appetite, or relationships are significantly affected
• You're using substances to cope with emotions
• Colleagues express concern about your emotional state
• You're considering leaving healthcare due to emotional exhaustion
• You've experienced a traumatic patient event

Remember: Emotional regulation is a skill that improves with practice. Be patient with yourself as you develop these abilities, and don't hesitate to seek professional support when needed.""",
                "duration": "6 min",
                "module_type": "exercise",
                "sort_order": 2,
                "key_takeaways": [
                    "Advanced techniques include emotional surfing and values-based responding",
                    "Healthy compartmentalization allows temporary emotional management",
                    "Regular emotional processing prevents accumulation and burnout",
                    "Professional support is appropriate and recommended for emotional challenges"
                ],
                "action_items": [
                    "Practice one physiological regulation technique during stress",
                    "Try emotional labeling with specific vocabulary",
                    "Schedule weekly emotional processing time",
                    "Identify one person for emotional support conversations"
                ]
            }
        ]
        
        for module_data in course_12_modules:
            module = CourseModule(course_id="emotion-regulation-high-stress", **module_data)
            db.add(module)
        
        print("✅ Course 12: Emotion Regulation in High-Stress Environments")
        
        # =====================================
        # COURSE 13: EFFECTIVE DELEGATION AND SUSTAINABLE PRACTICES
        # =====================================
        
        course_13 = Course(
            id="effective-delegation-sustainable-practices",
            title="Effective Delegation and Sustainable Practices",
            description="Master delegation skills and develop sustainable practices to prevent burnout and optimize team performance.",
            duration="22 min",
            difficulty="Advanced",
            icon="people-outline",
            color="#007AFF",
            category="specialty",
            modules_count=4,
            sort_order=5
        )
        db.add(course_13)
        
        course_13_modules = [
            {
                "module_id": "delegation-fundamentals",
                "title": "Delegation Fundamentals for Healthcare",
                "content": """Welcome to 'Effective Delegation and Sustainable Practices.' Today we'll explore how to work smarter, not harder, through strategic delegation and sustainable work practices.

**Why Delegation Matters in Healthcare:**
• **Burnout Prevention:** Reduces individual workload and stress
• **Team Development:** Builds skills and confidence in team members
• **Efficiency:** Optimizes use of different skill levels and expertise
• **Patient Care:** Allows focus on tasks requiring your specific expertise
• **Career Sustainability:** Prevents exhaustion and promotes longevity

**Common Delegation Barriers in Healthcare:**

**Perfectionism:** "If I want it done right, I need to do it myself"
*Reality:* Something done 80% as well by someone else frees you for tasks only you can perform

**Guilt:** "I don't want to burden my colleagues"
*Reframe:* Delegation as development - you're providing growth opportunities and demonstrating trust

**Control Issues:** "I need to oversee everything"
*Truth:* Micromanaging defeats the purpose and exhausts everyone

**Speed Myth:** "It's faster if I just do it myself"
*Long-term view:* Initial training investment pays off with future efficiency

**Scope Confusion:** "I'm not sure what I can delegate"
*Solution:* Clear understanding of roles, responsibilities, and legal/professional boundaries

**Trust Concerns:** "What if they make a mistake?"
*Balance:* Appropriate supervision with autonomy, matching tasks to competence levels

**Legal and Professional Considerations:**
• Understand scope of practice for different roles
• Know what requires your license vs. what can be delegated
• Ensure proper supervision and accountability structures
• Document delegation decisions and outcomes
• Maintain ultimate responsibility while sharing tasks""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 0,
                "key_takeaways": [
                    "Delegation prevents burnout while developing team capabilities",
                    "Common barriers include perfectionism, guilt, and control issues",
                    "Legal and professional boundaries must guide delegation decisions",
                    "Delegation is an investment in long-term efficiency and team growth"
                ]
            },
            {
                "module_id": "delegation-framework",
                "title": "The CLEAR Delegation Framework",
                "content": """**The CLEAR Framework for Effective Delegation:**

**C - Clarify the Task**
• Define specific outcomes and expectations
• Explain the importance and context
• Identify any constraints or parameters
• Set clear deadlines and milestones
• Provide necessary resources and information

**L - Link to Learning**
• Connect the task to the person's development goals
• Explain how it builds their skills and experience
• Identify what they'll learn from completing it
• Frame as growth opportunity, not burden
• Discuss how it fits into their career progression

**E - Ensure Understanding**
• Ask them to summarize the task in their own words
• Check for questions and clarify any confusion
• Confirm they have necessary resources and authority
• Verify timeline understanding and feasibility
• Establish communication preferences and frequency

**A - Agree on Accountability**
• Define what success looks like
• Establish check-in points and progress updates
• Clarify decision-making authority and boundaries
• Set up monitoring systems without micromanaging
• Agree on escalation procedures for problems

**R - Recognize and Reflect**
• Acknowledge effort and progress throughout
• Provide constructive feedback on outcomes
• Celebrate successes and learn from challenges
• Reflect on what worked well and what could improve
• Apply lessons to future delegation opportunities

**Delegation Decision Matrix:**

**High Skill + High Will = Delegate Fully**
• Minimal supervision required
• Clear expectations and deadlines
• Regular but not frequent check-ins
• Focus on outcomes, not process

**High Skill + Low Will = Motivate and Delegate**
• Explore barriers to motivation
• Connect task to their goals and interests
• Provide autonomy in how to complete task
• Recognize and reward completion

**Low Skill + High Will = Teach and Delegate**
• Provide training and resources
• Start with smaller, simpler tasks
• Frequent check-ins and support
• Gradual increase in complexity and autonomy

**Low Skill + Low Will = Direct, Don't Delegate**
• May not be appropriate for delegation
• Consider if task timing is right
• Address skill and motivation issues first
• Start with very simple, structured tasks""",
                "duration": "6 min",
                "module_type": "reading",
                "sort_order": 1,
                "key_takeaways": [
                    "CLEAR framework provides structure for effective delegation",
                    "Delegation should link to individual development and learning",
                    "Understanding and accountability are crucial for success",
                    "Different skill and motivation levels require different approaches"
                ]
            },
            {
                "module_id": "sustainable-practices",
                "title": "Building Sustainable Work Practices",
                "content": """**Sustainable Practice Principles:**

**Energy Management Over Time Management:**
Instead of just managing time, focus on managing your energy:

**Physical Energy:**
• Schedule demanding tasks during your peak energy hours
• Take regular breaks to prevent fatigue accumulation
• Alternate between high-focus and routine tasks
• Use nutrition and hydration strategically throughout shifts
• Incorporate movement and stretching into your day

**Emotional Energy:**
• Limit emotional labor by setting appropriate boundaries
• Practice emotional regulation techniques proactively
• Seek support before emotional reserves are depleted
• Balance challenging patients with easier interactions when possible
• Process difficult emotions regularly rather than storing them

**Mental Energy:**
• Minimize decision fatigue through routines and protocols
• Batch similar tasks together (all charting, all calls)
• Use checklists and systems to reduce cognitive load
• Take mental breaks between complex cases
• Practice mindfulness to refresh mental clarity

**Spiritual Energy:**
• Connect regularly with your purpose and values
• Engage in activities that restore meaning and hope
• Maintain relationships and interests outside of work
• Practice gratitude and appreciation
• Find moments of beauty and connection during your day

**The 90-Minute Work Cycles:**
Research shows our brains work in 90-minute cycles:
• Schedule intensive work in 90-minute blocks
• Take 15-20 minute breaks between cycles
• Use breaks for movement, fresh air, or social connection
• Honor your natural rhythm rather than fighting it
• Plan demanding tasks for your peak 90-minute periods

**Sustainable Communication Practices:**

**Efficient Handoffs:**
• Use structured communication tools (SBAR, IPASS)
• Prepare key information before communication
• Ask clarifying questions to prevent callbacks
• Document important decisions and rationales
• Follow up on critical items proactively

**Boundary Setting:**
• Establish clear availability hours and stick to them
• Use "No" skillfully: "I can't do X, but I can do Y"
• Delegate upward when appropriate
• Protect time for essential tasks and self-care
• Communicate boundaries kindly but firmly""",
                "duration": "5 min",
                "module_type": "reading",
                "sort_order": 2,
                "key_takeaways": [
                    "Energy management is more important than time management",
                    "Physical, emotional, mental, and spiritual energy all need attention",
                    "90-minute work cycles optimize brain function and prevent fatigue",
                    "Sustainable communication prevents energy drain and improves efficiency"
                ]
            },
            {
                "module_id": "implementation-strategies",
                "title": "Implementation and System Building",
                "content": """**Creating Your Personal Sustainability System:**

**Step 1: Assessment and Planning**
• Audit current workload and identify delegation opportunities
• Assess team members' skills, interests, and development goals
• Map out your energy patterns throughout typical days/weeks
• Identify your most draining and most energizing tasks
• Set realistic goals for delegation and sustainability practices

**Step 2: Start Small and Build**
• Begin with low-risk delegation opportunities
• Implement one sustainable practice at a time
• Track what works and what doesn't
• Adjust systems based on real-world testing
• Celebrate small wins and progress

**Step 3: System Integration**
• Build delegation and sustainability into daily routines
• Create templates and checklists for common processes
• Establish regular review and adjustment periods
• Train others in your systems so they can support you
• Document what works for future reference and training

**Building Team Sustainability:**

**Team Delegation Culture:**
• Model effective delegation for colleagues
• Share delegation successes and lessons learned
• Support colleagues in their delegation efforts
• Create team agreements about workload sharing
• Advocate for systems that support delegation

**Collective Sustainable Practices:**
• Implement team energy management strategies
• Create shared resources and knowledge bases
• Establish team rituals for stress relief and connection
• Support each other's boundaries and self-care
• Address system barriers to sustainability collectively

**Organizational Integration:**

**Advocating for Sustainable Systems:**
• Propose policies that support delegation and sustainability
• Provide feedback on workload and staffing issues
• Participate in quality improvement initiatives
• Share data on efficiency gains from delegation
• Mentor others in sustainable practices

**Professional Development:**
• Seek training in delegation and leadership skills
• Join professional organizations focused on workplace wellness
• Pursue certifications in team management and efficiency
• Stay current with research on sustainable practices
• Share your expertise through teaching and mentoring

**Measuring Success:**

**Personal Metrics:**
• Stress levels and emotional wellbeing
• Work-life balance and time for self-care
• Job satisfaction and sense of accomplishment
• Physical health indicators (sleep, energy, illness)
• Career development and skill building

**Team Metrics:**
• Team member satisfaction and growth
• Efficiency and productivity measures
• Quality outcomes and patient satisfaction
• Team turnover and retention rates
• Collective stress levels and support

**Long-term Sustainability Planning:**

**Career Longevity:**
• Regularly assess and adjust your sustainability practices
• Plan for different career phases and challenges
• Build skills that will serve you throughout your career
• Maintain networks and relationships that provide support
• Stay engaged with purpose and meaning in your work

**Continuous Improvement:**
• Schedule regular review of delegation and sustainability systems
• Seek feedback from colleagues and supervisors
• Stay current with best practices and research
• Adapt systems as your role and responsibilities change
• Share lessons learned with others in your field

Remember: Building sustainable practices and effective delegation skills is an ongoing process. Be patient with yourself as you develop these capabilities, and focus on progress rather than perfection. The goal is to create a healthcare career that you can maintain with energy, enthusiasm, and effectiveness for years to come.""",
                "duration": "5 min",
                "module_type": "exercise",
                "sort_order": 3,
                "key_takeaways": [
                    "Start with assessment and small, low-risk delegation opportunities",
                    "Build systems gradually and integrate them into daily routines",
                    "Team and organizational support amplify individual sustainability efforts",
                    "Regular measurement and adjustment ensure long-term success"
                ],
                "action_items": [
                    "Complete a workload audit to identify delegation opportunities",
                    "Choose one colleague to have a delegation conversation with",
                    "Implement one energy management practice this week",
                    "Schedule monthly reviews of your sustainability systems"
                ]
            }
        ]
        
        for module_data in course_13_modules:
            module = CourseModule(course_id="effective-delegation-sustainable-practices", **module_data)
            db.add(module)
        
        print("✅ Course 13: Effective Delegation and Sustainable Practices")
        
        # Final commit and summary
        db.commit()
        
        print("\n🎉 Successfully seeded all 13 courses from PDF content!")
        print("=" * 60)
        print("📊 FINAL SUMMARY:")
        
        # Get final counts
        course_count = db.query(Course).count()
        module_count = db.query(CourseModule).count()
        
        print(f"   📚 Total Courses: {course_count}")
        print(f"   📖 Total Modules: {module_count}")
        
        # Course breakdown by category
        core_courses = db.query(Course).filter(Course.category == 'core').count()
        quick_wins = db.query(Course).filter(Course.category == 'quick-wins').count()
        specialty = db.query(Course).filter(Course.category == 'specialty').count()
        
        print(f"\n📋 COURSE BREAKDOWN:")
        print(f"   🎯 Core Burnout Prevention: {core_courses} courses")
        print(f"   ⚡ Quick Wins Mini-Courses: {quick_wins} courses")
        print(f"   🏥 Specialty-Specific: {specialty} courses")
        
        print(f"\n✨ Your WellMed app now has a complete burnout prevention curriculum!")
        print(f"🎓 Ready to help healthcare professionals build resilience and prevent burnout!")
        
    except Exception as e:
        print(f"❌ Error seeding courses: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_13_courses()