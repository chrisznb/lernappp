#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

console.log("Remaining batches 3-9 to insert:\n");

for (let i = 3; i <= 9; i++) {
  const filePath = path.join(__dirname, `insert-mc-batch-${String(i).padStart(2, "0")}.sql`);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").length;
  const size = content.length;

  console.log(`Batch ${i}: ${lines} lines, ${size} bytes`);
}

console.log("\nAll batches are ready to be inserted via execute_sql MCP calls.");
console.log("Estimated total remaining: ~96 questions (177 - 20 batch1 - 20 batch2)");
