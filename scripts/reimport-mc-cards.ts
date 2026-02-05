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

// Hilfsfunktion zum Randomisieren
function randomizeOptions(options: string[], correctIndex: number): { options: string[], correctOption: number } {
  const correctAnswer = options[correctIndex]
  const otherAnswers = options.filter((_, i) => i !== correctIndex)

  // Shuffle andere Antworten
  for (let i = otherAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherAnswers[i], otherAnswers[j]] = [otherAnswers[j], otherAnswers[i]]
  }

  // Zufällige Position für richtige Antwort
  const newCorrectPosition = Math.floor(Math.random() * options.length)

  // Baue neues Array
  const newOptions: string[] = []
  let otherIndex = 0

  for (let i = 0; i < options.length; i++) {
    if (i === newCorrectPosition) {
      newOptions.push(correctAnswer)
    } else {
      newOptions.push(otherAnswers[otherIndex])
      otherIndex++
    }
  }

  return { options: newOptions, correctOption: newCorrectPosition }
}

async function reimportMCCards() {
  console.log('🔄 Starte Re-Import der MC-Karten...\n')

  // Hole Subjects
  const { data: subjects, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', USER_ID)

  if (subjectError) {
    console.error('❌ Fehler beim Laden der Subjects:', subjectError)
    process.exit(1)
  }

  const subjectMap = new Map(subjects.map(s => [s.name, s]))
  console.log(`📚 Subjects gefunden: ${subjects.length}\n`)

  // Sammle alle MC-Karten
  const allMCCards: any[] = []

  // Lerntheorie MC-Karten
  const lerntheorie = subjectMap.get('Lerntheorie')
  if (lerntheorie) {
    const cards = [
      {
        front: 'Wofür steht das Akronym SORKC in der Verhaltenstherapie?',
        options: [
          'Stimulus, Organismus, Reaktion, Kontingenz, Consequenz',
          'Situation, Organisation, Regel, Kontrolle, Chance',
          'Struktur, Ordnung, Regulierung, Konsequenz, Change',
          'System, Orientierung, Reaktion, Kraft, Charakteristik'
        ],
        correct_option: 0
      },
      {
        front: 'Welche vier Bedingungen des Modelllernens beschrieb Bandura?',
        options: [
          'Aufmerksamkeit, Behalten, Reproduktionsfähigkeit, Motivation',
          'Verstärkung, Bestrafung, Löschung, Generalisierung',
          'Assimilation, Akkomodation, Äquilibration, Adaptation',
          'Konditionierung, Habituation, Sensibilisierung, Prägung'
        ],
        correct_option: 0
      },
      {
        front: 'Ab welchem Alter beginnt in der Regel das Imitationslernen?',
        options: [
          'Mit ca. 1,5 Jahren',
          'Mit ca. 6 Monaten',
          'Mit ca. 3 Jahren',
          'Mit ca. 5 Jahren'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist ein Beispiel für primären Verstärker?',
        options: [
          'Nahrung oder Wasser',
          'Geld oder Punkte',
          'Lob oder Anerkennung',
          'Noten oder Zertifikate'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist ein Beispiel für sekundären Verstärker?',
        options: [
          'Geld, Lob, Punkte',
          'Nahrung, Wasser, Schlaf',
          'Luft, Wärme, Kälte',
          'Schmerz, Hunger, Durst'
        ],
        correct_option: 0
      },
      {
        front: 'Welcher Verstärkerplan ist resistentester gegen Löschung?',
        options: [
          'Intermittierende variable Verstärkung',
          'Kontinuierliche feste Verstärkung',
          'Keine Verstärkung überhaupt',
          'Ausschließlich primäre Verstärker'
        ],
        correct_option: 0
      },
      {
        front: 'Was bewirkt Bestrafung Typ I?',
        options: [
          'Verhaltenshäufigkeit nimmt ab',
          'Verhaltenshäufigkeit nimmt zu',
          'Kein Effekt auf Verhalten',
          'Generalisierung auf andere Verhaltensweisen'
        ],
        correct_option: 0
      },
      {
        front: 'Welcher Verstärkerplan ist am effektivsten für Lernen?',
        options: [
          'Kontinuierliche Verstärkung am Anfang',
          'Nie verstärken während Lernphase',
          'Zufällige Verstärkung von Anfang an',
          'Ausschließlich Bestrafung einsetzen'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist der Unterschied zwischen UCS und CS?',
        options: [
          'UCS löst Reaktion natürlich aus, CS durch Lernen',
          'CS löst Reaktion natürlich aus, UCS durch Lernen',
          'Beide lösen natürliche Reaktionen aus',
          'Beide benötigen vorheriges Lernen'
        ],
        correct_option: 0
      },
      {
        front: 'Was passiert bei wiederholter CS-Präsentation ohne UCS?',
        options: [
          'Extinktion - Reaktion nimmt ab',
          'Verstärkung - Reaktion nimmt zu',
          'Generalisierung auf andere Reize',
          'Diskrimination zwischen Reizen'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist spontane Erholung?',
        options: [
          'Gelöschte Reaktion tritt nach Pause wieder auf',
          'Reaktion wird dauerhaft gelöscht',
          'Verstärkung der ursprünglichen Reaktion',
          'Neue Reaktion wird gelernt'
        ],
        correct_option: 0
      },
      {
        front: 'Was fördert Modelllernen am meisten?',
        options: [
          'Modell ist ähnlich und erfolgreich',
          'Modell ist völlig unähnlich',
          'Modell wird bestraft für Verhalten',
          'Modell zeigt zufälliges Verhalten'
        ],
        correct_option: 0
      },
      {
        front: 'Wann tritt stellvertretende Verstärkung auf?',
        options: [
          'Beobachtung, dass Modell verstärkt wird',
          'Direkte Verstärkung eigenen Verhaltens',
          'Bestrafung des beobachteten Modells',
          'Keine Konsequenz für Modell'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist latentes Lernen?',
        options: [
          'Lernen ohne sofortige Verhaltensänderung',
          'Lernen mit sofortiger Verhaltensänderung',
          'Lernen ohne jede Verstärkung',
          'Lernen ausschließlich durch Bestrafung'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Shaping?',
        options: [
          'Schrittweiser Aufbau komplexen Verhaltens',
          'Plötzliches Erlernen komplexen Verhaltens',
          'Löschung unerwünschten Verhaltens',
          'Bestrafung falschen Verhaltens'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Gegenkonditionierung?',
        options: [
          'Ersetzen einer Reaktion durch neue Reaktion',
          'Verstärkung der ursprünglichen Reaktion',
          'Löschung ohne neue Reaktion',
          'Generalisierung auf alle Reize'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Chaining?',
        options: [
          'Verketten einzelner Verhaltensschritte zu Kette',
          'Unterbrechen von Verhaltensketten',
          'Zufällige Abfolge von Verhaltensweisen',
          'Gleichzeitiges Ausführen mehrerer Verhaltensweisen'
        ],
        correct_option: 0
      },
      {
        front: 'Was zeigt der Bobo-Doll-Versuch?',
        options: [
          'Kinder lernen Aggression durch Beobachtung',
          'Kinder sind natürlicherweise aggressiv',
          'Aggression kann nicht gelernt werden',
          'Modelllernen funktioniert nur bei Erwachsenen'
        ],
        correct_option: 0
      }
    ]

    cards.forEach(card => {
      const randomized = randomizeOptions(card.options, card.correct_option)
      allMCCards.push({
        front: card.front,
        card_type: 'multiple_choice',
        options: randomized.options,
        correct_option: randomized.correctOption,
        user_id: USER_ID,
        subject_id: lerntheorie.id
      })
    })
  }

  // Kognitive Entwicklung MC-Karten
  const kognitiv = subjectMap.get('Kognitive Entwicklung')
  if (kognitiv) {
    const cards = [
      {
        front: 'In welchem Alter lösen Kinder typischerweise die Sally-Anne-Aufgabe (Theory of Mind)?',
        options: [
          'Mit ca. 4 Jahren',
          'Mit ca. 2 Jahren',
          'Mit ca. 6 Jahren',
          'Mit ca. 8 Jahren'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Drei-Berge-Versuch?',
        options: [
          'Testet Egozentrismus bei Kindern',
          'Testet Objektpermanenz bei Säuglingen',
          'Testet Intelligenz bei Erwachsenen',
          'Testet Sprachentwicklung bei Kleinkindern'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist kognitive Flexibilität?',
        options: [
          'Fähigkeit, zwischen Denkstrategien zu wechseln',
          'Unfähigkeit, Denkweise zu ändern',
          'Ausschließlich rigides Denken möglich',
          'Nur eine Strategie funktioniert'
        ],
        correct_option: 0
      },
      {
        front: 'Was kennzeichnet formal-operationales Denken?',
        options: [
          'Abstraktes Denken, hypothetisches Denken, Metakognition',
          'Nur konkretes Denken über Objekte',
          'Nur sensomotorische Koordination',
          'Nur egozentrisches symbolisches Denken'
        ],
        correct_option: 0
      },
      {
        front: 'Was kritisieren moderne Theorien an Piaget?',
        options: [
          'Kinder können früher als gedacht',
          'Kinder können später als gedacht',
          'Stadien sind völlig korrekt',
          'Entwicklung verläuft immer gleich'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist die A-nicht-B-Aufgabe?',
        options: [
          'Test für Objektpermanenz bei Säuglingen',
          'Test für Intelligenz bei Erwachsenen',
          'Test für Sprachentwicklung',
          'Test für motorische Fähigkeiten'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Animismus?',
        options: [
          'Unbelebte Dinge werden als belebt gesehen',
          'Belebte Dinge werden als unbelebt gesehen',
          'Realistische Sicht auf alle Dinge',
          'Abstrakte Sicht auf alle Dinge'
        ],
        correct_option: 0
      },
      {
        front: 'Ab wann verstehen Kinder Transitivität?',
        options: [
          'Konkret-operationale Phase (ab 7 Jahre)',
          'Präoperationale Phase (2-7 Jahre)',
          'Sensomotorische Phase (0-2 Jahre)',
          'Formal-operationale Phase (ab 12 Jahre)'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Seriation?',
        options: [
          'Fähigkeit, Objekte nach Größe ordnen',
          'Fähigkeit, Objekte permanent zu sehen',
          'Fähigkeit, Perspektive zu wechseln',
          'Fähigkeit, abstrakt zu denken'
        ],
        correct_option: 0
      },
      {
        front: 'Was können Kinder in konkret-operationaler Phase?',
        options: [
          'Verstehen Erhaltung, Reversibilität, Klassifikation',
          'Nur symbolisches Denken möglich',
          'Nur sensomotorische Aktionen möglich',
          'Nur abstraktes hypothetisches Denken'
        ],
        correct_option: 0
      },
      {
        front: 'Ab wann können Kinder Klasseninklusion verstehen?',
        options: [
          'Konkret-operationale Phase (ab 7 Jahre)',
          'Präoperationale Phase (2-7 Jahre)',
          'Sensomotorische Phase (0-2 Jahre)',
          'Formal-operationale Phase (ab 12 Jahre)'
        ],
        correct_option: 0
      },
      {
        front: 'Wann zeigen Kinder Animismus?',
        options: [
          'Präoperationale Phase (2-7 Jahre)',
          'Konkret-operationale Phase (7-11 Jahre)',
          'Formal-operationale Phase (ab 12 Jahre)',
          'Sensomotorische Phase (0-2 Jahre)'
        ],
        correct_option: 0
      },
      {
        front: 'Wann entwickelt sich Seriation?',
        options: [
          'Konkret-operationale Phase (ab 7 Jahre)',
          'Präoperationale Phase (2-7 Jahre)',
          'Sensomotorische Phase (0-2 Jahre)',
          'Erst im Erwachsenenalter'
        ],
        correct_option: 0
      },
      {
        front: 'Was können Kinder in präoperationaler Phase nicht?',
        options: [
          'Reversibles Denken und Dezentrierung',
          'Symbolisches Denken und Sprache',
          'Egozentrisches Denken und Zentrierung',
          'Motorische Koordination und Laufen'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Transitivität?',
        options: [
          'Wenn A>B und B>C, dann A>C',
          'Wenn A=B und B=C, dann A≠C',
          'Wenn A<B und B<C, dann A>C',
          'Logische Beziehungen sind unmöglich'
        ],
        correct_option: 0
      },
      {
        front: 'Was ist Klasseninklusion?',
        options: [
          'Verständnis, dass Teilmenge zu Gesamtmenge gehört',
          'Verständnis, dass Objekte permanent sind',
          'Verständnis für andere Perspektiven',
          'Verständnis für abstrakte Symbole'
        ],
        correct_option: 0
      }
    ]

    cards.forEach(card => {
      const randomized = randomizeOptions(card.options, card.correct_option)
      allMCCards.push({
        front: card.front,
        card_type: 'multiple_choice',
        options: randomized.options,
        correct_option: randomized.correctOption,
        user_id: USER_ID,
        subject_id: kognitiv.id
      })
    })
  }

  // ADHS MC-Karten
  const adhs = subjectMap.get('ADHS')
  if (adhs) {
    const cards = [
      {
        front: 'Welche drei Symptombereiche kennzeichnen ADHS nach ICD-10?',
        options: [
          'Aufmerksamkeitsstörung, Überaktivität, Impulsivität',
          'Angst, Depression, Aggression',
          'Leseschwäche, Rechenschwäche, Schreibschwäche',
          'Schlafstörung, Essstörung, Zwangsstörung'
        ],
        correct_option: 0
      },
      {
        front: 'Wie hoch ist die Prävalenz von ADHS bei Kindern?',
        options: [
          'Ca. 5%',
          'Ca. 10%',
          'Ca. 15%',
          'Ca. 20%'
        ],
        correct_option: 0
      },
      {
        front: 'Welche vier Säulen umfasst die Behandlung von ADHS?',
        options: [
          'Elternberatung, pädagogische Maßnahmen, Psychotherapie, Medikation',
          'Sport, Ernährung, Schlaf, Entspannung',
          'Einzeltherapie, Gruppentherapie, Familientherapie, Paartherapie',
          'Diagnostik, Prävention, Intervention, Evaluation'
        ],
        correct_option: 0
      }
    ]

    cards.forEach(card => {
      const randomized = randomizeOptions(card.options, card.correct_option)
      allMCCards.push({
        front: card.front,
        card_type: 'multiple_choice',
        options: randomized.options,
        correct_option: randomized.correctOption,
        user_id: USER_ID,
        subject_id: adhs.id
      })
    })
  }

  // Entwicklungsaufgaben MC-Karten
  const entwicklung = subjectMap.get('Entwicklungsaufgaben')
  if (entwicklung) {
    const cards = [
      {
        front: 'Welche vier psychischen Grundbedürfnisse beschrieb Grawe (2004)?',
        options: [
          'Orientierung/Kontrolle, Selbstwerterhöhung/Selbstwertschutz, Lustgewinn/Unlustvermeidung, Bindung',
          'Nahrung, Schlaf, Sicherheit, Fortpflanzung',
          'Autonomie, Kompetenz, soziale Eingebundenheit, Sinnhaftigkeit',
          'Macht, Leistung, Anschluss, Intimität'
        ],
        correct_option: 0
      },
      {
        front: 'Welche vier Bindungskategorien beschrieb Ainsworth?',
        options: [
          'Sicher, unsicher-vermeidend, unsicher-ambivalent, desorganisiert',
          'Autoritär, autoritativ, permissiv, vernachlässigend',
          'Oral, anal, phallisch, genital',
          'Vertrauen, Autonomie, Initiative, Identität'
        ],
        correct_option: 0
      }
    ]

    cards.forEach(card => {
      const randomized = randomizeOptions(card.options, card.correct_option)
      allMCCards.push({
        front: card.front,
        card_type: 'multiple_choice',
        options: randomized.options,
        correct_option: randomized.correctOption,
        user_id: USER_ID,
        subject_id: entwicklung.id
      })
    })
  }

  console.log(`📝 Erstellt: ${allMCCards.length} MC-Karten (randomisiert)\n`)

  // Importiere in Batches
  const batchSize = 50
  let inserted = 0

  for (let i = 0; i < allMCCards.length; i += batchSize) {
    const batch = allMCCards.slice(i, i + batchSize)
    const { error: insertError } = await supabase.from('cards').insert(batch)

    if (insertError) {
      console.error(`❌ Fehler bei Batch ${Math.floor(i / batchSize) + 1}:`, insertError)
      continue
    }

    inserted += batch.length
    console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allMCCards.length / batchSize)} importiert`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Re-Import abgeschlossen!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📝 Importiert: ${inserted} MC-Karten`)
  console.log(`🎲 Alle Antworten sind randomisiert`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

reimportMCCards().catch(console.error)
