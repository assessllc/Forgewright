/**
 * Main seed runner for Promptwright knowledge base.
 * Run: node scripts/seed.mjs
 */

import mysql from "mysql2/promise";
import { promptPatterns } from "./seed-patterns.mjs";
import { antiPatterns } from "./seed-antipatterns.mjs";
import { modelQuirks, domainScripts, quickStartTemplates } from "./seed-models-domains.mjs";
import dotenv from "dotenv";
dotenv.config();

const db = await mysql.createConnection(process.env.DATABASE_URL);

async function upsert(table, slugField, rows) {
  for (const row of rows) {
    const cols = Object.keys(row);
    const vals = cols.map((c) => {
      const v = row[c];
      return typeof v === "object" && v !== null ? JSON.stringify(v) : v;
    });
    const placeholders = cols.map(() => "?").join(", ");
    const updates = cols
      .filter((c) => c !== "id")
      .map((c) => `\`${c}\` = VALUES(\`${c}\`)`)
      .join(", ");
    await db.execute(
      `INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(", ")}) VALUES (${placeholders})
       ON DUPLICATE KEY UPDATE ${updates}`,
      vals
    );
  }
  console.log(`✓ Seeded ${rows.length} rows into ${table}`);
}

// Seed prompt patterns
await upsert("prompt_patterns", "slug", promptPatterns.map(p => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  description: p.description,
  whenToUse: p.whenToUse,
  whenNotToUse: p.whenNotToUse,
  taskTypes: p.taskTypes,
  compatibleModels: p.compatibleModels,
  examples: p.examples,
  preventsAntiPatterns: p.preventsAntiPatterns,
  sourceReference: p.sourceReference,
  sortOrder: p.sortOrder
})));

// Seed anti-patterns
await upsert("anti_patterns", "slug", antiPatterns.map(a => ({
  slug: a.slug,
  name: a.name,
  category: a.category,
  severity: a.severity,
  description: a.description,
  detectionRules: a.detectionRules,
  detectionHint: a.detectionHint,
  examples: a.examples,
  remediation: a.remediation,
  fixedByPatterns: a.fixedByPatterns,
  sortOrder: a.sortOrder
})));

// Seed model quirks
await upsert("model_quirks", "modelId", modelQuirks.map(m => ({
  modelId: m.modelId,
  modelFamily: m.modelFamily,
  modelDisplayName: m.modelDisplayName,
  provider: m.provider,
  strengths: m.strengths,
  weaknesses: m.weaknesses,
  optimizationTips: m.optimizationTips,
  recommendedPatterns: m.recommendedPatterns,
  avoidPatterns: m.avoidPatterns,
  contextWindowTokens: m.contextWindowTokens,
  pricing: m.pricing,
  knowledgeCutoff: m.knowledgeCutoff,
  supportsStreaming: m.supportsStreaming ? 1 : 0,
  supportsSystemPrompt: m.supportsSystemPrompt ? 1 : 0,
  supportsJsonMode: m.supportsJsonMode ? 1 : 0,
  supportsVision: m.supportsVision ? 1 : 0,
  sortOrder: m.sortOrder
})));

// Seed domain scripts
await upsert("domain_scripts", "slug", domainScripts.map(d => ({
  slug: d.slug,
  name: d.name,
  description: d.description,
  triggerKeywords: d.triggerKeywords,
  questions: d.questions,
  smartDefaults: d.smartDefaults,
  domainPriors: d.domainPriors,
  sortOrder: d.sortOrder
})));

// Seed quick start templates
await upsert("quick_start_templates", "slug", quickStartTemplates.map(t => ({
  slug: t.slug,
  title: t.title,
  description: t.description,
  icon: t.icon,
  domain: t.domain,
  targetModel: t.targetModel,
  scaffoldBlocks: t.scaffoldBlocks,
  sortOrder: t.sortOrder
})));

await db.end();
console.log("\n✅ Knowledge base seeded successfully.");
