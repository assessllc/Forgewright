import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  promptPatterns,
  antiPatterns,
  modelQuirks,
  domainScripts,
  quickStartTemplates,
} from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

/** Drizzle with mysql2 returns JSON columns already parsed; only parse if still a string. */
function safeJson<T>(value: unknown): T {
  if (value === null || value === undefined) return [] as unknown as T;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return [] as unknown as T; }
  }
  return value as T;
}

export const knowledgeRouter = router({
  // ── Prompt Patterns ──────────────────────────────────────────────────────
  getPatterns: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(promptPatterns)
        .orderBy(asc(promptPatterns.sortOrder));
      let results = rows;
      if (input?.category) {
        results = results.filter((r) => r.category === input.category);
      }
      if (input?.search) {
        const q = input.search.toLowerCase();
        results = results.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );
      }
      return results.map((r) => ({
        ...r,
        taskTypes: safeJson<string[]>(r.taskTypes),
        compatibleModels: safeJson<string[]>(r.compatibleModels),
        examples: safeJson<unknown[]>(r.examples),
        preventsAntiPatterns: safeJson<string[]>(r.preventsAntiPatterns),
      }));
    }),

  getPattern: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(promptPatterns)
        .where(eq(promptPatterns.slug, input.slug))
        .limit(1);
      if (!rows[0]) return null;
      const r = rows[0];
      return {
        ...r,
        taskTypes: safeJson<string[]>(r.taskTypes),
        compatibleModels: safeJson<string[]>(r.compatibleModels),
        examples: safeJson<unknown[]>(r.examples),
        preventsAntiPatterns: safeJson<string[]>(r.preventsAntiPatterns),
      };
    }),

  // ── Anti-patterns ─────────────────────────────────────────────────────────
  getAntiPatterns: publicProcedure
    .input(
      z.object({
        slugs: z.array(z.string()).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(antiPatterns)
        .orderBy(asc(antiPatterns.sortOrder));
      let results = rows;
      if (input?.slugs && input.slugs.length > 0) {
        results = results.filter((r) => input.slugs!.includes(r.slug));
      }
      return results.map((r) => ({
        ...r,
        detectionRules: safeJson<unknown[]>(r.detectionRules),
        examples: safeJson<unknown[]>(r.examples),
        fixedByPatterns: safeJson<string[]>(r.fixedByPatterns),
      }));
    }),

  // ── Model Quirks ──────────────────────────────────────────────────────────
  getModelQuirks: publicProcedure
    .input(z.object({ modelId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows;
      if (input?.modelId) {
        rows = await db
          .select()
          .from(modelQuirks)
          .where(eq(modelQuirks.modelId, input.modelId))
          .limit(1);
      } else {
        rows = await db
          .select()
          .from(modelQuirks)
          .orderBy(asc(modelQuirks.sortOrder));
      }
      return rows.map((r) => ({
        ...r,
        strengths: safeJson<string[]>(r.strengths),
        weaknesses: safeJson<string[]>(r.weaknesses),
        optimizationTips: safeJson<string[]>(r.optimizationTips),
        recommendedPatterns: safeJson<string[]>(r.recommendedPatterns),
        avoidPatterns: safeJson<string[]>(r.avoidPatterns),
        pricing: safeJson<Record<string, number>>(r.pricing),
        supportsStreaming: Boolean(r.supportsStreaming),
        supportsSystemPrompt: Boolean(r.supportsSystemPrompt),
        supportsJsonMode: Boolean(r.supportsJsonMode),
        supportsVision: Boolean(r.supportsVision),
      }));
    }),

  // ── Domain Scripts ────────────────────────────────────────────────────────
  getDomainScripts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(domainScripts)
      .orderBy(asc(domainScripts.sortOrder));
    return rows.map((r) => ({
      ...r,
      triggerKeywords: safeJson<string[]>(r.triggerKeywords),
      questions: safeJson<unknown[]>(r.questions),
      smartDefaults: safeJson<Record<string, unknown>>(r.smartDefaults),
      domainPriors: safeJson<Record<string, unknown>>(r.domainPriors),
    }));
  }),

  // ── Quick-start Templates ─────────────────────────────────────────────────
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(quickStartTemplates)
      .orderBy(asc(quickStartTemplates.sortOrder));
    return rows.map((r) => ({
      ...r,
      scaffoldBlocks: safeJson<unknown[]>(r.scaffoldBlocks),
    }));
  }),

  getTemplate: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(quickStartTemplates)
        .where(eq(quickStartTemplates.slug, input.slug))
        .limit(1);
      if (!rows[0]) return null;
      return {
        ...rows[0],
        scaffoldBlocks: safeJson<unknown[]>(rows[0].scaffoldBlocks),
      };
    }),
});
