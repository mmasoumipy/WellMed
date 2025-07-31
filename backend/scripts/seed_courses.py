"""
Script to seed the database with course data that matches the mobile app expectations.
Run this script to populate your courses and course_modules tables.
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from datetime import datetime
import uuid

# Create all tables
models.Base.metadata.create_all(bind=engine)

def seed_courses():
    db = SessionLocal()
    
    try:
        # Check if courses already exist
        existing_courses = db.query(models.Course).count()
        if existing_courses > 0:
            print(f"Database already has {existing_courses} courses. Skipping seed.")
            return
        
        # Core Burnout Prevention Courses
        core_courses = [
            {
                'id': 'burnout-basics',
                'title': 'What is Burnout?',
                'description': 'Understanding the signs, symptoms, and science behind physician burnout',
                'duration': '15 min',
                'difficulty': 'Beginner',
                'icon': 'information-circle-outline',
                'color': '#4A90E2',
                'category': 'core',
                'modules_count': 4,
                'sort_order': 1,
            },
            {
                'id': 'micro-resilience',
                'title': 'Micro-Resilience: Two-Minute Stress Reducers',
                'description': 'Quick, evidence-based techniques you can use anywhere',
                'duration': '12 min',
                'difficulty': 'Beginner',
                'icon': 'flash-outline',
                'color': '#F5A623',
                'category': 'core',
                'modules_count': 6,
                'sort_order': 2,
            },
            {
                'id': 'values-based-prevention',
                'title': 'Know Your Why: Values-Based Burnout Prevention',
                'description': 'Reconnect with your core values and purpose in medicine',
                'duration': '20 min',
                'difficulty': 'Beginner',
                'icon': 'heart-outline',
                'color': '#7ED321',
                'category': 'core',
                'modules_count': 5,
                'sort_order': 3,
            },
            {
                'id': 'stress-signals',
                'title': 'Stress Signals: Recognizing Your Personal Warning Signs',
                'description': 'Learn to identify early warning signs before burnout takes hold',
                'duration': '18 min',
                'difficulty': 'Intermediate',
                'icon': 'warning-outline',
                'color': '#F8E71C',
                'category': 'core',
                'modules_count': 4,
                'sort_order': 4,
            },
        ]
        
        # Quick Wins Mini-Courses
        quick_wins_courses = [
            {
                'id': 'quick-breathing',
                'title': '5-Minute Energy Reset',
                'description': 'Quick breathing exercises for instant stress relief',
                'duration': '5 min',
                'difficulty': 'Beginner',
                'icon': 'leaf-outline',
                'color': '#7ED321',
                'category': 'quick-wins',
                'modules_count': 1,
                'sort_order': 1,
            },
            {
                'id': 'quick-mindfulness',
                'title': 'Mindful Transitions',
                'description': 'Brief mindfulness practices between patients',
                'duration': '3 min',
                'difficulty': 'Beginner',
                'icon': 'eye-outline',
                'color': '#50E3C2',
                'category': 'quick-wins',
                'modules_count': 1,
                'sort_order': 2,
            },
            {
                'id': 'quick-posture',
                'title': 'Posture Power-Up',
                'description': 'Combat fatigue with quick posture corrections',
                'duration': '4 min',
                'difficulty': 'Beginner',
                'icon': 'body-outline',
                'color': '#F8E71C',
                'category': 'quick-wins',
                'modules_count': 1,
                'sort_order': 3,
            },
        ]
        
        # Specialty-Specific Courses
        specialty_courses = [
            {
                'id': 'icu-specific',
                'title': 'ICU Resilience Strategies',
                'description': 'Specialized approaches for intensive care professionals',
                'duration': '35 min',
                'difficulty': 'Advanced',
                'icon': 'medical-outline',
                'color': '#D0021B',
                'category': 'specialty',
                'modules_count': 7,
                'sort_order': 1,
            },
            {
                'id': 'nursing-wellness',
                'title': 'Nursing Self-Care Essentials',
                'description': 'Tailored wellness strategies for nursing professionals',
                'duration': '28 min',
                'difficulty': 'Intermediate',
                'icon': 'heart-circle-outline',
                'color': '#4A90E2',
                'category': 'specialty',
                'modules_count': 5,
                'sort_order': 2,
            },
        ]
        
        all_courses = core_courses + quick_wins_courses + specialty_courses
        
        # Create courses
        for course_data in all_courses:
            course = models.Course(**course_data)
            db.add(course)
            db.flush()  # Get the course ID
            
            # Create modules for each course
            if course.id == 'burnout-basics':
                modules = [
                    {
                        'course_id': course.id,
                        'module_id': 'intro',
                        'title': 'Introduction to Burnout',
                        'content': '''Burnout is more than just feeling tired after a long shift. It's a psychological syndrome that emerges as a prolonged response to chronic interpersonal stressors on the job.

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

Understanding these factors is the first step in prevention.''',
                        'duration': '4 min',
                        'module_type': 'reading',
                        'sort_order': 0,
                        'key_takeaways': ['Burnout has three distinct dimensions', 'Healthcare professionals face unique risk factors', 'Early recognition is key to prevention'],
                    },
                    {
                        'course_id': course.id,
                        'module_id': 'science',
                        'title': 'The Science Behind Burnout',
                        'content': '''Research shows that burnout creates measurable changes in your brain and body:

Neurological Impact:
- Chronic stress shrinks the prefrontal cortex (decision-making center)
- The amygdala (fear center) becomes hyperactive
- Memory and concentration are impaired

Physical Effects:
- Elevated cortisol levels
- Compromised immune function
- Increased risk of cardiovascular disease
- Sleep disruption

The good news? These changes are largely reversible with proper intervention.''',
                        'duration': '3 min',
                        'module_type': 'reading',
                        'sort_order': 1,
                        'key_takeaways': ['Burnout creates measurable brain changes', 'Physical health is directly impacted', 'Recovery is possible with intervention'],
                    },
                    {
                        'course_id': course.id,
                        'module_id': 'recognition',
                        'title': 'Recognizing the Signs',
                        'content': '''Early Warning Signs:

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
- Negative self-talk''',
                        'duration': '5 min',
                        'module_type': 'interactive',
                        'sort_order': 2,
                        'key_takeaways': ['Burnout affects emotional, behavioral, physical, and cognitive domains', 'Early recognition prevents progression', 'Signs can be subtle at first'],
                        'action_items': ['Complete a self-assessment checklist', 'Identify your personal warning signs', 'Share concerns with a trusted colleague'],
                    },
                    {
                        'course_id': course.id,
                        'module_id': 'prevention',
                        'title': 'Prevention Strategies',
                        'content': '''Evidence-Based Prevention:

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

Remember: Prevention is more effective than treatment. Small, consistent actions make a big difference.''',
                        'duration': '3 min',
                        'module_type': 'reading',
                        'sort_order': 3,
                        'key_takeaways': ['Both individual and organizational factors matter', 'Prevention is more effective than treatment', 'Small, consistent actions create change'],
                        'action_items': ['Choose one prevention strategy to implement this week', 'Schedule monthly burnout self-assessments', 'Identify resources available in your workplace'],
                    },
                ]
            elif course.id == 'quick-breathing':
                modules = [
                    {
                        'course_id': course.id,
                        'module_id': 'energy-reset',
                        'title': '5-Minute Energy Reset Protocol',
                        'content': '''This evidence-based breathing sequence is designed to quickly restore energy and mental clarity:

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

This protocol activates the parasympathetic nervous system while providing an energy boost through improved oxygenation.''',
                        'duration': '5 min',
                        'module_type': 'exercise',
                        'sort_order': 0,
                        'key_takeaways': ['Complete protocol takes exactly 5 minutes', 'Combines centering, energizing, and balancing elements', 'Provides both immediate and sustained benefits'],
                        'action_items': ['Practice the complete protocol right now', 'Use it during your next break between patients', 'Notice and record how you feel before and after'],
                    },
                ]
            else:
                # Default module for other courses
                modules = [
                    {
                        'course_id': course.id,
                        'module_id': 'intro',
                        'title': f'Introduction to {course.title}',
                        'content': f'''Welcome to {course.title}!

This course is designed specifically for healthcare professionals to help with burnout prevention and wellness.

Course Overview:
{course.description}

Duration: {course.duration}
Difficulty: {course.difficulty}

What you'll learn:
- Evidence-based strategies for wellness
- Practical techniques you can use immediately
- Tools for long-term burnout prevention
- How to integrate wellness into your daily routine

Let's begin your journey to better wellbeing!''',
                        'duration': '3 min',
                        'module_type': 'reading',
                        'sort_order': 0,
                        'key_takeaways': ['Course designed for healthcare professionals', 'Evidence-based approach to wellness', 'Practical, immediately applicable techniques'],
                    },
                ]
            
            # Create the modules
            for module_data in modules:
                module = models.CourseModule(**module_data)
                db.add(module)
        
        db.commit()
        print(f"Successfully seeded {len(all_courses)} courses with their modules!")
        
        # Print summary
        for course in all_courses:
            print(f"- {course['title']} ({course['category']}) - {course['modules_count']} modules")
    
    except Exception as e:
        db.rollback()
        print(f"Error seeding courses: {e}")
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting course seeding...")
    seed_courses()
    print("Course seeding completed!")