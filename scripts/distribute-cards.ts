import { createClient } from '@supabase/supabase-js'

// Du musst den SERVICE_ROLE_KEY hier eintragen oder als Umgebungsvariable setzen!
const SUPABASE_URL = 'https://ifmgedepkblpgaheohll.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'DEIN_SERVICE_ROLE_KEY_HIER'

const TARGET_EMAIL = 'mirelacostea0022@gmail.com'

async function distributeCards() {
  if (SERVICE_ROLE_KEY === 'DEIN_SERVICE_ROLE_KEY_HIER') {
    console.error('Bitte setze SUPABASE_SERVICE_ROLE_KEY als Umgebungsvariable!')
    console.error('Beispiel: SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/distribute-cards.ts')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  console.log('Suche User...')

  // 1. Find user
  const { data: users, error: userError } = await supabase
    .from('auth.users')
    .select('id, email')
    .eq('email', TARGET_EMAIL)
    .single()

  // Alternative: Use admin API
  const { data: { users: adminUsers }, error: adminError } = await supabase.auth.admin.listUsers()
  const targetUser = adminUsers?.find(u => u.email === TARGET_EMAIL)

  if (!targetUser) {
    console.error('User nicht gefunden:', TARGET_EMAIL)
    process.exit(1)
  }

  const userId = targetUser.id
  console.log('User gefunden:', userId)

  // 2. Find Entwicklungspsychologie and its submodules
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)

  if (subjectsError) {
    console.error('Fehler beim Laden der Subjects:', subjectsError)
    process.exit(1)
  }

  const devPsych = subjects?.find(s => s.name === 'Entwicklungspsychologie' && !s.parent_subject_id)
  if (!devPsych) {
    console.error('Entwicklungspsychologie nicht gefunden!')
    process.exit(1)
  }

  console.log('Entwicklungspsychologie gefunden:', devPsych.id)

  const submodules = subjects?.filter(s => s.parent_subject_id === devPsych.id) || []
  console.log('Submodule:', submodules.map(s => s.name))

  if (submodules.length !== 5) {
    console.error('Nicht alle 5 Submodule gefunden!')
    process.exit(1)
  }

  // 3. Get cards from Entwicklungspsychologie
  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('subject_id', devPsych.id)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (cardsError) {
    console.error('Fehler beim Laden der Karten:', cardsError)
    process.exit(1)
  }

  console.log('Karten gefunden:', cards?.length || 0)

  if (!cards || cards.length === 0) {
    console.log('Keine Karten zum Verteilen!')
    return
  }

  // 4. Distribute cards evenly
  const cardsPerModule = Math.ceil(cards.length / 5)
  const moduleNames = [
    'Klassische Stadienmodelle',
    'Bindung & Attachment',
    'Kognitive Entwicklung',
    'Emotionale Entwicklung',
    'Soziale Entwicklung'
  ]

  for (let i = 0; i < 5; i++) {
    const moduleName = moduleNames[i]
    const module = submodules.find(s => s.name === moduleName)

    if (!module) {
      console.error(`Modul nicht gefunden: ${moduleName}`)
      continue
    }

    const startIdx = i * cardsPerModule
    const endIdx = Math.min((i + 1) * cardsPerModule, cards.length)
    const cardsToMove = cards.slice(startIdx, endIdx)

    if (cardsToMove.length === 0) continue

    console.log(`Verschiebe ${cardsToMove.length} Karten zu "${moduleName}"...`)

    const { error: updateError } = await supabase
      .from('cards')
      .update({ subject_id: module.id })
      .in('id', cardsToMove.map(c => c.id))

    if (updateError) {
      console.error(`Fehler beim Verschieben zu ${moduleName}:`, updateError)
    } else {
      console.log(`✓ ${cardsToMove.length} Karten zu "${moduleName}" verschoben`)
    }
  }

  console.log('\nFertig! Karten wurden verteilt.')
}

distributeCards().catch(console.error)
