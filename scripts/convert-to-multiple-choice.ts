import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

const USER_ID = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5'

// Hilfsfunktion um Distraktoren zu generieren
function generateDistractors(correctAnswer: string, category: string): string[] {
  // Vereinfachte Distraktoren - in der Praxis würden diese themenspezifisch sein
  const distractors: { [key: string]: string[][] } = {
    definition: [
      ['Eine fehlerhafte Definition', 'Eine veraltete Theorie', 'Ein unrelated Konzept'],
      ['Ein anderer psychologischer Begriff', 'Eine inkorrekte Beschreibung', 'Eine vereinfachte Sichtweise'],
    ],
    age: [
      ['0-3 Jahre', '10-15 Jahre', '18-25 Jahre'],
      ['3-6 Jahre', '15-20 Jahre', '25-30 Jahre'],
    ],
    number: [
      ['2', '5', '8'],
      ['3', '7', '10'],
    ],
    diagnosis: [
      ['F92', 'F93', 'F94'],
      ['F80', 'F84', 'F98'],
    ]
  }

  // Standarddistraktoren falls keine Kategorie passt
  return [
    'Eine alternative Antwort',
    'Eine andere Möglichkeit',
    'Eine dritte Option'
  ]
}

async function convertToMultipleChoice() {
  console.log('🔄 Starte Konvertierung von Basic zu Multiple-Choice...\n')

  // Alle Basic-Karten abrufen
  const { data: basicCards, error } = await supabase
    .from('cards')
    .select('id, front, back, subject_id')
    .eq('user_id', USER_ID)
    .eq('card_type', 'basic')

  if (error) {
    console.error('❌ Fehler beim Abrufen der Karten:', error)
    return
  }

  console.log(`📋 Gefundene Basic-Karten: ${basicCards.length}\n`)

  const newCards = basicCards.map(card => {
    // Generiere einfache Distraktoren basierend auf der Antwort
    const distractor1 = 'Falsche Antwort A'
    const distractor2 = 'Falsche Antwort B'
    const distractor3 = 'Falsche Antwort C'

    const options = [
      card.back,
      distractor1,
      distractor2,
      distractor3
    ]

    return {
      front: card.front,
      back: '',
      card_type: 'multiple_choice',
      options: JSON.stringify(options),
      correct_option: 0,
      user_id: USER_ID,
      subject_id: card.subject_id
    }
  })

  // Lösche alte Basic-Karten
  console.log('🗑️  Lösche alte Basic-Karten...')
  const { error: deleteError } = await supabase
    .from('cards')
    .delete()
    .eq('user_id', USER_ID)
    .eq('card_type', 'basic')

  if (deleteError) {
    console.error('❌ Fehler beim Löschen:', deleteError)
    return
  }

  // Füge neue Multiple-Choice-Karten ein (in Batches)
  const batchSize = 50
  let inserted = 0

  for (let i = 0; i < newCards.length; i += batchSize) {
    const batch = newCards.slice(i, i + batchSize)
    const { error: insertError } = await supabase.from('cards').insert(batch)

    if (insertError) {
      console.error(`❌ Fehler beim Einfügen von Batch ${Math.floor(i / batchSize) + 1}:`, insertError)
      continue
    }

    inserted += batch.length
    console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newCards.length / batchSize)} eingefügt`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Konvertierung abgeschlossen!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📝 Konvertierte Karten: ${inserted}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

convertToMultipleChoice().catch(console.error)
