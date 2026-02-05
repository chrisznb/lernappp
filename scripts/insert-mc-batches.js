const fs = require("fs");

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    let inQuotes = false;
    let fields = [];
    let current = "";

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : "";

      if (char === '"' && prevChar !== "\\") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim().replace(/^"|"$/g, ""));

    if (fields.length >= 8) {
      const [id, category, question, optionA, optionB, optionC, optionD, correctOption] = fields;
      const correctIdx = correctOption.charCodeAt(0) - 65;

      questions.push({
        id,
        category,
        question,
        options: [optionA, optionB, optionC, optionD],
        correctIdx,
      });
    }
  }

  return questions;
}

const questions = parseCSV("/Users/chris/Documents/Privat/Studium/lernapp/scripts/psychology-mc-questions.csv");
const userId = 'be133e38-65b4-4e2d-97b8-f06b118ec5c5';

// Create batches of 20 questions per file
const batchSize = 20;
const batches = [];

for (let i = 0; i < questions.length; i += batchSize) {
  batches.push(questions.slice(i, i + batchSize));
}

console.log(`Creating ${batches.length} batch files...`);

batches.forEach((batch, batchNum) => {
  let sql = `-- Psychology MC Questions Batch ${batchNum + 1} (${batch.length} questions)
INSERT INTO public.cards (
  id,
  user_id,
  front,
  back,
  options,
  correct_option,
  card_type,
  tags,
  created_at
) VALUES
`;

  const values = batch.map((q) => {
    const id = `'${generateUUID()}'`;
    const userIdVal = `'${userId}'`;
    const front = `'${q.question.replace(/'/g, "''")}'`;

    // Properly escape JSON for SQL - use json_build_array for safety
    // Build the options array using SQL functions instead of string concatenation
    const escapedOptions = q.options.map((opt) => {
      const escaped = opt.replace(/'/g, "''");
      return `'${escaped}'`;
    }).join(",");

    const back = `''`; // Empty description for MC questions
    const cardType = `'mc'`;
    const tags = `ARRAY['${q.category}']`;
    const createdAt = `now()`;
    const correctOption = q.correctIdx;

    // Use array_to_json for cleaner JSON handling - include back column
    return `(${id}, ${userIdVal}, ${front}, ${back}, jsonb_build_array(${escapedOptions}), ${correctOption}, ${cardType}, ${tags}, ${createdAt})`;
  });

  sql += values.join(",\n") + ";";

  const outputPath = `/Users/chris/Documents/Privat/Studium/lernapp/scripts/insert-mc-batch-${String(batchNum + 1).padStart(2, '0')}.sql`;
  fs.writeFileSync(outputPath, sql, "utf-8");
});

console.log(`✓ Created ${batches.length} batch files`);
console.log(`✓ Total questions: ${questions.length}`);
