#!/bin/bash

# Insert all MC question batches
echo "Inserting Psychology MC Questions..."

for i in {01..09}; do
  FILE="scripts/insert-mc-batch-${i}.sql"
  if [ -f "$FILE" ]; then
    echo "Processing batch $i..."
    # Read the SQL file and execute it via execute_sql
    # We'll do this via a Node.js script to handle the API calls
    npx ts-node -e "
      import { createClient } from '@supabase/supabase-js'
      import * as fs from 'fs'
      const url = process.env.SUPABASE_URL
      const key = process.env.SUPABASE_ANON_KEY
      const client = createClient(url, key)
      const sql = fs.readFileSync('$FILE', 'utf-8')
      client.rpc('execute_sql', { query: sql }).then(() => console.log('Batch $i inserted')).catch(e => console.error('Batch $i failed:', e))
    "
  fi
done

echo "All batches processed!"
