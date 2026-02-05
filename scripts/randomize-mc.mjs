import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const USER_ID = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5'

// Hole alle Karten
const { data: cards } = await supabase
  .from('cards')
  .select('id, options, correct_option')
  .eq('user_id', USER_ID)
  .eq('card_type', 'multiple_choice')

console.log(`🔀 Randomisiere ${cards.length} Karten...\n`)

for (const card of cards) {
  const options = card.options // options ist bereits ein Array (JSONB)
  const correctAnswer = options[card.correct_option || 0] // Richtige Antwort basierend auf current_option

  // Wähle zufällige Position für richtige Antwort
  const newPosition = Math.floor(Math.random() * 4)

  // Erstelle neues Array - alle Antworten außer der richtigen
  const otherAnswers = options.filter((_, index) => index !== (card.correct_option || 0))

  // Shuffle die falschen Antworten
  for (let i = otherAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherAnswers[i], otherAnswers[j]] = [otherAnswers[j], otherAnswers[i]]
  }

  // Füge richtige Antwort an zufälliger Position ein
  const shuffled = [...otherAnswers]
  shuffled.splice(newPosition, 0, correctAnswer)

  // Update
  const { error } = await supabase
    .from('cards')
    .update({
      options: shuffled,
      correct_option: newPosition
    })
    .eq('id', card.id)

  if (error) {
    console.error(`Fehler bei Karte ${card.id}:`, error)
  } else {
    console.log(`✓ Karte ${card.id} - Richtige Antwort jetzt an Position ${newPosition}`)
  }
}

console.log('✅ Fertig!')
