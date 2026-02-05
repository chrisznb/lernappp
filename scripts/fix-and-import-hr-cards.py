#!/usr/bin/env python3
import re

# Read the original SQL file
with open('scripts/import-hr-exam-cards.sql', 'r') as f:
    content = f.read()

# Fix multiple_choice INSERT statements to include empty back field
# Pattern: INSERT INTO cards (user_id, subject_id, card_type, front, options, correct_option, tags)
# Should be: INSERT INTO cards (user_id, subject_id, card_type, front, back, options, correct_option, tags)

# Replace the column list
content = re.sub(
    r"INSERT INTO cards \(user_id, subject_id, card_type, front, options, correct_option, tags\)",
    r"INSERT INTO cards (user_id, subject_id, card_type, front, back, options, correct_option, tags)",
    content
)

# Now we need to add an empty string for the back field in the VALUES clause
# Pattern: 'multiple_choice',\n'Question text',
# Should be: 'multiple_choice',\n'Question text',\n'',

lines = content.split('\n')
fixed_lines = []
i = 0

while i < len(lines):
    line = lines[i]
    fixed_lines.append(line)

    # Check if this line contains 'multiple_choice',
    if "'multiple_choice'," in line:
        # Next line should be the front question
        # After that we need to insert an empty back field
        if i + 1 < len(lines):
            i += 1
            fixed_lines.append(lines[i])  # Add the front question line
            # Now insert empty back field
            fixed_lines.append("'',")  # Add empty back field

    i += 1

# Write the fixed SQL
with open('scripts/import-hr-exam-cards-fixed.sql', 'w') as f:
    f.write('\n'.join(fixed_lines))

print("Fixed SQL file created at scripts/import-hr-exam-cards-fixed.sql")
print("You can now execute this file in the Supabase Dashboard SQL Editor")
