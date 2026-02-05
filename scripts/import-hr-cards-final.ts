import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Read SQL file
const sqlContent = readFileSync(
  join(__dirname, 'import-hr-exam-cards.sql'),
  'utf-8'
)

// Initialize Supabase client from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importCards() {
  console.log('Starting import of HR Exam cards...')

  // Split SQL into individual INSERT statements
  const statements = sqlContent
    .split('INSERT INTO')
    .filter(s => s.trim().length > 0 && !s.trim().startsWith('--'))
    .map(s => 'INSERT INTO' + s.trim())

  console.log(`Found ${statements.length} INSERT statements`)

  // Execute each statement
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error.message)
        errorCount++
      } else {
        successCount++
        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${statements.length} cards imported`)
        }
      }
    } catch (err) {
      console.error(`Exception in statement ${i + 1}:`, err)
      errorCount++
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`✓ Successfully imported: ${successCount} cards`)
  console.log(`✗ Errors: ${errorCount}`)
  console.log(`Total: ${statements.length}`)
}

importCards().then(() => {
  console.log('Import completed!')
  process.exit(0)
}).catch(err => {
  console.error('Import failed:', err)
  process.exit(1)
})
