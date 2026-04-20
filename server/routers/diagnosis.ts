/**
 * Diagnosis Router — Phase 6 Feature 1
 *
 * Provides:
 * - getDiagnosisPatterns: paginated catalog of 25 output failure modes
 * - getDiagnosisPattern: single pattern by slug
 * - createDiagnosis: persist a diagnosis event (sessionId + outputText)
 * - getDiagnoses: list diagnoses for a session
 * - updateDiagnosisAcceptance: record which suggestions the user accepted
 *
 * The actual LLM-powered diagnosis runs as SSE via /api/stream/diagnose
 * (registered in streaming.ts). This router handles the persistence layer.
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { diagnosisPatterns, diagnoses } from "../../drizzle/schema";
import { eq, asc, desc } from "drizzle-orm";

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

function parseDiagnosisPattern(r: typeof diagnosisPatterns.$inferSelect) {
  return {
    ...r,
    detectionHeuristics: safeJson<string[]>(r.detectionHeuristics),
    examplePair: safeJson<{ prompt: string; output: string; analysis: string } | null>(r.examplePair),
    linkedPatternSlugs: safeJson<string[]>(r.linkedPatternSlugs),
    linkedAntiPatternSlugs: safeJson<string[]>(r.linkedAntiPatternSlugs),
  };
}

export const diagnosisRouter = router({
  /**
   * Get all diagnosis patterns, optionally filtered by category or severity.
   */
  getDiagnosisPatterns: publicProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          severity: z.enum(["low", "medium", "high"]).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(diagnosisPatterns)
        .orderBy(asc(diagnosisPatterns.sortOrder));

      let results = rows;
      if (input?.category) {
        results = results.filter((r) => r.category === input.category);
      }
      if (input?.severity) {
        results = results.filter((r) => r.severity === input.severity);
      }
      if (input?.search) {
        const q = input.search.toLowerCase();
        results = results.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q)
        );
      }
      return results.map(parseDiagnosisPattern);
    }),

  /**
   * Get a single diagnosis pattern by slug.
   */
  getDiagnosisPattern: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(diagnosisPatterns)
        .where(eq(diagnosisPatterns.slug, input.slug))
        .limit(1);
      if (!rows[0]) return null;
      return parseDiagnosisPattern(rows[0]);
    }),

  /**
   * Get the distinct categories available in the diagnosis patterns catalog.
   */
  getDiagnosisCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select({ category: diagnosisPatterns.category })
      .from(diagnosisPatterns)
      .orderBy(asc(diagnosisPatterns.category));
    const seen = new Set<string>();
    return rows
      .map((r) => r.category)
      .filter((c) => {
        if (seen.has(c)) return false;
        seen.add(c);
        return true;
      });
  }),

  /**
   * Persist a new diagnosis event.
   * Called after the SSE stream completes with the full diagnosisJson.
   */
  createDiagnosis: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        outputText: z.string().min(1),
        promptText: z.string().optional(),
        diagnosisJson: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user?.id ?? null;
      const result = await db.insert(diagnoses).values({
        sessionId: input.sessionId,
        userId,
        outputText: input.outputText,
        promptText: input.promptText ?? null,
        diagnosisJson: input.diagnosisJson
          ? (JSON.stringify(input.diagnosisJson) as unknown as null)
          : null,
        editAcceptance: null,
      });
      const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? 0;
      return { id: insertId };
    }),

  /**
   * List all diagnoses for a session, newest first.
   */
  getDiagnoses: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(diagnoses)
        .where(eq(diagnoses.sessionId, input.sessionId))
        .orderBy(desc(diagnoses.createdAt));
      return rows.map((r) => ({
        ...r,
        diagnosisJson: safeJson<unknown>(r.diagnosisJson),
        editAcceptance: safeJson<Record<string, "accepted" | "dismissed">>(r.editAcceptance),
      }));
    }),

  /**
   * Record the user's acceptance/dismissal of suggested edits.
   * editAcceptance: Record<editId, "accepted" | "dismissed">
   */
  updateDiagnosisAcceptance: publicProcedure
    .input(
      z.object({
        diagnosisId: z.number(),
        editAcceptance: z.record(z.string(), z.enum(["accepted", "dismissed"])),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db
        .update(diagnoses)
        .set({
          editAcceptance: JSON.stringify(input.editAcceptance) as unknown as null,
        })
        .where(eq(diagnoses.id, input.diagnosisId));
      return { success: true };
    }),
});
