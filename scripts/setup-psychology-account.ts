import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const USER_EMAIL = 'mirelacostea0022@gmail.com'
const USER_PASSWORD = 'mirela123'

async function setupAccount() {
  console.log('🚀 Setting up psychology account...\n')

  // Step 1: Create user
  console.log('1️⃣ Creating user account...')
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: USER_EMAIL,
    password: USER_PASSWORD,
    email_confirm: true
  })

  if (authError) {
    console.error('❌ Error creating user:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log('✅ User created:', userId, '\n')

  // Step 2: Create subjects
  console.log('2️⃣ Creating subjects...')
  const subjects = [
    {
      name: 'Entwicklungspsychologie',
      exam_date: '2026-03-15',
      icon: '📚',
      color: '#3b82f6',
      user_id: userId
    },
    {
      name: 'Lerntheorie',
      exam_date: '2026-03-20',
      icon: '🧠',
      color: '#8b5cf6',
      user_id: userId
    },
    {
      name: 'Kognitive Entwicklung',
      exam_date: '2026-03-25',
      icon: '🎯',
      color: '#ec4899',
      user_id: userId
    },
    {
      name: 'Aggression',
      exam_date: '2026-04-05',
      icon: '⚡',
      color: '#ef4444',
      user_id: userId
    },
    {
      name: 'Risiko & Schutz',
      exam_date: '2026-04-10',
      icon: '🛡️',
      color: '#10b981',
      user_id: userId
    },
    {
      name: 'ADHS',
      exam_date: '2026-04-15',
      icon: '🎪',
      color: '#f59e0b',
      user_id: userId
    }
  ]

  const { data: insertedSubjects, error: subjectError } = await supabase
    .from('subjects')
    .insert(subjects)
    .select()

  if (subjectError) {
    console.error('❌ Error creating subjects:', subjectError.message)
    process.exit(1)
  }

  console.log(`✅ Created ${insertedSubjects.length} subjects\n`)

  // Create subject map for easy lookup
  const subjectMap = new Map(insertedSubjects.map(s => [s.name, s]))

  // Step 3: Parse and import flashcards from CSV
  console.log('3️⃣ Importing flashcards from CSV...')
  const csvPath = path.join(process.cwd(), 'public', 'flashcards.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const csvLines = csvContent.split('\n').filter(line => line.trim())

  const flashcards: any[] = []
  const entwicklungSubject = subjectMap.get('Entwicklungspsychologie')!

  for (const line of csvLines) {
    const match = line.match(/"([^"]+)","([^"]+)"/)
    if (match) {
      const [, question, answer] = match
      flashcards.push({
        front: question,
        back: answer,
        card_type: 'basic',
        user_id: userId,
        subject_id: entwicklungSubject.id,
      })
    }
  }

  console.log(`📝 Parsed ${flashcards.length} flashcards from CSV`)

  // Insert in batches
  const batchSize = 100
  for (let i = 0; i < flashcards.length; i += batchSize) {
    const batch = flashcards.slice(i, i + batchSize)
    const { error: cardError } = await supabase.from('cards').insert(batch)

    if (cardError) {
      console.error('❌ Error inserting batch:', cardError.message)
      continue
    }
    console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flashcards.length / batchSize)}`)
  }

  console.log('✅ CSV import completed\n')

  // Step 4: Generate and insert multiple-choice cards
  console.log('4️⃣ Generating multiple-choice cards...')
  const mcCards = generateMultipleChoiceCards(subjectMap, userId)

  const { error: mcError } = await supabase.from('cards').insert(mcCards)

  if (mcError) {
    console.error('❌ Error inserting MC cards:', mcError.message)
  } else {
    console.log(`✅ Generated and inserted ${mcCards.length} multiple-choice cards\n`)
  }

  // Step 5: Create user stats
  console.log('5️⃣ Initializing user stats...')
  const { error: statsError } = await supabase.from('user_stats').insert({
    user_id: userId,
    total_xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0
  })

  if (statsError) {
    console.error('❌ Error creating user stats:', statsError.message)
  } else {
    console.log('✅ User stats initialized\n')
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Setup completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:', USER_EMAIL)
  console.log('🔑 Password:', USER_PASSWORD)
  console.log('📚 Subjects:', insertedSubjects.length)
  console.log('📝 Total Cards:', flashcards.length + mcCards.length)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

function generateMultipleChoiceCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []

  // ADHS Multiple Choice Cards
  const adhsSubject = subjectMap.get('ADHS')!
  cards.push(
    {
      front: 'Welche drei Symptombereiche kennzeichnen ADHS nach ICD-10?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Aufmerksamkeitsstörung, Überaktivität, Impulsivität',
        'Angst, Depression, Aggression',
        'Leseschwäche, Rechenschwäche, Schreibschwäche',
        'Schlafstörung, Essstörung, Zwangsstörung'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    },
    {
      front: 'Wie hoch ist die Prävalenz von ADHS bei Kindern?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Ca. 5%',
        'Ca. 10%',
        'Ca. 15%',
        'Ca. 20%'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    },
    {
      front: 'Welche vier Säulen umfasst die Behandlung von ADHS?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Elternberatung, pädagogische Maßnahmen, Psychotherapie, Medikation',
        'Sport, Ernährung, Schlaf, Entspannung',
        'Einzeltherapie, Gruppentherapie, Familientherapie, Paartherapie',
        'Diagnostik, Prävention, Intervention, Evaluation'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    },
    {
      front: 'Wofür steht das PASS-Modell im Kontext kognitiver ADHS-Probleme?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Planungsfähigkeit, Aufmerksamkeit, Simultanität, Sukzessivität',
        'Planung, Ausführung, Struktur, Selbstkontrolle',
        'Problemlösung, Analyse, Synthese, Selektion',
        'Perzeption, Assoziation, Speicherung, Selektion'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: adhsSubject.id
    }
  )

  // Lerntheorie Multiple Choice Cards
  const lerntheorieSubject = subjectMap.get('Lerntheorie')!
  cards.push(
    {
      front: 'Wofür steht das Akronym SORKC in der Verhaltenstherapie?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Stimulus, Organismus, Reaktion, Kontingenz, Consequenz',
        'Situation, Organisation, Regel, Kontrolle, Chance',
        'Struktur, Ordnung, Regulierung, Konsequenz, Change',
        'System, Orientierung, Reaktion, Kraft, Charakteristik'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    },
    {
      front: 'Welche vier Bedingungen des Modelllernens beschrieb Bandura?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Aufmerksamkeit, Behalten, Reproduktionsfähigkeit, Motivation',
        'Verstärkung, Bestrafung, Löschung, Generalisierung',
        'Assimilation, Akkomodation, Äquilibration, Adaptation',
        'Konditionierung, Habituation, Sensibilisierung, Prägung'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    },
    {
      front: 'Ab welchem Alter beginnt in der Regel das Imitationslernen?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Mit ca. 1,5 Jahren',
        'Mit ca. 6 Monaten',
        'Mit ca. 3 Jahren',
        'Mit ca. 5 Jahren'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    },
    {
      front: 'Was ist ein unkonditionierter Stimulus (UCS) in der klassischen Konditionierung?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Ein Reiz, der ohne vorheriges Lernen eine natürliche Reaktion auslöst',
        'Ein Reiz, der durch Lernen eine Reaktion auslöst',
        'Ein neutraler Reiz ohne jede Wirkung',
        'Ein Reiz, der die Reaktion hemmt'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    },
    {
      front: 'Welche Gehirnstruktur ermöglicht eine schnelle emotionale Reaktion ohne kortikale Beteiligung?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Die Amygdala',
        'Der Hippocampus',
        'Der präfrontale Kortex',
        'Das Cerebellum'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: lerntheorieSubject.id
    }
  )

  // Entwicklungspsychologie Multiple Choice Cards
  const entwicklungSubject = subjectMap.get('Entwicklungspsychologie')!
  cards.push(
    {
      front: 'Welche vier psychischen Grundbedürfnisse beschrieb Grawe (2004)?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Orientierung/Kontrolle, Selbstwerterhöhung/Selbstwertschutz, Lustgewinn/Unlustvermeidung, Bindung',
        'Nahrung, Schlaf, Sicherheit, Fortpflanzung',
        'Autonomie, Kompetenz, soziale Eingebundenheit, Sinnhaftigkeit',
        'Macht, Leistung, Anschluss, Intimität'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: entwicklungSubject.id
    },
    {
      front: 'Welche vier Bindungskategorien beschrieb Ainsworth?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Sicher, unsicher-vermeidend, unsicher-ambivalent, desorganisiert',
        'Autoritär, autoritativ, permissiv, vernachlässigend',
        'Oral, anal, phallisch, genital',
        'Vertrauen, Autonomie, Initiative, Identität'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: entwicklungSubject.id
    },
    {
      front: 'Was untersuchte René Spitz (1945) bei Kleinkindern in Findelhäusern?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Die Auswirkungen von Deprivation und fehlender emotionaler Zuwendung',
        'Die Entwicklung der Motorik',
        'Die Sprachentwicklung',
        'Die kognitive Entwicklung'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: entwicklungSubject.id
    },
    {
      front: 'Was war das zentrale Ergebnis von Harry Harlows Experimenten mit Rhesusaffen?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Körperkontakt (Trost) ist wichtiger als die bloße Nahrungsquelle',
        'Nahrung ist die wichtigste Bindungsvariable',
        'Soziale Kontakte sind unwichtig für die Entwicklung',
        'Isolation hat keine negativen Folgen'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: entwicklungSubject.id
    }
  )

  // Kognitive Entwicklung Multiple Choice Cards
  const kognitivSubject = subjectMap.get('Kognitive Entwicklung')!
  cards.push(
    {
      front: 'In welchem Alter lösen Kinder typischerweise die Sally-Anne-Aufgabe (Theory of Mind)?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Mit ca. 4 Jahren',
        'Mit ca. 2 Jahren',
        'Mit ca. 6 Jahren',
        'Mit ca. 8 Jahren'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: kognitivSubject.id
    }
  )

  // Aggression Multiple Choice Cards
  const aggressionSubject = subjectMap.get('Aggression')!
  cards.push(
    {
      front: 'Welches Lernprinzip entspricht dem Bedürfnis nach Lustgewinn/Unlustvermeidung?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Operante Verstärkung nach Skinner',
        'Klassische Konditionierung nach Pawlow',
        'Kognitives Lernen nach Piaget',
        'Soziales Lernen nach Bandura'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: aggressionSubject.id
    }
  )

  return cards
}

setupAccount().catch(console.error)
