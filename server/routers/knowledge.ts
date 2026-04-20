import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import type { SwarmAgent } from "../../shared/prompitect-types";
import {
  promptPatterns,
  antiPatterns,
  modelQuirks,
  domainScripts,
  quickStartTemplates,
  examplePrompts,
  swarmTemplates,
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

  // ── Example Prompt Library ────────────────────────────────────────────────
  getExamples: publicProcedure
    .input(
      z
        .object({
          domain: z.string().optional(),
          patternSlug: z.string().optional(),
          difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
          featured: z.boolean().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(200).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(examplePrompts)
        .orderBy(asc(examplePrompts.id));
      let results = rows.map((r) => ({
        ...r,
        testedModels: safeJson<string[]>(r.testedModels),
        secondaryPatterns: safeJson<string[]>(r.secondaryPatterns),
        isFeatured: Boolean(r.isFeatured),
      }));
      if (input?.domain) results = results.filter((r) => r.domain === input.domain);
      if (input?.patternSlug) results = results.filter((r) => r.patternSlug === input.patternSlug);
      if (input?.difficulty) results = results.filter((r) => r.difficulty === input.difficulty);
      if (input?.featured) results = results.filter((r) => r.isFeatured);
      if (input?.search) {
        const q = input.search.toLowerCase();
        results = results.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.domain.toLowerCase().includes(q) ||
            (r.promptText && r.promptText.toLowerCase().includes(q))
        );
      }
      if (input?.limit) results = results.slice(0, input.limit);
      return results;
    }),

  getExample: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(examplePrompts)
        .where(eq(examplePrompts.slug, input.slug))
        .limit(1);
      if (!rows[0]) return null;
      return {
        ...rows[0],
        testedModels: safeJson<string[]>(rows[0].testedModels),
        secondaryPatterns: safeJson<string[]>(rows[0].secondaryPatterns),
        isFeatured: Boolean(rows[0].isFeatured),
      };
    }),

  // ── Swarm Templates ──────────────────────────────────────────────────────────────────────────────
  getSwarmTemplates: publicProcedure
    .input(
      z.object({
        topology: z.enum(["sequential", "parallel", "hub-spoke", "hierarchical", "iterative"]).optional(),
        domain: z.string().optional(),
        featured: z.boolean().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(swarmTemplates)
        .orderBy(asc(swarmTemplates.sortOrder));
      let results = rows;
      if (input?.topology) {
        results = results.filter((r) => r.topology === input.topology);
      }
      if (input?.featured) {
        results = results.filter((r) => Boolean(r.isFeatured));
      }
      if (input?.domain) {
        const d = input.domain.toLowerCase();
        results = results.filter((r) => {
          const domains = safeJson<string[]>(r.domains);
          return domains.some((dom) => dom.toLowerCase().includes(d));
        });
      }
      if (input?.search) {
        const q = input.search.toLowerCase();
        results = results.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.useCase.toLowerCase().includes(q)
        );
      }
      return results.map((r) => ({
        ...r,
        agents: safeJson<SwarmAgent[]>(r.agents),
        compatiblePlatforms: safeJson<string[]>(r.compatiblePlatforms),
        domains: safeJson<string[]>(r.domains),
        isFeatured: Boolean(r.isFeatured),
      }));
    }),

  getSwarmTemplate: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(swarmTemplates)
        .where(eq(swarmTemplates.slug, input.slug))
        .limit(1);
      if (!rows[0]) return null;
      return {
        ...rows[0],
        agents: safeJson<SwarmAgent[]>(rows[0].agents),
        compatiblePlatforms: safeJson<string[]>(rows[0].compatiblePlatforms),
        domains: safeJson<string[]>(rows[0].domains),
        isFeatured: Boolean(rows[0].isFeatured),
      };
    }),
});
