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

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlPath = path.join(__dirname, 'import-hr-exam-cards.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

console.log('Executing SQL import...');
console.log('This will insert all HR exam cards into the database.');

// Execute the SQL using raw SQL
const { data, error } = await supabase.rpc('exec', {
  sql: sqlContent
});

if (error) {
  console.error('Error executing SQL:', error);

  // Fallback: Try executing line by line
  console.log('\nTrying line-by-line execution...');
  const lines = sqlContent.split('\n');
  let currentStatement = '';
  let successCount = 0;
  let errorCount = 0;

  for (const line of lines) {
    if (line.trim().startsWith('--') || line.trim() === '') continue;

    currentStatement += line + '\n';

    if (line.trim().endsWith(');')) {
      try {
        const { error: lineError } = await supabase.rpc('exec', {
          sql: currentStatement.trim()
        });

        if (lineError) {
          console.error(`Error: ${lineError.message}`);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`Progress: ${successCount} statements executed`);
          }
        }
      } catch (err) {
        console.error(`Exception: ${err.message}`);
        errorCount++;
      }

      currentStatement = '';
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Errors: ${errorCount}`);
} else {
  console.log('✓ SQL executed successfully!');
  console.log('All 70 HR exam cards have been imported.');
}

// Verify import
const { count, error: countError } = await supabase
  .from('cards')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', '12439635-0b75-466d-bd9a-f2e98dcc3756')
  .contains('tags', ['exam']);

if (!countError) {
  console.log(`\nTotal cards with 'exam' tag: ${count}`);
}

console.log('\nImport completed!');
