-- To run:
-- docker-compose exec db psql -U myuser -d wellmed_db -f sample_data.sql


-- Insert courses
INSERT INTO courses (id, title, description, duration, difficulty, icon, color, category, modules_count, sort_order, is_active) VALUES
('burnout-basics', 'What is Burnout?', 'Understanding the signs, symptoms, and science behind physician burnout', '15 min', 'Beginner', 'information-circle-outline', '#007AFF', 'core', 4, 1, true),
('micro-resilience', 'Micro-Resilience: Two-Minute Stress Reducers', 'Quick, evidence-based techniques you can use anywhere', '12 min', 'Beginner', 'flash-outline', '#FF9500', 'core', 2, 2, true),
('values-based-prevention', 'Know Your Why: Values-Based Burnout Prevention', 'Reconnect with your core values and purpose in medicine', '20 min', 'Beginner', 'heart-outline', '#34C759', 'core', 1, 3, true),
('quick-breathing', '5-Minute Energy Reset', 'Quick breathing exercises for instant stress relief', '5 min', 'Beginner', 'leaf-outline', '#34C759', 'quick-wins', 1, 1, true);

-- Insert course modules
INSERT INTO course_modules (course_id, module_id, title, content, duration, module_type, sort_order, key_takeaways, action_items) VALUES

-- Burnout Basics modules
('burnout-basics', 'intro', 'Introduction to Burnout', 
'Burnout is more than just feeling tired after a long shift. It''s a psychological syndrome that emerges as a prolonged response to chronic interpersonal stressors on the job.

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

Understanding these factors is the first step in prevention.', 
'4 min', 'reading', 0, 
'["Burnout has three distinct dimensions", "Healthcare professionals face unique risk factors", "Early recognition is key to prevention"]', 
NULL),

('burnout-basics', 'science', 'The Science Behind Burnout', 
'Research shows that burnout creates measurable changes in your brain and body:

Neurological Impact:
- Chronic stress shrinks the prefrontal cortex (decision-making center)
- The amygdala (fear center) becomes hyperactive
- Memory and concentration are impaired

Physical Effects:
- Elevated cortisol levels
- Compromised immune function
- Increased risk of cardiovascular disease
- Sleep disruption

The good news? These changes are largely reversible with proper intervention.', 
'3 min', 'reading', 1, 
'["Burnout creates measurable brain changes", "Physical health is directly impacted", "Recovery is possible with intervention"]', 
NULL),

('burnout-basics', 'recognition', 'Recognizing the Signs', 
'Early Warning Signs:

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
- Negative self-talk', 
'5 min', 'interactive', 2, 
'["Burnout affects emotional, behavioral, physical, and cognitive domains", "Early recognition prevents progression", "Signs can be subtle at first"]', 
'["Complete a self-assessment checklist", "Identify your personal warning signs", "Share concerns with a trusted colleague"]'),

('burnout-basics', 'prevention', 'Prevention Strategies', 
'Evidence-Based Prevention:

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

Remember: Prevention is more effective than treatment. Small, consistent actions make a big difference.', 
'3 min', 'reading', 3, 
'["Both individual and organizational factors matter", "Prevention is more effective than treatment", "Small, consistent actions create change"]', 
'["Choose one prevention strategy to implement this week", "Schedule monthly burnout self-assessments", "Identify resources available in your workplace"]'),

-- Micro-Resilience modules
('micro-resilience', 'intro-micro', 'What is Micro-Resilience?', 
'Micro-resilience refers to small, quick interventions that can be done in 2 minutes or less to reset your stress response and build resilience throughout your day.

These techniques are specifically designed for healthcare professionals who:
- Have limited time between patients
- Need quick stress relief
- Want to prevent stress accumulation
- Work in high-pressure environments

The science behind micro-interventions shows that even brief moments of intentional practice can:
- Lower cortisol levels
- Activate the parasympathetic nervous system
- Improve focus and decision-making
- Build long-term resilience', 
'3 min', 'reading', 0, 
'["Micro-resilience uses brief, 2-minute interventions", "Perfect for busy healthcare schedules", "Small actions have measurable physiological benefits"]', 
NULL),

('micro-resilience', 'breathing-reset', 'The 90-Second Breathing Reset', 
'This technique activates your parasympathetic nervous system in just 90 seconds:

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
- When feeling overwhelmed', 
'2 min', 'exercise', 1, 
'["Takes only 90 seconds to complete", "Activates parasympathetic nervous system", "Can be done anywhere, anytime"]', 
'["Practice the technique now", "Set 3 phone reminders today to use this", "Notice how you feel before and after"]'),

-- Values-Based Prevention module
('values-based-prevention', 'rediscovering-why', 'Rediscovering Your Why', 
'When burnout sets in, we often lose connection with the deeper reasons we chose healthcare. Reconnecting with your "why" is one of the most powerful burnout prevention strategies.

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

The goal isn''t to recreate your original motivation, but to evolve and deepen your understanding of what gives your work meaning today.', 
'4 min', 'reading', 0, 
'["Purpose and meaning are powerful burnout preventers", "Your \"why\" can evolve throughout your career", "Strong purpose correlates with better outcomes"]', 
NULL),

-- Quick Breathing module
('quick-breathing', 'energy-reset', '5-Minute Energy Reset Protocol', 
'This evidence-based breathing sequence is designed to quickly restore energy and mental clarity:

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

This protocol activates the parasympathetic nervous system while providing an energy boost through improved oxygenation.', 
'5 min', 'exercise', 0, 
'["Complete protocol takes exactly 5 minutes", "Combines centering, energizing, and balancing elements", "Provides both immediate and sustained benefits"]', 
'["Practice the complete protocol right now", "Use it during your next break between patients", "Notice and record how you feel before and after"]');

-- Verify the data was inserted
SELECT 'Courses inserted:' as info, COUNT(*) as count FROM courses;
SELECT 'Modules inserted:' as info, COUNT(*) as count FROM course_modules;
