const fs = require("fs");
const path = require("path");

// Read all batch files
const batchFiles = [];
for (let i = 1; i <= 9; i++) {
  const fileName = `insert-mc-batch-${String(i).padStart(2, "0")}.sql`;
  const filePath = path.join(__dirname, fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
    batchFiles.push({
      name: `batch_${String(i).padStart(2, "0")}`,
      sql: content,
      size: content.length,
    });
  }
}

console.log(`Loaded ${batchFiles.length} batch files:`);
batchFiles.forEach((b) => {
  console.log(`  - ${b.name}: ${b.size} bytes`);
});

// Output instructions for applying batches
console.log(
  "\n✓ Batch files ready for insertion via apply_migration MCP calls"
);
console.log(
  "✓ Total data: " + batchFiles.reduce((s, b) => s + b.size, 0) + " bytes"
);

// Create a merged file for reference
const allSql = batchFiles.map((b) => b.sql).join("\n\n");
fs.writeFileSync(
  path.join(__dirname, "all-psychology-mc.sql"),
  allSql,
  "utf-8"
);
console.log("✓ Created all-psychology-mc.sql for reference");
