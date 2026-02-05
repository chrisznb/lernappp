import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// User credentials
const USER_EMAIL = 'mirelacostea0022@gmail.com'

async function importPsychologyData() {
  console.log('Starting import for', USER_EMAIL)

  // Get or create user
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
  let userId = users?.find(u => u.email === USER_EMAIL)?.id

  if (!userId) {
    console.log('User not found, please register first at the app')
    process.exit(1)
  }

  console.log('Found user:', userId)

  // Define subjects based on PDF files
  const subjects = [
    {
      name: 'Entwicklungsaufgaben',
      exam_date: '2026-03-15',
      icon: '📚',
      color: '#3b82f6'
    },
    {
      name: 'Lerntheorie',
      exam_date: '2026-03-20',
      icon: '🧠',
      color: '#8b5cf6'
    },
    {
      name: 'Kognitive Entwicklung',
      exam_date: '2026-03-25',
      icon: '🎯',
      color: '#ec4899'
    },
    {
      name: 'Aggression',
      exam_date: '2026-04-05',
      icon: '⚡',
      color: '#ef4444'
    },
    {
      name: 'Risiko & Schutz',
      exam_date: '2026-04-10',
      icon: '🛡️',
      color: '#10b981'
    },
    {
      name: 'ADHS',
      exam_date: '2026-04-15',
      icon: '🎪',
      color: '#f59e0b'
    }
  ]

  // Insert subjects
  console.log('Creating subjects...')
  const { data: insertedSubjects, error: subjectError } = await supabase
    .from('subjects')
    .insert(subjects.map(s => ({ ...s, user_id: userId })))
    .select()

  if (subjectError) {
    console.error('Error creating subjects:', subjectError)
    process.exit(1)
  }

  console.log('Created', insertedSubjects?.length, 'subjects')

  // Read flashcards from CSV
  const csvPath = path.join(process.cwd(), 'public', 'flashcards.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const csvLines = csvContent.split('\n').filter(line => line.trim())

  const flashcards: any[] = []

  // Parse CSV (format: "Question","Answer")
  for (const line of csvLines) {
    const match = line.match(/"([^"]+)","([^"]+)"/)
    if (match) {
      const [, question, answer] = match
      flashcards.push({
        front: question,
        back: answer,
        card_type: 'basic',
        user_id: userId,
        subject_id: insertedSubjects![0].id, // Assign to first subject for now
      })
    }
  }

  console.log('Parsed', flashcards.length, 'flashcards from CSV')

  // Insert flashcards in batches
  const batchSize = 100
  for (let i = 0; i < flashcards.length; i += batchSize) {
    const batch = flashcards.slice(i, i + batchSize)
    const { error: cardError } = await supabase
      .from('cards')
      .insert(batch)

    if (cardError) {
      console.error('Error inserting cards batch:', cardError)
      continue
    }
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`)
  }

  // Generate additional multiple-choice cards
  const mcCards = generateMultipleChoiceCards(insertedSubjects!, userId)

  console.log('Inserting', mcCards.length, 'multiple-choice cards...')
  for (let i = 0; i < mcCards.length; i += batchSize) {
    const batch = mcCards.slice(i, i + batchSize)
    const { error: mcError } = await supabase
      .from('cards')
      .insert(batch)

    if (mcError) {
      console.error('Error inserting MC cards:', mcError)
    }
  }

  console.log('✅ Import completed successfully!')
}

function generateMultipleChoiceCards(subjects: any[], userId: string) {
  const cards: any[] = []

  // ADHS Multiple Choice Cards
  const adhsSubject = subjects.find(s => s.name === 'ADHS')
  if (adhsSubject) {
    cards.push({
      front: 'Welche drei Symptombereiche kennzeichnen ADHS nach ICD-10?',
      card_type: 'multiple_choice',
      options: [
        'Aufmerksamkeitsstörung, Überaktivität, Impulsivität',
        'Angst, Depression, Aggression',
        'Leseschwäche, Rechenschwäche, Schreibschwäche',
        'Schlafstörung, Essstörung, Zwangsstörung'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    })

    cards.push({
      front: 'Wie hoch ist die Prävalenz von ADHS bei Kindern?',
      card_type: 'multiple_choice',
      options: [
        'Ca. 5%',
        'Ca. 10%',
        'Ca. 15%',
        'Ca. 20%'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    })

    cards.push({
      front: 'Welche vier Säulen umfasst die Behandlung von ADHS?',
      card_type: 'multiple_choice',
      options: [
        'Elternberatung, pädagogische Maßnahmen, Psychotherapie, Medikation',
        'Sport, Ernährung, Schlaf, Entspannung',
        'Einzeltherapie, Gruppentherapie, Familientherapie, Paartherapie',
        'Diagnostik, Prävention, Intervention, Evaluation'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    })
  }

  // Lerntheorie Multiple Choice Cards
  const lerntheorieSubject = subjects.find(s => s.name === 'Lerntheorie')
  if (lerntheorieSubject) {
    cards.push({
      front: 'Wofür steht das Akronym SORKC in der Verhaltenstherapie?',
      card_type: 'multiple_choice',
      options: [
        'Stimulus, Organismus, Reaktion, Kontingenz, Consequenz',
        'Situation, Organisation, Regel, Kontrolle, Chance',
        'Struktur, Ordnung, Regulierung, Konsequenz,Change',
        'System, Orientierung, Reaktion, Kraft, Charakteristik'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    })

    cards.push({
      front: 'Welche vier Bedingungen des Modelllernens beschrieb Bandura?',
      card_type: 'multiple_choice',
      options: [
        'Aufmerksamkeit, Behalten, Reproduktionsfähigkeit, Motivation',
        'Verstärkung, Bestrafung, Löschung, Generalisierung',
        'Assimilation, Akkomodation, Äquilibration, Adaptation',
        'Konditionierung, Habituation, Sensibilisierung, Prägung'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    })

    cards.push({
      front: 'Ab welchem Alter beginnt in der Regel das Imitationslernen?',
      card_type: 'multiple_choice',
      options: [
        'Mit ca. 1,5 Jahren',
        'Mit ca. 6 Monaten',
        'Mit ca. 3 Jahren',
        'Mit ca. 5 Jahren'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    })
  }

  // Entwicklungsaufgaben Multiple Choice Cards
  const entwicklungSubject = subjects.find(s => s.name === 'Entwicklungsaufgaben')
  if (entwicklungSubject) {
    cards.push({
      front: 'Welche vier psychischen Grundbedürfnisse beschrieb Grawe (2004)?',
      card_type: 'multiple_choice',
      options: [
        'Orientierung/Kontrolle, Selbstwerterhöhung/Selbstwertschutz, Lustgewinn/Unlustvermeidung, Bindung',
        'Nahrung, Schlaf, Sicherheit, Fortpflanzung',
        'Autonomie, Kompetenz, soziale Eingebundenheit, Sinnhaftigkeit',
        'Macht, Leistung, Anschluss, Intimität'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: entwicklungSubject.id
    })

    cards.push({
      front: 'Welche vier Bindungskategorien beschrieb Ainsworth?',
      card_type: 'multiple_choice',
      options: [
        'Sicher, unsicher-vermeidend, unsicher-ambivalent, desorganisiert',
        'Autoritär, autoritativ, permissiv, vernachlässigend',
        'Oral, anal, phallisch, genital',
        'Vertrauen, Autonomie, Initiative, Identität'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: entwicklungSubject.id
    })
  }

  // Kognitive Entwicklung Multiple Choice Cards
  const kognitivSubject = subjects.find(s => s.name === 'Kognitive Entwicklung')
  if (kognitivSubject) {
    cards.push({
      front: 'In welchem Alter lösen Kinder typischerweise die Sally-Anne-Aufgabe (Theory of Mind)?',
      card_type: 'multiple_choice',
      options: [
        'Mit ca. 4 Jahren',
        'Mit ca. 2 Jahren',
        'Mit ca. 6 Jahren',
        'Mit ca. 8 Jahren'
      ],
      correct_option: 0,
      user_id: userId,
      subject_id: kognitivSubject.id
    })
  }

  return cards
}

// Run import
importPsychologyData().catch(console.error)
