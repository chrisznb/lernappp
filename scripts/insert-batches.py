#!/usr/bin/env python3
import os
import subprocess
import glob

# Get all batch files in order
batch_files = sorted(glob.glob("scripts/insert-mc-batch-*.sql"))

print(f"Found {len(batch_files)} batch files")

for batch_file in batch_files:
    batch_num = batch_file.split("-")[-1].split(".")[0]
    print(f"\nInserting batch {batch_num}...")

    with open(batch_file, 'r') as f:
        sql_content = f.read()

    # Create a temporary migration file for this batch
    temp_file = f"/tmp/batch_{batch_num}.sql"
    with open(temp_file, 'w') as f:
        f.write(sql_content)

    # Run the migration via supabase CLI if available
    # Otherwise use the MCP directly via a Node script
    print(f"  Batch {batch_num}: {len(sql_content)} bytes")

print("\nAll batches are ready for insertion!")
print("Next step: Use apply_migration MCP calls for each batch")
