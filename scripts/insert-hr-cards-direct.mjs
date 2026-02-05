import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get env from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const userId = '12439635-0b75-466d-bd9a-f2e98dcc3756';
const subjectId = 'f1c31287-e2d3-4981-ae57-717a34d7551c';

console.log('Starting HR Exam Cards Import...\n');

// Define all cards as objects
const cards = [
  // Kotter's 8 Steps
  { card_type: 'basic', front: `Kotter Step 1: Name und Beschreibung`, back: `**Create a Sense of Urgency**\n\nBeschreibung:\n- Dringlichkeit für Veränderung schaffen\n- Notwendigkeit des Wandels kommunizieren\n- Status Quo hinterfragen\n\nPraktisches Beispiel (Call Center → Open Office):\n"Zeigen Sie Zahlen: Moderne Unternehmen haben 30% höhere Produktivität mit Open Office. Konkurrenten haben bereits umgestellt."`, tags: ['change-management', 'kotter', 'hr', 'exam'] },
  { card_type: 'basic', front: `Kotter Step 2: Name und Beschreibung`, back: `**Build a Guiding Coalition**\n\nBeschreibung:\n- Führungskoalition aufbauen\n- Einflussreiche Personen für das Change-Projekt gewinnen\n- Team aus verschiedenen Bereichen/Hierarchien\n\nPraktisches Beispiel (Call Center → Open Office):\n"Gewinnen Sie 2-3 Team Leader, die von Open Office überzeugt sind, und bilden Sie mit ihnen die Change-Gruppe."`, tags: ['change-management', 'kotter', 'hr', 'exam'] },
  { card_type: 'basic', front: `Kotter Step 3: Name und Beschreibung`, back: `**Form a Strategic Vision**\n\nBeschreibung:\n- Klare Vision für die Zukunft entwickeln\n- Strategie zur Erreichung der Vision\n- Vision muss verständlich und motivierend sein\n\nPraktisches Beispiel (Call Center → Open Office):\n"Vision: 'Modernes, kollaboratives Arbeitsumfeld, das Innovation fördert und Teamarbeit erleichtert. Ziel: Bessere Zusammenarbeit zwischen Teams.'"`, tags: ['change-management', 'kotter', 'hr', 'exam'] },
];

// Insert each card with progress tracking
let successCount = 0;
let errorCount = 0;

for (let i = 0; i < cards.length; i++) {
  const card = cards[i];

  try {
    const { error } = await supabase.from('cards').insert({
      user_id: userId,
      subject_id: subjectId,
      ...card
    });

    if (error) {
      console.error(`✗ Error inserting card ${i + 1}:`, error.message);
      errorCount++;
    } else {
      successCount++;
      console.log(`✓ Card ${i + 1}/${cards.length} inserted`);
    }
  } catch (err) {
    console.error(`✗ Exception inserting card ${i + 1}:`, err.message);
    errorCount++;
  }
}

console.log(`\n=== Import Summary ===`);
console.log(`✓ Successfully imported: ${successCount} cards`);
console.log(`✗ Errors: ${errorCount}`);
console.log(`Total: ${cards.length}`);

console.log('\nImport completed!');
