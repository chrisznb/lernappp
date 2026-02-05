const fs = require("fs");

function parseCSV(filePath, category) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  return lines
    .map((line, index) => {
      // CSV format: question,answer (answer may or may not be quoted)
      // Simple heuristic: split on the LAST comma that makes sense

      let lastCommaIdx = -1;
      let inQuotes = false;

      // Find the last comma that's not inside quotes
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          lastCommaIdx = i;
        }
      }

      if (lastCommaIdx === -1) {
        console.error(`Skipped line ${index + 1}: No comma found`);
        return null;
      }

      let question = line.substring(0, lastCommaIdx).trim();
      let answer = line.substring(lastCommaIdx + 1).trim();

      // Remove surrounding quotes from answer
      if (answer.startsWith('"') && answer.endsWith('"')) {
        answer = answer.slice(1, -1);
      }

      // Clean LaTeX formatting
      answer = answer.replace(/\$([^\$]+)\$/g, "$1");
      question = question.replace(/\$([^\$]+)\$/g, "$1");

      // Remove leading quotes from question
      question = question.replace(/^"/, "").trim();

      if (!question || !answer) return null;

      return {
        id: `${category}-${index + 1}`,
        category,
        question,
        correctAnswer: answer,
        answerLength: answer.length,
      };
    })
    .filter((card) => card !== null);
}

function findSimilarAnswers(
  targetAnswer,
  allAnswers,
  count = 3,
  excludeAnswerIds = new Set()
) {
  const targetLength = targetAnswer.length;
  const lengthTolerance = Math.max(20, targetLength * 0.3);

  const candidates = allAnswers.filter((card) => {
    if (excludeAnswerIds.has(card.id)) return false;
    if (card.correctAnswer === targetAnswer) return false;
    const diff = Math.abs(card.answerLength - targetLength);
    return diff <= lengthTolerance;
  });

  // Sort by length similarity
  candidates.sort(
    (a, b) =>
      Math.abs(a.answerLength - targetLength) -
      Math.abs(b.answerLength - targetLength)
  );

  return candidates.slice(0, count);
}

function convertToMC(allCards) {
  const mcQuestions = [];

  for (const card of allCards) {
    const distractors = findSimilarAnswers(
      card.correctAnswer,
      allCards,
      3,
      new Set([card.id])
    );

    if (distractors.length < 3) {
      console.warn(
        `Warning: Could not find 3 distractors for question ${card.id}. Found ${distractors.length}.`
      );
      if (distractors.length === 0) {
        console.warn(`  Skipping question ${card.id}`);
        continue;
      }
    }

    const options = [card.correctAnswer, ...distractors.map((d) => d.correctAnswer)].slice(0, 4);

    // Shuffle and assign positions
    const shuffled = options
      .map((opt, idx) => ({ opt, idx }))
      .sort(() => Math.random() - 0.5);

    const correctIdx = shuffled.findIndex((item) => item.opt === card.correctAnswer);
    const correctOption = ["A", "B", "C", "D"][correctIdx];

    mcQuestions.push({
      id: card.id,
      category: card.category,
      question: card.question,
      optionA: shuffled[0].opt,
      optionB: shuffled[1].opt,
      optionC: shuffled[2].opt,
      optionD: shuffled[3].opt,
      correctOption,
    });
  }

  return mcQuestions;
}

function formatCSVLine(value) {
  const needsQuotes = value.includes(",") || value.includes('"') || value.includes("\n");
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : value;
}

function saveMCToCSV(questions, outputPath) {
  const lines = [
    "id,category,question,optionA,optionB,optionC,optionD,correctOption",
  ];

  for (const q of questions) {
    const line = [
      formatCSVLine(q.id),
      formatCSVLine(q.category),
      formatCSVLine(q.question),
      formatCSVLine(q.optionA),
      formatCSVLine(q.optionB),
      formatCSVLine(q.optionC),
      formatCSVLine(q.optionD),
      q.correctOption,
    ].join(",");

    lines.push(line);
  }

  fs.writeFileSync(outputPath, lines.join("\n"), "utf-8");
  console.log(`✓ Saved ${questions.length} MC questions to ${outputPath}`);
}

// Main
const klinik = parseCSV(
  "/Users/chris/Documents/Privat/Studium/lernapp/scripts/klinikpsychologie.csv",
  "klinik"
);
const psycho = parseCSV(
  "/Users/chris/Documents/Privat/Studium/lernapp/scripts/psychologie-lernkarten.csv",
  "psycho"
);
const sozial = parseCSV(
  "/Users/chris/Documents/Privat/Studium/lernapp/scripts/sozialpsychologie-flashcards.csv",
  "sozial"
);

const allCards = [...klinik, ...psycho, ...sozial];
console.log(`Loaded ${allCards.length} flashcards`);
console.log(`  - Klinik: ${klinik.length}`);
console.log(`  - Psychologie: ${psycho.length}`);
console.log(`  - Sozialpsychologie: ${sozial.length}`);

const mcQuestions = convertToMC(allCards);
console.log(`\nConverted to ${mcQuestions.length} MC questions`);

saveMCToCSV(
  mcQuestions,
  "/Users/chris/Documents/Privat/Studium/lernapp/scripts/psychology-mc-questions.csv"
);
