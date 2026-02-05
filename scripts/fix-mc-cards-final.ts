import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as path from 'path'

config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Fehlende Umgebungsvariablen!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const USER_ID = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

async function fixMCCards() {
  console.log('🔧 Starte Reparatur der Multiple-Choice-Karten...\n')

  // Hole alle MC-Karten
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, front, options, correct_option')
    .eq('user_id', USER_ID)
    .eq('card_type', 'multiple_choice')

  if (error) {
    console.error('❌ Fehler beim Laden:', error)
    process.exit(1)
  }

  console.log(`📝 Gefunden: ${cards.length} Karten\n`)

  let fixed = 0
  let skipped = 0
  const problems: string[] = []

  for (const card of cards) {
    try {
      let options = card.options as string[]
      const currentCorrectIndex = card.correct_option || 0

      // Stelle sicher, dass options ein Array ist
      if (typeof options === 'string') {
        options = JSON.parse(options)
      }

      // Hole die richtige Antwort (vor Deduplizierung)
      const correctAnswer = options[currentCorrectIndex]

      // Entferne Duplikate (behalte nur erste Occurrence)
      const uniqueOptions: string[] = []
      const seen = new Set<string>()

      for (const option of options) {
        if (!seen.has(option)) {
          uniqueOptions.push(option)
          seen.add(option)
        }
      }

      // Wenn weniger als 4 eindeutige Antworten, Problem loggen aber nicht überspringen
      if (uniqueOptions.length < 4) {
        problems.push(`Karte "${card.front.substring(0, 60)}..." hat nur ${uniqueOptions.length} eindeutige Antworten`)
        skipped++
        continue
      }

      // Nimm nur die ersten 4
      const finalUniqueOptions = uniqueOptions.slice(0, 4)

      // Stelle sicher, dass die richtige Antwort dabei ist
      if (!finalUniqueOptions.includes(correctAnswer)) {
        problems.push(`Karte "${card.front.substring(0, 60)}..." - richtige Antwort nicht in den ersten 4`)
        skipped++
        continue
      }

      // Trenne richtige und falsche Antworten
      const wrongAnswers = finalUniqueOptions.filter(opt => opt !== correctAnswer)

      // Shuffle die falschen Antworten
      const shuffledWrong = shuffleArray(wrongAnswers)

      // Wähle zufällige Position für die richtige Antwort
      const newCorrectPosition = Math.floor(Math.random() * 4)

      // Baue finales Array
      const finalOptions: string[] = []
      let wrongIndex = 0

      for (let i = 0; i < 4; i++) {
        if (i === newCorrectPosition) {
          finalOptions.push(correctAnswer)
        } else {
          finalOptions.push(shuffledWrong[wrongIndex])
          wrongIndex++
        }
      }

      // Update in Datenbank
      const { error: updateError } = await supabase
        .from('cards')
        .update({
          options: finalOptions,
          correct_option: newCorrectPosition
        })
        .eq('id', card.id)

      if (updateError) {
        problems.push(`Update-Fehler bei "${card.front.substring(0, 60)}...": ${updateError.message}`)
        continue
      }

      fixed++

      if (fixed % 50 === 0) {
        console.log(`   ✓ ${fixed} Karten repariert...`)
      }
    } catch (e: any) {
      problems.push(`Fehler bei "${card.front.substring(0, 60)}...": ${e.message}`)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Ergebnis')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ Repariert: ${fixed}`)
  console.log(`⏭️  Übersprungen: ${skipped}`)
  console.log(`📋 Gesamt: ${cards.length}`)

  if (problems.length > 0) {
    console.log('\n⚠️  Probleme:')
    problems.slice(0, 10).forEach(p => console.log(`   - ${p}`))
    if (problems.length > 10) {
      console.log(`   ... und ${problems.length - 10} weitere`)
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

fixMCCards().catch(console.error)
