/**
 * Comparison Router — Phase 6 Feature 2
 *
 * Implements pairwise preference evaluation for prompt variants.
 * Methodology: Chatbot Arena-style pairwise comparison (Chiang et al. 2024).
 *
 * Provides:
 * - createComparisonRun: persist a comparison run with two variants
 * - updateComparisonOutputs: update with the LLM-generated outputs (after SSE)
 * - recordVerdict: save the user's preference verdict
 * - getComparisonRun: get a single run with its verdict
 * - listComparisonRuns: list runs for a session
 * - getWinRates: aggregate win/loss/tie stats per variant label for a session
 *
 * The actual LLM calls run as SSE via /api/stream/compare (registered in streaming.ts).
 * This router handles the persistence and analytics layer.
 *
 * Source: Chiang et al. (2024) "Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference"
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { comparisonRuns, comparisonVerdicts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

function safeJson<T>(value: unknown): T {
  if (value === null || value === undefined) return [] as unknown as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return [] as unknown as T;
    }
  }
  return value as T;
}

export const comparisonRouter = router({
  /**
   * Create a new comparison run with two prompt variants.
   * Outputs are initially null — they are filled in after the SSE streams complete.
   */
  createComparisonRun: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        inputText: z.string().min(1),
        variantALabel: z.string().min(1).max(64),
        variantAPrompt: z.string().min(1),
        variantAModel: z.string().optional(),
        variantBLabel: z.string().min(1).max(64),
        variantBPrompt: z.string().min(1),
        variantBModel: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user?.id ?? null;
      const result = await db.insert(comparisonRuns).values({
        sessionId: input.sessionId,
        userId,
        inputText: input.inputText,
        variantALabel: input.variantALabel,
        variantAPrompt: input.variantAPrompt,
        variantAOutput: null,
        variantAModel: input.variantAModel ?? null,
        variantATokens: null,
        variantBLabel: input.variantBLabel,
        variantBPrompt: input.variantBPrompt,
        variantBOutput: null,
        variantBModel: input.variantBModel ?? null,
        variantBTokens: null,
      });
      const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? 0;
      return { id: insertId };
    }),

  /**
   * Update a comparison run with the LLM-generated outputs.
   * Called after both SSE streams complete.
   */
  updateComparisonOutputs: publicProcedure
    .input(
      z.object({
        runId: z.number(),
        variantAOutput: z.string().optional(),
        variantATokens: z.number().optional(),
        variantBOutput: z.string().optional(),
        variantBTokens: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const updateData: Record<string, unknown> = {};
      if (input.variantAOutput !== undefined) updateData.variantAOutput = input.variantAOutput;
      if (input.variantATokens !== undefined) updateData.variantATokens = input.variantATokens;
      if (input.variantBOutput !== undefined) updateData.variantBOutput = input.variantBOutput;
      if (input.variantBTokens !== undefined) updateData.variantBTokens = input.variantBTokens;
      await db
        .update(comparisonRuns)
        .set(updateData)
        .where(eq(comparisonRuns.id, input.runId));
      return { success: true };
    }),

  /**
   * Record the user's preference verdict for a comparison run.
   * Upserts: one verdict per (userId, comparisonRunId).
   */
  recordVerdict: publicProcedure
    .input(
      z.object({
        comparisonRunId: z.number(),
        preference: z.enum(["a", "b", "tie", "both-bad"]),
        ratingA: z.number().min(1).max(5).optional(),
        ratingB: z.number().min(1).max(5).optional(),
        reasonTags: z
          .array(
            z.enum([
              "accuracy",
              "tone",
              "format",
              "concision",
              "creativity",
              "safety",
              "completeness",
              "specificity",
            ])
          )
          .optional(),
        notes: z.string().max(1000).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user?.id ?? null;

      // Check for existing verdict to upsert
      const existing = await db
        .select({ id: comparisonVerdicts.id })
        .from(comparisonVerdicts)
        .where(eq(comparisonVerdicts.comparisonRunId, input.comparisonRunId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(comparisonVerdicts)
          .set({
            preference: input.preference,
            ratingA: input.ratingA ?? null,
            ratingB: input.ratingB ?? null,
            reasonTags: input.reasonTags
              ? (JSON.stringify(input.reasonTags) as unknown as null)
              : null,
            notes: input.notes ?? null,
            updatedAt: new Date(),
          })
          .where(eq(comparisonVerdicts.id, existing[0].id));
        return { id: existing[0].id, updated: true };
      }

      const result = await db.insert(comparisonVerdicts).values({
        comparisonRunId: input.comparisonRunId,
        userId,
        preference: input.preference,
        ratingA: input.ratingA ?? null,
        ratingB: input.ratingB ?? null,
        reasonTags: input.reasonTags
          ? (JSON.stringify(input.reasonTags) as unknown as null)
          : null,
        notes: input.notes ?? null,
      });
      const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? 0;
      return { id: insertId, updated: false };
    }),

  /**
   * Get a single comparison run with its verdict (if any).
   */
  getComparisonRun: publicProcedure
    .input(z.object({ runId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const runs = await db
        .select()
        .from(comparisonRuns)
        .where(eq(comparisonRuns.id, input.runId))
        .limit(1);
      if (!runs[0]) return null;

      const verdicts = await db
        .select()
        .from(comparisonVerdicts)
        .where(eq(comparisonVerdicts.comparisonRunId, input.runId))
        .limit(1);

      return {
        run: runs[0],
        verdict: verdicts[0]
          ? {
              ...verdicts[0],
              reasonTags: safeJson<string[]>(verdicts[0].reasonTags),
            }
          : null,
      };
    }),

  /**
   * List all comparison runs for a session, newest first.
   */
  listComparisonRuns: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const runs = await db
        .select()
        .from(comparisonRuns)
        .where(eq(comparisonRuns.sessionId, input.sessionId))
        .orderBy(desc(comparisonRuns.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Fetch verdicts for all runs
      const runIds = runs.map((r) => r.id);
      const allVerdicts = runIds.length > 0
        ? await db
            .select()
            .from(comparisonVerdicts)
            .where(eq(comparisonVerdicts.comparisonRunId, runIds[0]))
        : [];

      const verdictMap = new Map(allVerdicts.map((v) => [v.comparisonRunId, v]));

      return runs.map((run) => ({
        ...run,
        verdict: verdictMap.get(run.id)
          ? {
              ...verdictMap.get(run.id)!,
              reasonTags: safeJson<string[]>(verdictMap.get(run.id)!.reasonTags),
            }
          : null,
      }));
    }),

  /**
   * Aggregate win/loss/tie statistics per variant label for a session.
   * Returns a leaderboard of variant performance based on user verdicts.
   *
   * Methodology: pairwise Elo-style aggregation (simplified).
   * Source: Chiang et al. (2024) "Chatbot Arena"
   */
  getWinRates: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Get all runs for this session
      const runs = await db
        .select()
        .from(comparisonRuns)
        .where(eq(comparisonRuns.sessionId, input.sessionId));

      if (runs.length === 0) return [];

      // Get verdicts for all runs
      const runIds = runs.map((r) => r.id);
      const allVerdicts: (typeof comparisonVerdicts.$inferSelect)[] = [];
      for (const runId of runIds) {
        const v = await db
          .select()
          .from(comparisonVerdicts)
          .where(eq(comparisonVerdicts.comparisonRunId, runId))
          .limit(1);
        if (v[0]) allVerdicts.push(v[0]);
      }

      // Build stats per variant label
      const stats = new Map<
        string,
        { label: string; wins: number; losses: number; ties: number; bothBad: number; total: number }
      >();

      for (const run of runs) {
        const verdict = allVerdicts.find((v) => v.comparisonRunId === run.id);
        if (!verdict) continue;

        const labelA = run.variantALabel;
        const labelB = run.variantBLabel;

        if (!stats.has(labelA)) {
          stats.set(labelA, { label: labelA, wins: 0, losses: 0, ties: 0, bothBad: 0, total: 0 });
        }
        if (!stats.has(labelB)) {
          stats.set(labelB, { label: labelB, wins: 0, losses: 0, ties: 0, bothBad: 0, total: 0 });
        }

        const statA = stats.get(labelA)!;
        const statB = stats.get(labelB)!;

        statA.total++;
        statB.total++;

        if (verdict.preference === "a") {
          statA.wins++;
          statB.losses++;
        } else if (verdict.preference === "b") {
          statB.wins++;
          statA.losses++;
        } else if (verdict.preference === "tie") {
          statA.ties++;
          statB.ties++;
        } else if (verdict.preference === "both-bad") {
          statA.bothBad++;
          statB.bothBad++;
        }
      }

      return Array.from(stats.values())
        .map((s) => ({
          ...s,
          winRate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
        }))
        .sort((a, b) => b.winRate - a.winRate);
    }),
});
