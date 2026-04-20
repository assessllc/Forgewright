import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // User preferences
  defaultModel: varchar("defaultModel", { length: 64 }).default("gpt-4o"),
  defaultTone: varchar("defaultTone", { length: 64 }).default("professional"),
  defaultDomain: varchar("defaultDomain", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Prompt Sessions ──────────────────────────────────────────────────────────

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  domain: varchar("domain", { length: 64 }),
  targetModel: varchar("targetModel", { length: 64 }).default("gpt-4o"),
  // JSON: SpecDimension[] — captured dimensions from discovery
  specData: json("specData"),
  // JSON: ScaffoldBlock[] — the 8 labeled blocks
  scaffoldBlocks: json("scaffoldBlocks"),
  // JSON: VariantSet — terse/detailed/cot variants
  variants: json("variants"),
  totalTokenCount: int("totalTokenCount").default(0),
  isReverseModeSession: boolean("isReverseModeSession").default(false),
  // JSON: string[] — tags for filtering
  tags: json("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// ─── Prompt Patterns ─────────────────────────────────────────────────────────

export const promptPatterns = mysqlTable("prompt_patterns", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  description: text("description").notNull(),
  whenToUse: text("whenToUse").notNull(),
  whenNotToUse: text("whenNotToUse"),
  // JSON: string[] — task types this pattern applies to
  taskTypes: json("taskTypes"),
  // JSON: string[] — compatible models
  compatibleModels: json("compatibleModels"),
  // JSON: PatternExample[] — { title, prompt, notes }
  examples: json("examples"),
  // JSON: string[] — anti-patterns this pattern prevents
  preventsAntiPatterns: json("preventsAntiPatterns"),
  sourceReference: text("sourceReference"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromptPattern = typeof promptPatterns.$inferSelect;
export type InsertPromptPattern = typeof promptPatterns.$inferInsert;

// ─── Anti-Patterns ────────────────────────────────────────────────────────────

export const antiPatterns = mysqlTable("anti_patterns", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  description: text("description").notNull(),
  // JSON: string[] — regex or keyword patterns for detection
  detectionRules: json("detectionRules"),
  detectionHint: text("detectionHint"),
  // JSON: string[] — example bad prompts
  examples: json("examples"),
  remediation: text("remediation").notNull(),
  // JSON: string[] — pattern slugs that fix this
  fixedByPatterns: json("fixedByPatterns"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AntiPattern = typeof antiPatterns.$inferSelect;
export type InsertAntiPattern = typeof antiPatterns.$inferInsert;

// ─── Model Quirks ─────────────────────────────────────────────────────────────

export const modelQuirks = mysqlTable("model_quirks", {
  id: int("id").autoincrement().primaryKey(),
  modelId: varchar("modelId", { length: 64 }).notNull(),
  modelFamily: varchar("modelFamily", { length: 64 }).notNull(),
  modelDisplayName: varchar("modelDisplayName", { length: 128 }).notNull(),
  provider: varchar("provider", { length: 64 }).notNull(),
  // JSON: string[] — key strengths
  strengths: json("strengths"),
  // JSON: string[] — known weaknesses
  weaknesses: json("weaknesses"),
  // JSON: QuirkTip[] — { title, description, example }
  optimizationTips: json("optimizationTips"),
  // JSON: string[] — recommended patterns for this model
  recommendedPatterns: json("recommendedPatterns"),
  // JSON: string[] — anti-patterns to avoid for this model
  avoidPatterns: json("avoidPatterns"),
  contextWindowTokens: int("contextWindowTokens"),
  // JSON: PricingTier — { inputPer1k, outputPer1k, currency }
  pricing: json("pricing"),
  knowledgeCutoff: varchar("knowledgeCutoff", { length: 32 }),
  supportsStreaming: boolean("supportsStreaming").default(true),
  supportsSystemPrompt: boolean("supportsSystemPrompt").default(true),
  supportsJsonMode: boolean("supportsJsonMode").default(false),
  supportsVision: boolean("supportsVision").default(false),
  sortOrder: int("sortOrder").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ModelQuirk = typeof modelQuirks.$inferSelect;
export type InsertModelQuirk = typeof modelQuirks.$inferInsert;

// ─── Domain Elicitation Scripts ───────────────────────────────────────────────

export const domainScripts = mysqlTable("domain_scripts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  // JSON: string[] — keywords that trigger this domain
  triggerKeywords: json("triggerKeywords"),
  // JSON: ElicitationQuestion[] — { id, question, type, options?, defaultValue?, rationale }
  questions: json("questions"),
  // JSON: Record<string, string> — smart defaults { dimension: defaultValue }
  smartDefaults: json("smartDefaults"),
  // JSON: string[] — domain priors automatically applied
  domainPriors: json("domainPriors"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DomainScript = typeof domainScripts.$inferSelect;
export type InsertDomainScript = typeof domainScripts.$inferInsert;

// ─── Quick-Start Templates ────────────────────────────────────────────────────

export const quickStartTemplates = mysqlTable("quick_start_templates", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  domain: varchar("domain", { length: 64 }),
  // JSON: ScaffoldBlock[] — pre-populated blocks
  scaffoldBlocks: json("scaffoldBlocks"),
  targetModel: varchar("targetModel", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuickStartTemplate = typeof quickStartTemplates.$inferSelect;
export type InsertQuickStartTemplate = typeof quickStartTemplates.$inferInsert;

// ─── Example Prompt Library ───────────────────────────────────────────────────
// 100+ real, tested, domain-diverse example prompts.
// Each row is a complete, standalone prompt with full metadata.
export const examplePrompts = mysqlTable("example_prompts", {
  id: int("id").autoincrement().primaryKey(),
  // Short human-readable identifier, e.g. "cot-math-grade-school"
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  // Domain: software-engineering, creative-writing, data-analysis, legal,
  // medical, marketing, education, research, customer-support, etc.
  domain: varchar("domain", { length: 64 }).notNull(),
  // Task type: explain, generate, analyze, summarize, classify, translate,
  // extract, rewrite, debug, plan, evaluate, roleplay, etc.
  taskType: varchar("taskType", { length: 64 }).notNull(),
  // Primary pattern demonstrated (matches prompt_patterns.slug)
  patternSlug: varchar("patternSlug", { length: 64 }),
  // The full prompt text — ready to copy and use
  promptText: text("promptText").notNull(),
  // Optional: the expected or example output
  exampleOutput: text("exampleOutput"),
  // JSON: string[] — patterns demonstrated beyond the primary
  secondaryPatterns: json("secondaryPatterns"),
  // JSON: string[] — model families this was tested/optimized for
  testedModels: json("testedModels"),
  // Difficulty: beginner, intermediate, advanced
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("intermediate"),
  // Approximate token count of the prompt itself
  tokenCount: int("tokenCount"),
  // Source or attribution note
  sourceNote: text("sourceNote"),
  // Whether this is a featured/highlighted example
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExamplePrompt = typeof examplePrompts.$inferSelect;
export type InsertExamplePrompt = typeof examplePrompts.$inferInsert;

// ─── Swarm Templates ──────────────────────────────────────────────────────────
// Pre-built multi-agent swarm configurations.
// Each template defines a topology and a set of agent roles with system prompts.
export const swarmTemplates = mysqlTable("swarm_templates", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  useCase: text("useCase").notNull(),
  topology: mysqlEnum("topology", ["sequential", "parallel", "hub-spoke", "hierarchical", "iterative"]).notNull(),
  // JSON: SwarmAgent[] — { id, name, role, systemPrompt, inputFrom, outputTo, handoffCondition }
  agents: json("agents").notNull(),
  // JSON: string[] — compatible platforms (Manus, AutoGen, CrewAI, LangGraph, OpenAI Swarm)
  compatiblePlatforms: json("compatiblePlatforms"),
  // JSON: string[] — business domains this applies to
  domains: json("domains"),
  agentCount: int("agentCount").notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("intermediate"),
  isFeatured: boolean("isFeatured").default(false),
  sourceNote: text("sourceNote"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SwarmTemplate = typeof swarmTemplates.$inferSelect;
export type InsertSwarmTemplate = typeof swarmTemplates.$inferInsert;

// ─── Custom Swarms ───────────────────────────────────────────────────────────────────────────────
// User-built swarm configurations. Each row is a named swarm with a topology
// and a set of agent definitions. Agents can be typed manually or seeded from
// the example_prompts library.
export const customSwarms = mysqlTable("custom_swarms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  goal: text("goal"),
  topology: mysqlEnum("topology", ["sequential", "parallel", "hub-spoke", "hierarchical", "iterative"]).notNull().default("sequential"),
  // JSON: CustomSwarmAgent[] — { id, name, role, systemPrompt, inputFrom, outputTo, handoffCondition, sourceExampleSlug? }
  agents: json("agents").notNull(),
  agentCount: int("agentCount").notNull().default(0),
  // JSON: string[] — compatible platforms user targets
  compatiblePlatforms: json("compatiblePlatforms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomSwarm = typeof customSwarms.$inferSelect;
export type InsertCustomSwarm = typeof customSwarms.$inferInsert;

// ─── Phase 6: Scaffold Versions (Feature 3 — Version History) ────────────────
// Every scaffold edit creates a new immutable version. Full snapshots, not deltas.
// Source: Myers (1986) diff algorithm; full snapshot strategy for correctness.
export const scaffoldVersions = mysqlTable("scaffold_versions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  versionNumber: int("versionNumber").notNull(), // monotonic per session
  // JSON: ScaffoldBlock[] — complete snapshot of all blocks at this point
  fullSnapshot: json("fullSnapshot").notNull(),
  // Who/what created this version
  createdBy: mysqlEnum("createdBy", [
    "user",
    "diagnosis",
    "pattern-apply",
    "swarm-sync",
    "discovery",
    "reverse",
    "rollback",
  ]).notNull(),
  // Human-readable summary, e.g. "Applied Chain-of-Thought pattern to Reasoning block"
  changeSummary: varchar("changeSummary", { length: 512 }).notNull(),
  parentVersionId: int("parentVersionId"), // null for version 1
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScaffoldVersion = typeof scaffoldVersions.$inferSelect;
export type InsertScaffoldVersion = typeof scaffoldVersions.$inferInsert;

// ─── Phase 6: Diagnosis Patterns (Feature 1 — Output Diagnosis) ──────────────
// Canonical catalog of output failure modes. Mirrors anti_patterns schema.
// Sources: Dhuliawala et al. (2023), Madaan et al. (2023), Shinn et al. (2023),
//          Wang et al. (2022), Anthropic Prompt Engineering Guide, OpenAI Guide.
export const diagnosisPatterns = mysqlTable("diagnosis_patterns", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  // Category: reasoning-drift, format-drift, persona-drift, scope-drift,
  // hallucination, refusal-drift, length-drift, tone-drift, etc.
  category: varchar("category", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium").notNull(),
  description: text("description").notNull(),
  // JSON: string[] — what the output looks like when this failure is happening
  detectionHeuristics: json("detectionHeuristics"),
  // JSON: { prompt: string, output: string, analysis: string }
  examplePair: json("examplePair"),
  // Canonical remediation: which block to edit and what to add
  canonicalRemediation: text("canonicalRemediation").notNull(),
  // The scaffold block most commonly affected
  primaryAffectedBlock: varchar("primaryAffectedBlock", { length: 64 }),
  // JSON: string[] — prompt_patterns.slug values that fix this
  linkedPatternSlugs: json("linkedPatternSlugs"),
  // JSON: string[] — anti_patterns.slug values that co-occur
  linkedAntiPatternSlugs: json("linkedAntiPatternSlugs"),
  sourceReference: text("sourceReference"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DiagnosisPattern = typeof diagnosisPatterns.$inferSelect;
export type InsertDiagnosisPattern = typeof diagnosisPatterns.$inferInsert;

// ─── Phase 6: Diagnoses (Feature 1 — Output Diagnosis) ───────────────────────
// Ties a scaffold session to a diagnosis event.
export const diagnoses = mysqlTable("diagnoses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId"),
  // The actual output text the user pasted
  outputText: text("outputText").notNull(),
  // Optional: the prompt text used (auto-filled from session or pasted)
  promptText: text("promptText"),
  // JSON: DiagnosisResult — { driftMap, rootCauses, suggestedEdits, recommendedPatterns, crossReferencedAntiPatterns }
  diagnosisJson: json("diagnosisJson"),
  // JSON: Record<editId, "accepted" | "dismissed"> — user's response to each suggestion
  editAcceptance: json("editAcceptance"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = typeof diagnoses.$inferInsert;

// ─── Phase 6: Comparison Runs (Feature 2 — A/B Comparison) ───────────────────
// Ties two prompt variants to a session for head-to-head comparison.
// Methodology: pairwise preference (Chiang et al. 2024 "Chatbot Arena").
export const comparisonRuns = mysqlTable("comparison_runs", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId"),
  // The shared input text used for both variants
  inputText: text("inputText").notNull(),
  // Variant A identity
  variantALabel: varchar("variantALabel", { length: 64 }).notNull(), // e.g. "terse", "chain-of-thought"
  variantAPrompt: text("variantAPrompt").notNull(),
  variantAOutput: text("variantAOutput"),
  variantAModel: varchar("variantAModel", { length: 64 }),
  variantATokens: int("variantATokens"),
  // Variant B identity
  variantBLabel: varchar("variantBLabel", { length: 64 }).notNull(),
  variantBPrompt: text("variantBPrompt").notNull(),
  variantBOutput: text("variantBOutput"),
  variantBModel: varchar("variantBModel", { length: 64 }),
  variantBTokens: int("variantBTokens"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ComparisonRun = typeof comparisonRuns.$inferSelect;
export type InsertComparisonRun = typeof comparisonRuns.$inferInsert;

// ─── Phase 6: Comparison Verdicts (Feature 2 — A/B Comparison) ───────────────
// User's preference verdict for a comparison run.
// Idempotent: one verdict per (userId, comparisonRunId) — upsert on re-submit.
export const comparisonVerdicts = mysqlTable("comparison_verdicts", {
  id: int("id").autoincrement().primaryKey(),
  comparisonRunId: int("comparisonRunId").notNull(),
  userId: int("userId"),
  // Primary signal: pairwise preference
  preference: mysqlEnum("preference", ["a", "b", "tie", "both-bad"]).notNull(),
  // Secondary signal: per-output quality rating (1-5)
  ratingA: int("ratingA"), // 1-5 or null
  ratingB: int("ratingB"), // 1-5 or null
  // JSON: string[] — reason tags: accuracy, tone, format, concision, creativity, safety
  reasonTags: json("reasonTags"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComparisonVerdict = typeof comparisonVerdicts.$inferSelect;
export type InsertComparisonVerdict = typeof comparisonVerdicts.$inferInsert;
