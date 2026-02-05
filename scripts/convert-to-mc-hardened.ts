import * as fs from "fs";

interface FlashCard {
  id: string;
  category: string;
  question: string;
  correctAnswer: string;
  answerLength: number;
}

interface MCQuestion {
  id: string;
  category: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
}

function parseCSV(filePath: string, category: string): FlashCard[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  return lines
    .map((line) => {
      const arrowIndex = line.indexOf("→");
      if (arrowIndex === -1) return null;

      const firstPart = line.substring(0, arrowIndex).trim();
      const secondPart = line.substring(arrowIndex + 1).trim();

      // Extract number from first part (e.g., "1" or "    1")
      const numberMatch = firstPart.match(/\d+/);
      const num = numberMatch ? numberMatch[0] : null;

      if (!num || !secondPart) return null;

      // Find the next arrow for question and answer split
      const parts = secondPart.split('","');
      if (parts.length < 2) return null;

      let question = parts[0];
      let answer = parts.slice(1).join('","');

      // Clean quotes and formatting
      question = question
        .replace(/^"/, "")
        .replace(/"$/, "")
        .trim();
      answer = answer.replace(/^"/, "").replace(/"$/, "").trim();

      // Clean LaTeX math formatting
      answer = answer.replace(/\$[^\$]+\$/g, (match) => {
        const math = match.slice(1, -1);
        // Very basic: just remove the dollar signs
        return math;
      });
      question = question.replace(/\$[^\$]+\$/g, (match) => {
        const math = match.slice(1, -1);
        return math;
      });

      return {
        id: `${category}-${num}`,
        category,
        question,
        correctAnswer: answer,
        answerLength: answer.length,
      };
    })
    .filter((card) => card !== null) as FlashCard[];
}

function findSimilarAnswers(
  targetAnswer: string,
  allAnswers: FlashCard[],
  count: number = 3,
  excludeAnswerIds: Set<string> = new Set()
): FlashCard[] {
  const targetLength = targetAnswer.length;
  const lengthTolerance = Math.max(20, targetLength * 0.3); // 30% tolerance or min 20 chars

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

function convertToMC(allCards: FlashCard[]): MCQuestion[] {
  const mcQuestions: MCQuestion[] = [];

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
        console.warn(`  Skipping question ${card.id} - no suitable distractors found`);
        continue;
      }
    }

    const options = [card.correctAnswer, ...distractors.map((d) => d.correctAnswer)].slice(0, 4);

    // Shuffle options and find correct position
    const shuffled = options
      .map((opt, idx) => ({ opt, idx }))
      .sort(() => Math.random() - 0.5);

    const correctIdx = shuffled.findIndex((item) => item.opt === card.correctAnswer);
    const correctOption = ["A", "B", "C", "D"][correctIdx] as
      | "A"
      | "B"
      | "C"
      | "D";

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

function formatCSVLine(value: string): string {
  // Escape quotes and wrap in quotes if needed
  const needsQuotes =
    value.includes(",") || value.includes('"') || value.includes("\n");
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : value;
}

function saveMCToCSV(questions: MCQuestion[], outputPath: string): void {
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

// Main execution
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
