#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Load all batch files
const batches = [];
for (let i = 1; i <= 9; i++) {
  const fileName = `insert-mc-batch-${String(i).padStart(2, "0")}.sql`;
  const filePath = path.join(__dirname, fileName);
  const content = fs.readFileSync(filePath, "utf-8");
  batches.push({
    num: i,
    sql: content,
    size: content.length,
  });
}

console.log("Batches loaded:");
console.log("===============\n");

batches.forEach((batch) => {
  console.log(`Batch ${batch.num}: ${batch.size} bytes`);
  // Print first line of SQL
  const firstLine = batch.sql.split("\n")[0];
  console.log(`  ${firstLine}\n`);
});

console.log("\nTotal batches: " + batches.length);
console.log(
  "Total SQL: " + batches.reduce((s, b) => s + b.size, 0) + " bytes"
);
console.log(
  "\nTo insert these batches, use the Supabase MCP execute_sql tool for each batch:"
);

batches.forEach((batch) => {
  console.log(
    `\nBatch ${batch.num} (${batch.size} bytes):`
  );
  const preview = batch.sql.substring(0, 100).replace(/\n/g, " ");
  console.log(`  ${preview}...`);
});
