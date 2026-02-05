import * as fs from 'fs'
import * as path from 'path'

// Read and parse CSV
const csvPath = path.join(process.cwd(), 'public', 'flashcards.csv')
const csvContent = fs.readFileSync(csvPath, 'utf-8')
const csvLines = csvContent.split('\n').filter(line => line.trim())

const userId = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5'
const entwicklungSubjectId = '3e16410a-8d74-4737-a45e-756e2fe4a051'

const sqlStatements: string[] = []

console.log('Total lines:', csvLines.length)
console.log('First line:', csvLines[0])

for (const line of csvLines) {
  // Match pattern: anything,"Answer" - find the last ," and split there
  const lastQuoteCommaIndex = line.lastIndexOf(',"')

  if (lastQuoteCommaIndex !== -1) {
    const question = line.substring(0, lastQuoteCommaIndex)
    const answer = line.substring(lastQuoteCommaIndex + 2, line.length - 1) // Remove ," and ending "

    // Remove leading/trailing quotes from question if present
    const cleanQuestion = question.replace(/^"/, '').replace(/"$/, '')
    // Escape single quotes for SQL and remove $ signs
    const escapedQuestion = cleanQuestion.replace(/'/g, "''").replace(/\$/g, '').replace(/\\/g, '')
    const escapedAnswer = answer.replace(/'/g, "''").replace(/\$/g, '').replace(/\\/g, '')

    sqlStatements.push(
      `('${escapedQuestion}', '${escapedAnswer}', 'basic', '${userId}', '${entwicklungSubjectId}')`
    )
  } else {
    console.error('Could not parse line:', line.substring(0, 100))
  }
}

// Generate INSERT statement in batches of 20
const batchSize = 20
for (let i = 0; i < sqlStatements.length; i += batchSize) {
  const batch = sqlStatements.slice(i, i + batchSize)
  console.log(`-- Batch ${Math.floor(i / batchSize) + 1}`)
  console.log(`INSERT INTO cards (front, back, card_type, user_id, subject_id)`)
  console.log(`VALUES`)
  console.log(batch.join(',\n') + ';')
  console.log()
}

console.log(`-- Total flashcards: ${sqlStatements.length}`)
