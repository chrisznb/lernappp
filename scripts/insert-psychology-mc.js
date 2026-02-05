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

  // Skip header
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Parse CSV with proper quote handling
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

      // Convert correctOption letter to index
      const correctIdx = correctOption.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3

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

// Generate SQL INSERT statement with user_id
let sql = `-- Insert Psychology MC Questions for mirelacostea0022@gmail.com
INSERT INTO public.cards (
  id,
  user_id,
  front,
  options,
  correct_option,
  card_type,
  tags,
  created_at
) VALUES
`;

const values = questions.map((q) => {
  const id = `'${generateUUID()}'`;
  const userIdVal = `'${userId}'`;
  const front = `'${q.question.replace(/'/g, "''")}'`;
  const options = `'${JSON.stringify(q.options).replace(/'/g, "''")}'::jsonb`;
  const correctOption = q.correctIdx;
  const cardType = `'mc'`;
  const tags = `ARRAY['${q.category}']`;
  const createdAt = `now()`;

  return `(${id}, ${userIdVal}, ${front}, ${options}, ${correctOption}, ${cardType}, ${tags}, ${createdAt})`;
});

sql += values.join(",\n") + ";";

// Output SQL file
const outputPath = "/Users/chris/Documents/Privat/Studium/lernapp/scripts/insert-psychology-mc.sql";
fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`✓ Generated SQL file: ${outputPath}`);
console.log(`✓ Total questions: ${questions.length}`);
console.log(`✓ User ID: ${userId}`);
