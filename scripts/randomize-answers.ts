import { createClient } from '@supabase/supabase-js'
import { configDotenv } from 'dotenv'
import * as path from 'path'

// Load env vars synchronously BEFORE anything else
const result = configDotenv({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing')
  console.error('Dotenv result:', result.error || 'Success')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const USER_ID = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5'

async function randomizeAnswers() {
  console.log('🔀 Randomisiere Antwortpositionen...\n')

  // Alle Multiple-Choice-Karten abrufen
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, options, correct_option')
    .eq('user_id', USER_ID)
    .eq('card_type', 'multiple_choice')

  if (error) {
    console.error('❌ Fehler beim Abrufen der Karten:', error)
    return
  }

  console.log(`📋 Gefundene Karten: ${cards.length}\n`)

  let updated = 0

  for (const card of cards) {
    try {
      // Options ist bereits ein Array (JSONB)
      const options = card.options as string[]
      const currentCorrectIndex = card.correct_option || 0

      // Die richtige Antwort
      const correctAnswer = options[currentCorrectIndex]

      // Alle anderen Antworten
      const otherAnswers = options.filter((_, index) => index !== currentCorrectIndex)

      // Shuffle die falschen Antworten
      for (let i = otherAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherAnswers[i], otherAnswers[j]] = [otherAnswers[j], otherAnswers[i]]
      }

      // Wähle eine zufällige neue Position (0-3)
      const newPosition = Math.floor(Math.random() * 4)

      // Erstelle neue Options-Array mit der richtigen Antwort an der neuen Position
      const newOptions = [...otherAnswers]
      newOptions.splice(newPosition, 0, correctAnswer)

      // Update die Karte
      const { error: updateError } = await supabase
        .from('cards')
        .update({
          options: newOptions,
          correct_option: newPosition
        })
        .eq('id', card.id)

      if (updateError) {
        console.error(`❌ Fehler beim Update von Karte ${card.id}:`, updateError)
        continue
      }

      updated++
      if (updated % 20 === 0) {
        console.log(`   ✓ ${updated} Karten aktualisiert...`)
      }
    } catch (e) {
      console.error(`❌ Fehler bei Karte ${card.id}:`, e)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Randomisierung abgeschlossen!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📝 Aktualisierte Karten: ${updated}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

randomizeAnswers().catch(console.error)
