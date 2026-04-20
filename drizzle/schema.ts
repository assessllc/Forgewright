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
