# HR Lernapp - Implementierungsplan

## Ziel
Wenn User auf HR-Kachel klickt → Übersichtsseite mit allen Lernoptionen

## Struktur

```
HR Kachel
    ↓
HR Overview Page
    ├── 📚 Study Flashcards (70 Cards)
    ├── 📖 Study Guide Viewer (HR_LERNZETTEL.md)
    ├── 📊 Learning Matrix (Topics Overview)
    └── 🎯 Mock Exams
        ├── Mock Exam 1
        ├── Mock Exam 2
        └── Mock Exam 3
```

## Features zu implementieren

### 1. HR Overview Page ✅ (JETZT)
**Route:** `/dashboard/hr-overview/[subjectId]`

**UI Components:**
- Hero Section mit Subject Info
- 4 große Cards für die Optionen:
  1. **Flashcards lernen** - Link zu `/dashboard/study/[id]`
  2. **Lernzettel ansehen** - Link zu `/dashboard/hr-overview/[id]/study-guide`
  3. **Lernmatrix** - Link zu `/dashboard/hr-overview/[id]/matrix`
  4. **Mock Exams** - Link zu `/dashboard/hr-overview/[id]/mock-exams`

**Features:**
- Progress indicators (wie viele Cards gelernt, welche Mock Exams gemacht)
- Quick stats (Total cards, Topics covered, etc.)

---

### 2. Study Guide Viewer
**Route:** `/dashboard/hr-overview/[id]/study-guide`

**Features:**
- Markdown Viewer für HR_LERNZETTEL.md
- Table of Contents (automatisch aus Headings)
- Search/Filter durch Topics
- Dark/Light Mode Support
- Print-friendly version

**Tech:**
- React Markdown oder next-mdx-remote
- Syntax highlighting für Code blocks
- Responsive design

---

### 3. Learning Matrix
**Route:** `/dashboard/hr-overview/[id]/matrix`

**Features:**
- Übersicht aller Topics
- Priority Level (High/Medium/Low)
- Points/Weight im Exam
- Anzahl Cards pro Topic
- Progress pro Topic
- Quick Links zu Cards für jedes Topic

**Table Structure:**
| Topic | Priority | Exam Points | Cards | Progress | Actions |
|-------|----------|-------------|-------|----------|---------|
| Kotter's 8 Steps | HIGH | 30% | 10 | 7/10 | Study |
| Organization Archetypes | HIGH | 25% | 9 | 3/9 | Study |
| ... | ... | ... | ... | ... | ... |

**Features:**
- Sortierbar nach Priority, Progress, etc.
- Filterbar nach Priority Level
- Color-coded Progress bars

---

### 4. Mock Exams System
**Route:** `/dashboard/hr-overview/[id]/mock-exams`

**Overview Page:**
- Liste aller Mock Exams
- Status (Not started, In Progress, Completed)
- Score History
- Time taken
- "Start New Attempt" Button

**Mock Exam Page:**
**Route:** `/dashboard/hr-overview/[id]/mock-exams/[examId]`

**Features:**
- Timer (optional)
- Question Navigator (jump to any question)
- Mark for Review
- Progress indicator (Question 5/18)
- Different question types:
  - Multiple Choice
  - True/False
  - Short Answer (text input)
  - Essay (textarea)
- Save progress (can continue later)
- Submit button

**Results Page:**
**Route:** `/dashboard/hr-overview/[id]/mock-exams/[examId]/results`

**Features:**
- Overall Score (X/80 points)
- Breakdown by topic
- Correct/Wrong answers shown
- Detailed explanations
- Time statistics
- "Review incorrect answers"
- "Try again" button
- Export results as PDF

---

## Mock Exams Content (aus PDF erstellen)

### Mock Exam 1 - Original Exam
**Quelle:** Exemplary Exam_HR_GBE.pdf
- 18 Tasks
- 80 Points total
- Mix aus Multiple Choice, Case Studies, Calculations

### Mock Exam 2 - Variation 1
- Andere Fragen zu gleichen Topics
- Gleiche Point-Verteilung
- Neue Case Studies

### Mock Exam 3 - Variation 2
- Focus auf HIGH PRIORITY Topics
- Kürzere Version (12 Tasks, 50 Points)
- Zeitlimit: 60 Minuten

---

## Datenbank Schema

### `mock_exams` Table
```sql
CREATE TABLE mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  total_points INTEGER NOT NULL,
  time_limit_minutes INTEGER,
  questions JSONB NOT NULL, -- Array of questions
  created_at TIMESTAMP DEFAULT now()
);
```

### `mock_exam_attempts` Table
```sql
CREATE TABLE mock_exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  exam_id UUID REFERENCES mock_exams(id),
  answers JSONB NOT NULL, -- User's answers
  score INTEGER,
  max_score INTEGER,
  time_taken_seconds INTEGER,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  status TEXT DEFAULT 'in_progress' -- in_progress, completed
);
```

### Question Format (JSONB)
```json
{
  "id": "q1",
  "type": "multiple_choice",
  "points": 4,
  "topic": "Kotter's Change Management",
  "question": "What is the first step...",
  "options": ["A", "B", "C", "D"],
  "correct_answer": 0,
  "explanation": "The first step is..."
}
```

---

## Implementation Steps

### Phase 1: HR Overview Page ⏳
- [x] Create route structure
- [ ] Design Overview UI
- [ ] Implement 4 option cards
- [ ] Add stats/progress indicators
- [ ] Update HR subject card to link to overview

### Phase 2: Study Guide Viewer
- [ ] Convert HR_LERNZETTEL.md to public asset
- [ ] Create markdown viewer component
- [ ] Implement TOC
- [ ] Add search functionality
- [ ] Style with Tailwind

### Phase 3: Learning Matrix
- [ ] Extract topics from cards (via tags)
- [ ] Calculate stats per topic
- [ ] Create table component
- [ ] Implement filters/sorting
- [ ] Add progress tracking

### Phase 4: Mock Exam System
- [ ] Create database schema
- [ ] Parse PDF and create 3 exams
- [ ] Build exam UI components
- [ ] Implement timer
- [ ] Build results page
- [ ] Add review functionality

### Phase 5: Integration & Polish
- [ ] Connect all pages
- [ ] Add navigation
- [ ] Implement RLS policies
- [ ] Test all flows
- [ ] Build & Deploy

---

## Current Status
- ✅ 70 Flashcards created (English)
- ✅ Study guide written (German)
- ✅ Cards imported to database
- ⏳ Starting Phase 1: HR Overview Page

---

## Next Actions
1. Create `/app/(dashboard)/dashboard/hr-overview/[id]/page.tsx`
2. Design and implement overview UI
3. Update subject card link
4. Continue with Study Guide Viewer
