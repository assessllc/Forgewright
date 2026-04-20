/**
 * Phase 6 seed script — inserts diagnosis_patterns into the database.
 * Run: DATABASE_URL=<url> node scripts/seed-phase6.mjs
 */
import mysql from "mysql2/promise";
import { diagnosisPatterns } from "./seed-diagnosis-patterns.mjs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log(`[seed-phase6] Connected to database`);

  // ─── Diagnosis Patterns ────────────────────────────────────────────────────
  console.log(`[seed-phase6] Seeding ${diagnosisPatterns.length} diagnosis patterns...`);
  let diagInserted = 0;
  let diagSkipped = 0;

  for (const pattern of diagnosisPatterns) {
    const [existing] = await conn.execute(
      "SELECT id FROM diagnosis_patterns WHERE slug = ?",
      [pattern.slug]
    );
    if (existing.length > 0) {
      diagSkipped++;
      continue;
    }
    await conn.execute(
      `INSERT INTO diagnosis_patterns
        (slug, name, category, severity, description, detectionHeuristics, examplePair,
         canonicalRemediation, primaryAffectedBlock, linkedPatternSlugs, linkedAntiPatternSlugs,
         sourceReference, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pattern.slug,
        pattern.name,
        pattern.category,
        pattern.severity,
        pattern.description,
        JSON.stringify(pattern.detectionHeuristics),
        JSON.stringify(pattern.examplePair),
        pattern.canonicalRemediation,
        pattern.primaryAffectedBlock,
        JSON.stringify(pattern.linkedPatternSlugs),
        JSON.stringify(pattern.linkedAntiPatternSlugs),
        pattern.sourceReference,
        pattern.sortOrder,
      ]
    );
    diagInserted++;
  }

  console.log(
    `[seed-phase6] Diagnosis patterns: ${diagInserted} inserted, ${diagSkipped} skipped`
  );

  await conn.end();
  console.log("[seed-phase6] Done.");
}

seed().catch((err) => {
  console.error("[seed-phase6] Error:", err);
  process.exit(1);
});
