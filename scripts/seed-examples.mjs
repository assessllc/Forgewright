/**
 * seed-examples.mjs
 * Inserts 100+ real example prompts into the example_prompts table.
 * Run: node scripts/seed-examples.mjs
 */

import mysql from "mysql2/promise";
import { examples1 } from "./examples-data-1.mjs";
import { examples2 } from "./examples-data-2.mjs";
import { examples3 } from "./examples-data-3.mjs";
import { examples4 } from "./examples-data-4.mjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const allExamples = [...examples1, ...examples2, ...examples3, ...examples4];

console.log(`Seeding ${allExamples.length} example prompts...`);

const conn = await mysql.createConnection(DATABASE_URL);

// Clear existing examples
await conn.execute("DELETE FROM example_prompts");
console.log("Cleared existing example_prompts rows.");

let inserted = 0;
let skipped = 0;

for (const ex of allExamples) {
  try {
    await conn.execute(
      `INSERT INTO example_prompts
        (slug, title, domain, taskType, patternSlug, difficulty, isFeatured,
         testedModels, secondaryPatterns, tokenCount, sourceNote, promptText,
         createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        ex.slug,
        ex.title,
        ex.domain,
        ex.taskType,
        ex.patternSlug,
        ex.difficulty,
        ex.isFeatured ? 1 : 0,
        ex.testedModels,
        ex.secondaryPatterns,
        ex.tokenCount,
        ex.sourceNote,
        ex.promptText,
      ]
    );
    inserted++;
  } catch (err) {
    console.warn(`  SKIP ${ex.slug}: ${err.message}`);
    skipped++;
  }
}

await conn.end();

console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
console.log(`Total examples in DB: ${inserted}`);

// Domain breakdown
const domains = {};
for (const ex of allExamples) {
  domains[ex.domain] = (domains[ex.domain] || 0) + 1;
}
console.log("\nDomain breakdown:");
for (const [domain, count] of Object.entries(domains).sort()) {
  console.log(`  ${domain}: ${count}`);
}
