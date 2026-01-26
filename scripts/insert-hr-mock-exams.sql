-- Insert Mock Exams for HR Subject
-- Subject ID: f1c31287-e2d3-4981-ae57-717a34d7551c

-- Mock Exam 1: Original Exam Style (Comprehensive)
INSERT INTO mock_exams (subject_id, title, description, total_points, time_limit_minutes, questions) VALUES
('f1c31287-e2d3-4981-ae57-717a34d7551c',
'Mock Exam 1: Comprehensive HR Assessment',
'Full-length exam covering all major topics with a focus on HIGH priority areas. Based on the official exam format.',
80,
120,
'[
  {
    "id": "q1",
    "type": "multiple_choice",
    "points": 5,
    "topic": "Kotter''s Change Management",
    "question": "In which step of Kotter''s 8-Step Change Management Model do you create a sense of urgency?",
    "options": [
      "Step 1: Create a Sense of Urgency",
      "Step 3: Form a Strategic Vision",
      "Step 5: Enable Action by Removing Barriers",
      "Step 7: Sustain Acceleration"
    ],
    "correct_answer": 0,
    "explanation": "Step 1 is Create a Sense of Urgency. This involves showing the necessity of change and getting people motivated to act."
  },
  {
    "id": "q2",
    "type": "multiple_choice",
    "points": 5,
    "topic": "Organization Archetypes",
    "question": "Which organizational archetype is characterized by flat hierarchies, team-based structures, and high flexibility?",
    "options": [
      "Machine Organization",
      "Professional Bureaucracy",
      "Adhocracy",
      "Divisionalized Form"
    ],
    "correct_answer": 2,
    "explanation": "Adhocracy is characterized by flat hierarchies, organic structures, and high flexibility. It''s ideal for innovation-driven organizations."
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "points": 5,
    "topic": "Gender Equality",
    "question": "What is the Glass Ceiling effect?",
    "options": [
      "Women prefer family over career advancement",
      "Invisible barriers preventing women from reaching top management positions",
      "Legal restrictions on female employment",
      "The difference in salary between men and women"
    ],
    "correct_answer": 1,
    "explanation": "The Glass Ceiling refers to invisible barriers that prevent women and minorities from advancing to top management positions, despite being qualified."
  },
  {
    "id": "q4",
    "type": "short_answer",
    "points": 8,
    "topic": "Kotter''s Change Management",
    "question": "Name and briefly describe 4 steps of Kotter''s 8-Step Change Management Model.",
    "correct_answer": "1. Create Urgency - Show necessity of change. 2. Form Powerful Coalition - Build leadership team. 3. Create Vision - Develop strategic vision. 4. Communicate Vision - Share the vision widely.",
    "explanation": "The 8 steps are: 1) Create Urgency, 2) Form Coalition, 3) Create Vision, 4) Communicate, 5) Enable Action, 6) Generate Wins, 7) Sustain Acceleration, 8) Institute Change."
  },
  {
    "id": "q5",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Personnel Planning",
    "question": "What does FTE stand for in personnel planning?",
    "options": [
      "Full Time Engagement",
      "Full Time Equivalent",
      "Fixed Term Employment",
      "Flexible Time Estimate"
    ],
    "correct_answer": 1,
    "explanation": "FTE stands for Full Time Equivalent. It''s a unit that indicates the workload of an employed person in a way that makes workloads comparable."
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "points": 5,
    "topic": "Leadership Models",
    "question": "According to Blake and Mouton''s Managerial Grid, which leadership style shows high concern for both people and production?",
    "options": [
      "Impoverished Management (1,1)",
      "Country Club Management (1,9)",
      "Team Management (9,9)",
      "Authority-Compliance (9,1)"
    ],
    "correct_answer": 2,
    "explanation": "Team Management (9,9) represents the ideal leadership style with high concern for both people and production, leading to optimal team performance."
  },
  {
    "id": "q7",
    "type": "short_answer",
    "points": 6,
    "topic": "Span of Control",
    "question": "Calculate the Span of Control: A manager oversees 3 team leaders. Each team leader manages 4 employees. What is the manager''s direct span of control?",
    "correct_answer": "3",
    "explanation": "Direct Span of Control = number of direct reports. The manager has 3 direct reports (the team leaders). The total span including indirect reports would be 15 (3 team leaders + 12 employees)."
  },
  {
    "id": "q8",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Cognitive Biases",
    "question": "The Confirmation Bias refers to:",
    "options": [
      "The tendency to seek information that confirms existing beliefs",
      "Being too confident in one''s abilities",
      "Giving more weight to recent events",
      "Following the crowd without independent thinking"
    ],
    "correct_answer": 0,
    "explanation": "Confirmation Bias is the tendency to search for, interpret, and recall information that confirms pre-existing beliefs while ignoring contradictory evidence."
  },
  {
    "id": "q9",
    "type": "true_false",
    "points": 3,
    "topic": "Gender Equality",
    "question": "The Gender Pay Gap refers only to illegal salary discrimination.",
    "correct_answer": false,
    "explanation": "False. The Gender Pay Gap includes various factors: direct discrimination, occupational segregation, career breaks, part-time work, and societal expectations - not just illegal discrimination."
  },
  {
    "id": "q10",
    "type": "multiple_choice",
    "points": 5,
    "topic": "Organization Archetypes",
    "question": "A hospital with standardized procedures, professional autonomy for doctors, but bureaucratic administration is best described as:",
    "options": [
      "Machine Organization",
      "Professional Bureaucracy",
      "Simple Structure",
      "Adhocracy"
    ],
    "correct_answer": 1,
    "explanation": "Professional Bureaucracy is characterized by standardized skills, professional autonomy, and bureaucratic administration - typical for hospitals, universities, etc."
  },
  {
    "id": "q11",
    "type": "short_answer",
    "points": 8,
    "topic": "Gender Equality",
    "question": "List and briefly explain 3 measures organizations can implement to promote gender equality.",
    "correct_answer": "1. Flexible work arrangements (remote work, flexible hours). 2. Mentorship programs for women. 3. Transparent salary structures and equal pay audits.",
    "explanation": "Key measures include: flexible work policies, mentorship/sponsorship programs, pay equity audits, diverse hiring panels, leadership training for women, and family-friendly policies."
  },
  {
    "id": "q12",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Reiss Profile",
    "question": "The Reiss Motivation Profile identifies how many basic human motivations?",
    "options": [
      "8 motivations",
      "12 motivations",
      "16 motivations",
      "20 motivations"
    ],
    "correct_answer": 2,
    "explanation": "The Reiss Motivation Profile identifies 16 basic desires that drive human behavior: Power, Independence, Curiosity, Acceptance, Order, Saving, Honor, Idealism, Social Contact, Family, Status, Vengeance, Romance, Eating, Physical Activity, and Tranquility."
  },
  {
    "id": "q13",
    "type": "multiple_choice",
    "points": 5,
    "topic": "Kotter''s Change Management",
    "question": "Short-term wins in organizational change should be:",
    "options": [
      "Hidden until the final transformation is complete",
      "Visible, unambiguous, and clearly related to the change effort",
      "Only shared with top management",
      "Postponed until Step 8"
    ],
    "correct_answer": 1,
    "explanation": "Short-term wins (Step 6) should be visible and unambiguous to build momentum, prove the change is working, and maintain motivation throughout the organization."
  },
  {
    "id": "q14",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Cross-Cultural Management",
    "question": "According to Hofstede, which dimension measures the degree to which less powerful members accept unequal power distribution?",
    "options": [
      "Individualism vs. Collectivism",
      "Power Distance",
      "Uncertainty Avoidance",
      "Masculinity vs. Femininity"
    ],
    "correct_answer": 1,
    "explanation": "Power Distance measures the extent to which less powerful members of organizations accept that power is distributed unequally. High power distance cultures accept hierarchical order."
  },
  {
    "id": "q15",
    "type": "short_answer",
    "points": 6,
    "topic": "Leadership Models",
    "question": "Explain the difference between transactional and transformational leadership.",
    "correct_answer": "Transactional: Focus on supervision, organization, and performance. Rewards/punishments based on results. Transformational: Inspires and motivates through vision, encourages innovation, develops followers.",
    "explanation": "Transactional leadership focuses on exchanges and clear structures (contingent rewards). Transformational leadership inspires through vision, intellectual stimulation, and individualized consideration."
  },
  {
    "id": "q16",
    "type": "true_false",
    "points": 3,
    "topic": "Personnel Planning",
    "question": "An employee working 20 hours per week in a company with a 40-hour work week has an FTE of 0.5.",
    "correct_answer": true,
    "explanation": "True. FTE = actual hours / standard full-time hours = 20/40 = 0.5 FTE."
  },
  {
    "id": "q17",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Employer Branding",
    "question": "Employer Branding primarily aims to:",
    "options": [
      "Increase product sales",
      "Attract and retain qualified employees",
      "Reduce production costs",
      "Expand to international markets"
    ],
    "correct_answer": 1,
    "explanation": "Employer Branding focuses on building and promoting the company''s reputation as an employer to attract, recruit, and retain talented employees."
  },
  {
    "id": "q18",
    "type": "essay",
    "points": 10,
    "topic": "Change Management",
    "question": "A company wants to transition from traditional office work to a hybrid model (3 days office, 2 days home office). Using Kotter''s 8 Steps, outline how you would manage this change. Focus on Steps 1-4.",
    "correct_answer": "Step 1: Create urgency by showing benefits (productivity, work-life balance, cost savings). Step 2: Form coalition with management and employee representatives. Step 3: Create vision of flexible, trust-based work culture. Step 4: Communicate through town halls, emails, and pilot programs.",
    "explanation": "A comprehensive answer should address: 1) Creating urgency with data and employee needs, 2) Building a diverse change team, 3) Developing a clear vision of the hybrid future, and 4) Communicating extensively through multiple channels."
  }
]'::jsonb);

-- Mock Exam 2: Focus on HIGH Priority Topics
INSERT INTO mock_exams (subject_id, title, description, total_points, time_limit_minutes, questions) VALUES
('f1c31287-e2d3-4981-ae57-717a34d7551c',
'Mock Exam 2: High Priority Topics Deep Dive',
'Focused assessment on the most important exam topics: Kotter, Organization Archetypes, and Gender Equality. 60 minutes, 50 points.',
50,
60,
'[
  {
    "id": "q1",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Kotter''s Change Management",
    "question": "Which step involves removing obstacles and changing systems/structures that undermine the vision?",
    "options": [
      "Step 3: Form a Strategic Vision",
      "Step 5: Enable Action by Removing Barriers",
      "Step 6: Generate Short-Term Wins",
      "Step 7: Sustain Acceleration"
    ],
    "correct_answer": 1,
    "explanation": "Step 5 (Enable Action by Removing Barriers) involves removing obstacles like restrictive structures, lack of skills, or resistant managers."
  },
  {
    "id": "q2",
    "type": "short_answer",
    "points": 10,
    "topic": "Kotter''s Change Management",
    "question": "List all 8 steps of Kotter''s Change Management Model in the correct order.",
    "correct_answer": "1. Create Urgency, 2. Form Powerful Coalition, 3. Create Strategic Vision, 4. Communicate Vision, 5. Enable Action, 6. Generate Short-Term Wins, 7. Sustain Acceleration, 8. Institute Change",
    "explanation": "Mnemonic: UK For Cash Every Generation Shall Continue - Urgency, Koalition, Form vision, Communicate, Enable, Generate wins, Sustain, Continue/institutionalize."
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Organization Archetypes",
    "question": "The Simple Structure archetype is best suited for:",
    "options": [
      "Large multinational corporations",
      "Small, young companies with direct supervision",
      "Complex hospital systems",
      "Innovative research organizations"
    ],
    "correct_answer": 1,
    "explanation": "Simple Structure is ideal for small, young organizations with few employees, centralized decision-making, and direct supervision by the owner/founder."
  },
  {
    "id": "q4",
    "type": "true_false",
    "points": 3,
    "topic": "Organization Archetypes",
    "question": "Machine Organizations are characterized by high flexibility and organic structures.",
    "correct_answer": false,
    "explanation": "False. Machine Organizations are characterized by standardization, formalization, centralization, and mechanical structures - not flexibility."
  },
  {
    "id": "q5",
    "type": "short_answer",
    "points": 8,
    "topic": "Organization Archetypes",
    "question": "Compare and contrast Machine Organization and Adhocracy in terms of structure, decision-making, and suitable environment.",
    "correct_answer": "Machine: Bureaucratic, centralized, standardized processes, stable environment. Adhocracy: Organic, decentralized, flexible, dynamic/innovative environment.",
    "explanation": "Machine Organizations thrive in stable, predictable environments with efficiency focus. Adhocracies excel in dynamic, innovative environments requiring flexibility and creativity."
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Gender Equality",
    "question": "Which of the following is NOT a component of the Gender Pay Gap?",
    "options": [
      "Occupational segregation (women in lower-paid sectors)",
      "Career interruptions for childcare",
      "Women being naturally less interested in high-paying careers",
      "Part-time work prevalence among women"
    ],
    "correct_answer": 2,
    "explanation": "The idea that women are ''naturally less interested'' is a stereotype, not a structural component of the pay gap. The gap results from societal structures, discrimination, and systemic factors."
  },
  {
    "id": "q7",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Gender Equality",
    "question": "Unconscious Bias refers to:",
    "options": [
      "Intentional discrimination against certain groups",
      "Automatic mental associations we make without conscious awareness",
      "Legal restrictions on hiring practices",
      "Differences in educational background"
    ],
    "correct_answer": 1,
    "explanation": "Unconscious (implicit) bias refers to automatic associations and stereotypes that affect our decisions without conscious awareness or intention."
  },
  {
    "id": "q8",
    "type": "essay",
    "points": 13,
    "topic": "Gender Equality",
    "question": "A tech company notices that women make up only 15% of its senior leadership, despite representing 35% of overall employees. Analyze possible causes of this disparity and propose at least 4 concrete measures the company could implement to address it.",
    "correct_answer": "Causes: unconscious bias, lack of mentorship, inflexible work policies, male-dominated culture. Measures: mentorship programs, flexible work, diverse hiring panels, leadership training for women, salary audits.",
    "explanation": "Strong answers should identify multiple causes (structural barriers, bias, culture) and propose comprehensive solutions addressing different aspects of the problem."
  }
]'::jsonb);

-- Mock Exam 3: Mixed Topics Quick Assessment
INSERT INTO mock_exams (subject_id, title, description, total_points, time_limit_minutes, questions) VALUES
('f1c31287-e2d3-4981-ae57-717a34d7551c',
'Mock Exam 3: Comprehensive Quick Review',
'Shorter exam covering all topics for final review. Perfect for testing overall knowledge before the real exam. 45 minutes, 40 points.',
40,
45,
'[
  {
    "id": "q1",
    "type": "multiple_choice",
    "points": 3,
    "topic": "Kotter''s Change Management",
    "question": "The final step in Kotter''s model is:",
    "options": [
      "Generate Short-Term Wins",
      "Sustain Acceleration",
      "Institute Change",
      "Celebrate Success"
    ],
    "correct_answer": 2,
    "explanation": "Step 8 is Institute Change (Anchor New Approaches in Culture). This ensures changes become embedded in the organization''s culture."
  },
  {
    "id": "q2",
    "type": "true_false",
    "points": 2,
    "topic": "Leadership Models",
    "question": "Situational Leadership suggests there is one best leadership style for all situations.",
    "correct_answer": false,
    "explanation": "False. Situational Leadership (Hersey-Blanchard) argues that effective leaders adapt their style based on follower readiness and task requirements."
  },
  {
    "id": "q3",
    "type": "multiple_choice",
    "points": 3,
    "topic": "Cognitive Biases",
    "question": "The Dunning-Kruger Effect describes:",
    "options": [
      "Experts doubting their abilities",
      "Incompetent people overestimating their abilities",
      "The tendency to remember positive events",
      "Following the majority opinion"
    ],
    "correct_answer": 1,
    "explanation": "The Dunning-Kruger Effect is a cognitive bias where people with low ability overestimate their competence, while experts tend to underestimate theirs."
  },
  {
    "id": "q4",
    "type": "short_answer",
    "points": 6,
    "topic": "Span of Control",
    "question": "Explain the difference between a flat organizational structure and a tall organizational structure in terms of span of control and hierarchy levels.",
    "correct_answer": "Flat: Wide span of control, few hierarchy levels, more autonomy. Tall: Narrow span of control, many hierarchy levels, more supervision.",
    "explanation": "Flat structures have wide spans of control (many subordinates per manager) and few levels. Tall structures have narrow spans (few subordinates) and many hierarchical levels."
  },
  {
    "id": "q5",
    "type": "multiple_choice",
    "points": 3,
    "topic": "Personnel Selection",
    "question": "Which personnel selection method typically has the highest predictive validity?",
    "options": [
      "Unstructured interviews",
      "Graphology (handwriting analysis)",
      "Structured interviews with job-related questions",
      "Astrology"
    ],
    "correct_answer": 2,
    "explanation": "Structured interviews with behavioral and situational questions have high predictive validity (~0.50). Unstructured interviews are less reliable, and graphology/astrology have no scientific validity."
  },
  {
    "id": "q6",
    "type": "multiple_choice",
    "points": 3,
    "topic": "Cross-Cultural Management",
    "question": "In a high-context culture (like Japan or Arab countries), communication is characterized by:",
    "options": [
      "Direct, explicit verbal messages",
      "Reliance on context, nonverbal cues, and implicit messages",
      "Written contracts containing all details",
      "Ignoring social hierarchy"
    ],
    "correct_answer": 1,
    "explanation": "High-context cultures rely heavily on implicit communication, nonverbal cues, relationships, and context. Low-context cultures (USA, Germany) prefer explicit, direct communication."
  },
  {
    "id": "q7",
    "type": "true_false",
    "points": 2,
    "topic": "Organization Archetypes",
    "question": "The Divisionalized Form organizes by product lines or geographic regions, giving each division autonomy.",
    "correct_answer": true,
    "explanation": "True. The Divisionalized Form (multi-divisional structure) groups activities by products, services, or geographic areas, with each division having significant operational autonomy."
  },
  {
    "id": "q8",
    "type": "multiple_choice",
    "points": 4,
    "topic": "Gender Equality",
    "question": "Affirmative Action programs aim to:",
    "options": [
      "Give preferential treatment regardless of qualifications",
      "Address historical discrimination by promoting diversity",
      "Exclude majority groups from opportunities",
      "Lower standards for underrepresented groups"
    ],
    "correct_answer": 1,
    "explanation": "Affirmative Action aims to address historical discrimination and promote equal opportunity for underrepresented groups, not to lower standards or exclude others."
  },
  {
    "id": "q9",
    "type": "short_answer",
    "points": 6,
    "topic": "Personnel Planning",
    "question": "Calculate: A department needs 200 hours of work per week. Each full-time employee works 40 hours/week. How many FTEs does the department need?",
    "correct_answer": "5 FTE (200 hours ÷ 40 hours/week = 5 FTE)",
    "explanation": "FTE = Total required hours / Standard full-time hours = 200 / 40 = 5 FTE. This could be 5 full-time employees, or any combination equaling 5 FTE (e.g., 4 full-time + 2 half-time)."
  },
  {
    "id": "q10",
    "type": "multiple_choice",
    "points": 3,
    "topic": "Teamwork",
    "question": "The Ringelmann Effect (social loafing) describes:",
    "options": [
      "Teams performing better than individuals",
      "Individual effort decreasing in group settings",
      "Groups making better decisions than individuals",
      "Improved motivation in teams"
    ],
    "correct_answer": 1,
    "explanation": "The Ringelmann Effect describes social loafing - the tendency for individuals to exert less effort in group settings than when working alone."
  },
  {
    "id": "q11",
    "type": "short_answer",
    "points": 5,
    "topic": "Reiss Profile",
    "question": "Name 5 of the 16 basic motivations in the Reiss Motivation Profile.",
    "correct_answer": "Examples: Power, Independence, Curiosity, Acceptance, Order, Saving, Honor, Idealism, Social Contact, Family, Status, Romance, Physical Activity",
    "explanation": "The 16 motivations are: Power, Independence, Curiosity, Acceptance, Order, Saving, Honor, Idealism, Social Contact, Family, Status, Vengeance, Romance, Eating, Physical Activity, Tranquility."
  }
]'::jsonb);
