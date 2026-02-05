import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as path from 'path'

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

const USER_ID = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5'

async function importPDFFlashcards() {
  console.log('🚀 Starting PDF flashcard import...\n')

  // Get existing subjects for this user
  const { data: subjects, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', USER_ID)

  if (subjectError) {
    console.error('❌ Error fetching subjects:', subjectError.message)
    process.exit(1)
  }

  console.log(`Found ${subjects.length} subjects\n`)

  // Create subject map
  const subjectMap = new Map(subjects.map(s => [s.name, s]))

  // Generate all flashcards
  const allCards = [
    ...generateEntwicklungsaufgabenCards(subjectMap, USER_ID),
    ...generateLerntheorieCards(subjectMap, USER_ID),
    ...generateKognitiveEntwicklungCards(subjectMap, USER_ID),
    ...generateAggressionCards(subjectMap, USER_ID),
    ...generateRisikoSchutzCards(subjectMap, USER_ID),
    ...generateADHSCards(subjectMap, USER_ID),
  ]

  console.log(`📝 Generated ${allCards.length} flashcards\n`)

  // Insert in batches
  const batchSize = 100
  let inserted = 0

  for (let i = 0; i < allCards.length; i += batchSize) {
    const batch = allCards.slice(i, i + batchSize)
    const { error: insertError } = await supabase.from('cards').insert(batch)

    if (insertError) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError.message)
      continue
    }

    inserted += batch.length
    console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allCards.length / batchSize)} (${inserted} cards)`)
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Import completed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📝 Total Cards Inserted: ${inserted}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

// Entwicklungsaufgaben / Entwicklungspsychologie Cards
function generateEntwicklungsaufgabenCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []
  const subject = subjectMap.get('Entwicklungspsychologie') || subjectMap.get('Entwicklungsaufgaben')

  if (!subject) return cards

  // Basic cards
  cards.push(
    {
      front: 'Was sind Entwicklungsaufgaben nach Havighurst?',
      back: 'Aufgaben, die in einem bestimmten Lebensabschnitt auf das Individuum zukommen und bewältigt werden müssen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne drei Entwicklungsaufgaben der frühen Kindheit (0-5 Jahre) nach Havighurst.',
      back: 'Laufen lernen, feste Nahrung essen lernen, sprechen lernen, Kontrolle über Ausscheidungen erlangen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne drei Entwicklungsaufgaben der mittleren Kindheit (6-11 Jahre) nach Havighurst.',
      back: 'Erlernen körperlicher Geschicklichkeit für Spiele, Aufbau einer positiven Einstellung zu sich selbst, Erlernen sozialer Rollen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne drei Entwicklungsaufgaben der Adoleszenz (12-17 Jahre) nach Havighurst.',
      back: 'Aufbau neuer und reiferer Beziehungen zu Gleichaltrigen, Akzeptanz der eigenen körperlichen Erscheinung, emotionale Unabhängigkeit von Eltern.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist eine Entwicklungsaufgabe des frühen Erwachsenenalters nach Havighurst?',
      back: 'Partnerwahl, Start eines Familienlebens, Start ins Berufsleben, Übernahme staatsbürgerlicher Verantwortung.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne eine Entwicklungsaufgabe des mittleren Erwachsenenalters nach Havighurst.',
      back: 'Unterstützung heranwachsender Kinder, Erreichung sozialer und staatsbürgerlicher Verantwortung, Anpassung an alternde Eltern.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne eine Entwicklungsaufgabe des späten Erwachsenenalters nach Havighurst.',
      back: 'Anpassung an abnehmende körperliche Kraft und Gesundheit, Anpassung an den Tod des Partners, Aufbau einer Altersgruppe.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist eine familiäre Entwicklungsaufgabe in der Phase "Familie mit Säugling"?',
      back: 'Anpassung an die Elternrolle, Entwicklung neuer Beziehungsmuster als Paar, Integration des Kindes in die Familie.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist eine besondere Entwicklungsaufgabe für Adoptivfamilien?',
      back: 'Bewältigung von Gefühlen bezüglich Unfruchtbarkeit, Integration eines unbekannten Kindes, Umgang mit der Herkunftsgeschichte des Kindes.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist eine zentrale Entwicklungsaufgabe für Alleinerziehende?',
      back: 'Bewältigung der Doppelbelastung aus Erziehung und Beruf, Aufbau eines sozialen Unterstützungsnetzwerks, emotionale Stabilisierung nach Trennung.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    }
  )

  // Multiple choice cards
  cards.push(
    {
      front: 'Welche Altersgruppe umfasst die "mittlere Kindheit" nach Havighurst?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        '6-11 Jahre',
        '0-5 Jahre',
        '12-17 Jahre',
        '3-8 Jahre'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist KEINE Entwicklungsaufgabe der Adoleszenz nach Havighurst?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Laufen lernen',
        'Emotionale Unabhängigkeit von Eltern',
        'Vorbereitung auf Partnerschaft',
        'Entwicklung einer Geschlechtsrollenidentität'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    }
  )

  return cards
}

// Lerntheorie Cards
function generateLerntheorieCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []
  const subject = subjectMap.get('Lerntheorie')

  if (!subject) return cards

  cards.push(
    {
      front: 'Was ist das Ziel einer funktionalen Verhaltensanalyse nach dem SORKC-Modell?',
      back: 'Die Identifikation der aufrechterhaltenden Bedingungen eines problematischen Verhaltens.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet "Kontingenz" im SORKC-Modell?',
      back: 'Die Beziehung zwischen Verhalten und Konsequenz; wie wahrscheinlich eine bestimmte Konsequenz auf ein Verhalten folgt.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist eine konditionierte Reaktion (CR) in der klassischen Konditionierung?',
      back: 'Eine Reaktion, die durch Lernen auf einen ursprünglich neutralen Reiz (CS) erfolgt.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was zeigte Watsons "Little Albert" Experiment?',
      back: 'Dass Phobien durch klassische Konditionierung erlernt werden können, indem ein neutraler Reiz mit einem angstauslösenden Reiz gekoppelt wird.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Warum können emotionale Reaktionen sehr schnell entstehen?',
      back: 'Durch den direkten Weg vom Thalamus zur Amygdala, der ohne kortikale Beteiligung auskommt.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist positive Verstärkung in der operanten Konditionierung?',
      back: 'Die Erhöhung der Wahrscheinlichkeit eines Verhaltens durch Hinzufügen eines angenehmen Reizes.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist negative Verstärkung?',
      back: 'Die Erhöhung der Wahrscheinlichkeit eines Verhaltens durch Entfernung eines unangenehmen Reizes.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist der Unterschied zwischen Strafe Typ I und Typ II?',
      back: 'Typ I: Hinzufügen eines unangenehmen Reizes. Typ II: Entfernung eines angenehmen Reizes.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist Extinktion (Löschung) im Kontext der Konditionierung?',
      back: 'Das Ausbleiben der gelernten Reaktion, wenn der konditionierte Reiz wiederholt ohne den unkonditionierten Reiz präsentiert wird.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne die erste Bedingung des Modelllernens nach Bandura.',
      back: 'Aufmerksamkeit - das Modellverhalten muss wahrgenommen werden.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet "Behalten" im Kontext des Modelllernens?',
      back: 'Das beobachtete Verhalten muss im Gedächtnis gespeichert werden.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist mit "Reproduktionsfähigkeit" beim Modelllernen gemeint?',
      back: 'Die motorische und kognitive Fähigkeit, das beobachtete Verhalten selbst auszuführen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Rolle spielt Motivation beim Modelllernen?',
      back: 'Es muss ein Anreiz (Verstärkung) bestehen, das beobachtete Verhalten auch tatsächlich zu zeigen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    }
  )

  // Multiple choice
  cards.push(
    {
      front: 'Was ist ein Beispiel für negative Verstärkung?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Ein Kind räumt sein Zimmer auf, damit die Mutter aufhört zu schimpfen',
        'Ein Kind bekommt ein Bonbon für gutes Verhalten',
        'Ein Kind bekommt Hausarrest für schlechte Noten',
        'Ein Kind verliert sein Taschengeld wegen Fehlverhalten'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was unterscheidet klassische von operanter Konditionierung?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Klassisch: Reiz-Reaktions-Lernen; Operant: Lernen durch Konsequenzen',
        'Klassisch: Belohnung; Operant: Bestrafung',
        'Klassisch: bewusst; Operant: unbewusst',
        'Klassisch: nur bei Tieren; Operant: nur bei Menschen'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    }
  )

  return cards
}

// Kognitive Entwicklung Cards
function generateKognitiveEntwicklungCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []
  const subject = subjectMap.get('Kognitive Entwicklung')

  if (!subject) return cards

  cards.push(
    {
      front: 'Was versteht Piaget unter "Adaptation"?',
      back: 'Die Anpassung kognitiver Strukturen an die Umwelt durch Assimilation und Akkomodation.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist Assimilation nach Piaget?',
      back: 'Die Integration neuer Erfahrungen in bestehende kognitive Schemata.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist Akkomodation nach Piaget?',
      back: 'Die Veränderung bestehender Schemata oder Bildung neuer Schemata aufgrund neuer Erfahrungen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet Äquilibration?',
      back: 'Das Streben nach einem Gleichgewicht zwischen Assimilation und Akkomodation.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Altersgruppe umfasst die sensomotorische Phase nach Piaget?',
      back: '0-2 Jahre',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist eine zentrale Errungenschaft der sensomotorischen Phase?',
      back: 'Die Objektpermanenz - das Verständnis, dass Objekte auch dann existieren, wenn sie nicht sichtbar sind.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Altersgruppe umfasst die präoperationale Phase?',
      back: '2-7 Jahre',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was kennzeichnet die präoperationale Phase?',
      back: 'Egozentrismus, zentriertes Denken, fehlende Reversibilität, beginnende symbolische Funktion.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Altersgruppe umfasst die konkret-operationale Phase?',
      back: '7-11 Jahre',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was können Kinder in der konkret-operationalen Phase?',
      back: 'Logisches Denken über konkrete Objekte, Verständnis von Erhaltung (Invarianz), Dezentrierung, Reversibilität.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Ab welchem Alter beginnt die formal-operationale Phase?',
      back: 'Ab ca. 12 Jahren',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was kennzeichnet die formal-operationale Phase?',
      back: 'Abstraktes und hypothetisches Denken, systematisches Problemlösen, Reflexion über das eigene Denken.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist Theory of Mind?',
      back: 'Die Fähigkeit, sich selbst und anderen mentale Zustände (Überzeugungen, Wünsche, Absichten) zuzuschreiben.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was testet die Sally-Anne-Aufgabe?',
      back: 'Die Theory of Mind - ob Kinder verstehen, dass andere eine falsche Überzeugung haben können.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist fluide Intelligenz?',
      back: 'Die Fähigkeit, neue Probleme zu lösen, logisch zu denken und Muster zu erkennen, unabhängig von Vorwissen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist kristalline Intelligenz?',
      back: 'Wissensbasierte Intelligenz, die auf Erfahrung und Lernen beruht (Wortschatz, Fakten, erworbene Fähigkeiten).',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Wie verändert sich fluide Intelligenz im Alter?',
      back: 'Sie nimmt ab etwa dem 30. Lebensjahr kontinuierlich ab.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Wie verändert sich kristalline Intelligenz im Alter?',
      back: 'Sie bleibt bis ins hohe Alter relativ stabil oder kann sogar zunehmen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    }
  )

  // Multiple choice
  cards.push(
    {
      front: 'Welche Phase beschreibt Piaget für die Altersgruppe 2-7 Jahre?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Präoperationale Phase',
        'Sensomotorische Phase',
        'Konkret-operationale Phase',
        'Formal-operationale Phase'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist ein typisches Merkmal der präoperationalen Phase?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Egozentrismus',
        'Objektpermanenz',
        'Abstraktes Denken',
        'Reversibilität'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Art von Intelligenz nimmt im Alter tendenziell ab?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Fluide Intelligenz',
        'Kristalline Intelligenz',
        'Emotionale Intelligenz',
        'Soziale Intelligenz'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    }
  )

  return cards
}

// Aggression Cards
function generateAggressionCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []
  const subject = subjectMap.get('Aggression')

  if (!subject) return cards

  cards.push(
    {
      front: 'Was ist die ICD-10 Diagnose für Störungen des Sozialverhaltens?',
      back: 'F91',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne drei Symptome der Störung des Sozialverhaltens (F91).',
      back: 'Exzessives Streiten, Grausamkeit gegenüber Menschen/Tieren, schwere Destruktivität gegenüber Eigentum, Stehlen, häufiges Lügen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Wie lange müssen Symptome einer Störung des Sozialverhaltens mindestens vorliegen?',
      back: 'Mindestens 6 Monate',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was unterscheidet F91.0 von F91.1?',
      back: 'F91.0: Störung auf den familiären Rahmen beschränkt. F91.1: Störung mit fehlenden sozialen Bindungen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist Response-Cost im Kontext der Verhaltenstherapie?',
      back: 'Der Entzug von Verstärkern als Konsequenz unerwünschten Verhaltens.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist ein Token-System?',
      back: 'Ein Verstärkersystem, bei dem Kinder für erwünschtes Verhalten Punkte/Chips sammeln, die gegen Belohnungen eingetauscht werden können.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist ein Hauptziel des Trainings mit aggressiven Kindern?',
      back: 'Aufbau prosozialer Verhaltensweisen und Abbau aggressiver Verhaltensmuster durch verhaltenstherapeutische Methoden.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    }
  )

  // Multiple choice
  cards.push(
    {
      front: 'Wie lange müssen Symptome mindestens vorliegen für die Diagnose F91?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        '6 Monate',
        '3 Monate',
        '1 Jahr',
        '2 Monate'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    }
  )

  return cards
}

// Risiko & Schutz Cards
function generateRisikoSchutzCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []
  const subject = subjectMap.get('Risiko & Schutz')

  if (!subject) return cards

  cards.push(
    {
      front: 'Was ist ein Risikofaktor?',
      back: 'Ein Merkmal oder Umstand, der die Wahrscheinlichkeit für die Entwicklung einer psychischen Störung erhöht.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist ein Schutzfaktor?',
      back: 'Ein Merkmal oder Umstand, der die Wahrscheinlichkeit für die Entwicklung einer psychischen Störung verringert oder negative Auswirkungen von Risikofaktoren abmildert.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet Vulnerabilität?',
      back: 'Erhöhte Anfälligkeit für psychische Störungen aufgrund biologischer, psychologischer oder sozialer Faktoren.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet Resilenz?',
      back: 'Die Widerstandsfähigkeit gegenüber belastenden Lebensereignissen und die Fähigkeit, sich von Krisen zu erholen.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne drei Formen von Kindesmisshandlung.',
      back: 'Vernachlässigung, psychische Misshandlung, körperliche Misshandlung, sexueller Missbrauch.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was sind demografische Risikofaktoren für Kindesmisshandlung?',
      back: 'Junges Elternalter, Alleinerziehend, niedriges Einkommen, hohe Kinderzahl, soziale Isolation.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was sind elterliche Persönlichkeits-Risikofaktoren für Kindesmisshandlung?',
      back: 'Psychische Erkrankungen, Substanzmissbrauch, eigene Misshandlungserfahrung, geringe Impulskontrolle.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Nenne drei positive Kindheitserfahrungen, die als Schutzfaktoren wirken.',
      back: 'Sich in der Familie sicher fühlen, mindestens ein gutes Eltern-Kind-Verhältnis, Unterstützung durch Nachbarn, Freunde in der Schule.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was sind personale Ressourcen nach Klemenz?',
      back: 'Kognitive Fähigkeiten, soziale Kompetenzen, Selbstwirksamkeit, Problemlösefähigkeiten.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was sind Umwelt-Ressourcen nach Klemenz?',
      back: 'Soziale Unterstützung, stabile Bezugspersonen, materielle Sicherheit, Zugang zu Bildung.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welches Risiko haben Kinder psychisch kranker Eltern?',
      back: 'Sie haben ein deutlich erhöhtes Risiko, selbst psychische Störungen zu entwickeln (ca. 50% bei schweren elterlichen Störungen).',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    }
  )

  // Multiple choice
  cards.push(
    {
      front: 'Was ist KEIN typischer Schutzfaktor?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Soziale Isolation',
        'Stabile Bezugspersonen',
        'Hohe Selbstwirksamkeit',
        'Gute soziale Unterstützung'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet Resilienz?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Widerstandsfähigkeit gegenüber Belastungen',
        'Erhöhte Anfälligkeit für Stress',
        'Soziale Isolation',
        'Genetische Vorbelastung'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    }
  )

  return cards
}

// ADHS Cards
function generateADHSCards(subjectMap: Map<string, any>, userId: string) {
  const cards: any[] = []
  const subject = subjectMap.get('ADHS')

  if (!subject) return cards

  cards.push(
    {
      front: 'Was bedeutet ADHS?',
      back: 'Aufmerksamkeitsdefizit-Hyperaktivitätsstörung',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche ICD-10 Diagnose hat ADHS?',
      back: 'F90.0 - Einfache Aktivitäts- und Aufmerksamkeitsstörung',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'In wie vielen Lebensbereichen müssen ADHS-Symptome auftreten?',
      back: 'In mindestens zwei Lebensbereichen (z.B. Schule und Familie)',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet das "P" im PASS-Modell?',
      back: 'Planungsfähigkeit',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet "Simultanität" im PASS-Modell?',
      back: 'Die Fähigkeit, mehrere Informationen gleichzeitig zu verarbeiten.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was bedeutet "Sukzessivität" im PASS-Modell?',
      back: 'Die Fähigkeit, Informationen sequenziell/nacheinander zu verarbeiten.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welcher Neurotransmitter spielt bei ADHS eine zentrale Rolle?',
      back: 'Dopamin - bei ADHS wird ein Dopaminmangel diskutiert.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist das Verhältnis von Theta- zu Beta-Wellen bei ADHS?',
      back: 'Erhöhte Theta-Aktivität im Vergleich zur Beta-Aktivität',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist das Ziel von Neurofeedback bei ADHS?',
      back: 'Durch operante Konditionierung lernen, Theta-Wellen zu reduzieren und Beta-Wellen zu verstärken.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist die erste Säule der ADHS-Behandlung?',
      back: 'Elternberatung und Psychoedukation',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was umfasst die zweite Säule der ADHS-Behandlung?',
      back: 'Pädagogische Maßnahmen in der Schule',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist die dritte Säule der ADHS-Behandlung?',
      back: 'Psychotherapie, insbesondere Verhaltenstherapie',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist die vierte Säule der ADHS-Behandlung?',
      back: 'Medikamentöse Behandlung (z.B. Methylphenidat)',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Bei wie viel Prozent der Betroffenen persistiert ADHS ins Erwachsenenalter?',
      back: 'Bei 40-60% der Betroffenen',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was sind die Wender-Utah-Kriterien?',
      back: 'Diagnostische Kriterien für ADHS im Erwachsenenalter',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Komorbidität tritt bei 47,1% der Erwachsenen mit ADHS auf?',
      back: 'Angststörungen',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Welche Komorbidität tritt bei 38,3% der Erwachsenen mit ADHS auf?',
      back: 'Affektive Störungen (z.B. Depression)',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist ein häufiger Mythos über ADHS?',
      back: 'Dass es ADHS nicht wirklich gibt oder dass es nur eine Erfindung der Pharmaindustrie ist.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Warum ist Ritalin-Bashing problematisch?',
      back: 'Weil es betroffene Familien stigmatisiert und ihnen den Zugang zu wirksamer Behandlung erschwert.',
      card_type: 'basic',
      user_id: userId,
      subject_id: subject.id
    }
  )

  // Multiple choice
  cards.push(
    {
      front: 'Bei wie viel Prozent persistiert ADHS ins Erwachsenenalter?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        '40-60%',
        '10-20%',
        '70-80%',
        '90-100%'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    },
    {
      front: 'Was ist das Ziel von Neurofeedback?',
      card_type: 'multiple_choice',
      options: JSON.stringify([
        'Theta-Wellen reduzieren und Beta-Wellen verstärken',
        'Theta-Wellen verstärken und Beta-Wellen reduzieren',
        'Alpha-Wellen verstärken',
        'Alle Gehirnwellen unterdrücken'
      ]),
      correct_option: 0,
      user_id: userId,
      subject_id: subject.id
    }
  )

  return cards
}

importPDFFlashcards().catch(console.error)
