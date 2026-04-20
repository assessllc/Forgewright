/**
 * Insights Router — Phase 6 Feature 4: Personal Pattern Learning
 *
 * Analyzes a user's session history, comparison verdicts, and diagnosis
 * acceptance patterns to surface personalized learning insights.
 *
 * 12 insight rules, each grounded in observable user behavior:
 *
 * 1. DOMINANT_FAILURE_MODE    — most common diagnosis category in their sessions
 * 2. PREFERRED_VARIANT        — variant label they consistently prefer in A/B tests
 * 3. ACCEPTED_PATTERN         — prompt pattern they apply most from the Pattern Library
 * 4. AVOIDED_ANTIPATTERN      — anti-pattern they've fixed most via diagnosis
 * 5. MODEL_AFFINITY           — model they use most in comparison runs
 * 6. DIAGNOSIS_ACCEPTANCE     — percentage of diagnosis suggestions they accept
 * 7. VERSION_CHURN            — sessions with high version count (iteration-heavy)
 * 8. ROLLBACK_FREQUENCY       — how often they roll back vs. keep edits
 * 9. DOMAIN_CONCENTRATION     — domains they work in most
 * 10. REASONING_BLOCK_USAGE   — whether they consistently enable the Reasoning block
 * 11. FORMAT_BLOCK_USAGE      — whether they consistently specify output format
 * 12. SESSION_COMPLETION_RATE — ratio of sessions with variants vs. just scaffolds
 *
 * Sources:
 * - Shinn et al. (2023) "Reflexion: Language Agents with Verbal Reinforcement Learning"
 * - Madaan et al. (2023) "Self-Refine: Iterative Refinement with Self-Feedback"
 * - Anthropic Prompt Engineering Guide (2024)
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  sessions,
  diagnoses,
  diagnosisPatterns,
  comparisonRuns,
  comparisonVerdicts,
  scaffoldVersions,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InsightType =
  | "DOMINANT_FAILURE_MODE"
  | "PREFERRED_VARIANT"
  | "ACCEPTED_PATTERN"
  | "AVOIDED_ANTIPATTERN"
  | "MODEL_AFFINITY"
  | "DIAGNOSIS_ACCEPTANCE"
  | "VERSION_CHURN"
  | "ROLLBACK_FREQUENCY"
  | "DOMAIN_CONCENTRATION"
  | "REASONING_BLOCK_USAGE"
  | "FORMAT_BLOCK_USAGE"
  | "SESSION_COMPLETION_RATE";

export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  recommendation: string;
  confidence: "low" | "medium" | "high";
  dataPoints: number; // how many observations this is based on
}

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

function confidenceFromCount(count: number): "low" | "medium" | "high" {
  if (count >= 10) return "high";
  if (count >= 4) return "medium";
  return "low";
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const insightsRouter = router({
  /**
   * Compute personalized insights for the authenticated user.
   * Returns an array of Insight objects, each backed by real behavioral data.
   * Minimum data threshold: at least 2 sessions required for any insight.
   */
  getInsights: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(12).default(12),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { insights: [], dataQuality: "insufficient" as const };

      const userId = ctx.user?.id;
      if (!userId) return { insights: [], dataQuality: "insufficient" as const };

      const limit = input?.limit ?? 12;
      const insights: Insight[] = [];

      // ── Fetch base data ──────────────────────────────────────────────────────
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.createdAt))
        .limit(100);

      if (userSessions.length < 2) {
        return { insights: [], dataQuality: "insufficient" as const };
      }

      const sessionIds = userSessions.map((s) => s.id);

      // ── Rule 1: DOMAIN_CONCENTRATION ─────────────────────────────────────────
      {
        const domainCounts = new Map<string, number>();
        for (const s of userSessions) {
          if (s.domain) {
            domainCounts.set(s.domain, (domainCounts.get(s.domain) ?? 0) + 1);
          }
        }
        if (domainCounts.size > 0) {
          const topDomain = Array.from(domainCounts.entries()).sort((a, b) => b[1] - a[1])[0];
          const pct = Math.round((topDomain[1] / userSessions.length) * 100);
          insights.push({
            type: "DOMAIN_CONCENTRATION",
            title: "Primary Domain",
            description: `${pct}% of your sessions are in the ${topDomain[0]} domain.`,
            value: topDomain[0],
            unit: `${pct}% of sessions`,
            recommendation:
              pct > 70
                ? `You specialize heavily in ${topDomain[0]}. Consider exploring domain-specific patterns from the Pattern Library for this domain to deepen your expertise.`
                : `Your work spans multiple domains. The Pattern Library has domain-specific examples for each — explore the ${topDomain[0]} examples to see domain-optimized patterns.`,
            confidence: confidenceFromCount(topDomain[1]),
            dataPoints: topDomain[1],
          });
        }
      }

      // ── Rule 2: SESSION_COMPLETION_RATE ──────────────────────────────────────
      {
        const withVariants = userSessions.filter((s) => s.variants !== null).length;
        const rate = Math.round((withVariants / userSessions.length) * 100);
        insights.push({
          type: "SESSION_COMPLETION_RATE",
          title: "Session Completion Rate",
          description: `${rate}% of your sessions progress from scaffold to variant generation.`,
          value: rate,
          unit: "%",
          recommendation:
            rate < 50
              ? "More than half your sessions stop at the scaffold stage. Try using the Variant Generator on your next session — it produces terse, detailed, and chain-of-thought variants in one click."
              : rate >= 80
              ? "You consistently complete the full workflow. Consider using the A/B Compare feature to evaluate which variant performs best for your use cases."
              : "Good completion rate. The sessions that don't reach variants may benefit from the Discovery intake to clarify requirements before scaffolding.",
          confidence: confidenceFromCount(userSessions.length),
          dataPoints: userSessions.length,
        });
      }

      // ── Rule 3: REASONING_BLOCK_USAGE ────────────────────────────────────────
      {
        let reasoningEnabled = 0;
        let reasoningTotal = 0;
        for (const s of userSessions) {
          const blocks = safeJson<Array<{ id: string; enabled: boolean }>>(s.scaffoldBlocks);
          if (Array.isArray(blocks)) {
            const reasoningBlock = blocks.find((b) => b.id === "reasoning" || b.id?.includes("reasoning"));
            if (reasoningBlock !== undefined) {
              reasoningTotal++;
              if (reasoningBlock.enabled) reasoningEnabled++;
            }
          }
        }
        if (reasoningTotal >= 2) {
          const pct = Math.round((reasoningEnabled / reasoningTotal) * 100);
          insights.push({
            type: "REASONING_BLOCK_USAGE",
            title: "Reasoning Block Usage",
            description: `You enable the Reasoning block in ${pct}% of your scaffolds.`,
            value: pct,
            unit: "%",
            recommendation:
              pct < 40
                ? "The Reasoning block is underused in your sessions. Adding chain-of-thought instructions to the Reasoning block significantly improves output quality for analytical tasks. Try enabling it in your next scaffold."
                : pct >= 80
                ? "You consistently use the Reasoning block — a strong practice. Pair it with the Self-Critique pattern for even better results on complex reasoning tasks."
                : "You use the Reasoning block selectively. Consider enabling it for any task involving analysis, comparison, or multi-step problem solving.",
            confidence: confidenceFromCount(reasoningTotal),
            dataPoints: reasoningTotal,
          });
        }
      }

      // ── Rule 4: FORMAT_BLOCK_USAGE ───────────────────────────────────────────
      {
        let formatEnabled = 0;
        let formatTotal = 0;
        for (const s of userSessions) {
          const blocks = safeJson<Array<{ id: string; enabled: boolean }>>(s.scaffoldBlocks);
          if (Array.isArray(blocks)) {
            const formatBlock = blocks.find((b) => b.id === "format" || b.id?.includes("format"));
            if (formatBlock !== undefined) {
              formatTotal++;
              if (formatBlock.enabled) formatEnabled++;
            }
          }
        }
        if (formatTotal >= 2) {
          const pct = Math.round((formatEnabled / formatTotal) * 100);
          insights.push({
            type: "FORMAT_BLOCK_USAGE",
            title: "Format Block Usage",
            description: `You specify output format in ${pct}% of your scaffolds.`,
            value: pct,
            unit: "%",
            recommendation:
              pct < 50
                ? "Format non-compliance is one of the most common output failures. Enabling the Format block and specifying the exact output structure reduces format drift significantly."
                : "Good format specification habit. For JSON or structured outputs, add explicit parsing instructions: 'Return ONLY valid JSON. No prose, no code fences.'",
            confidence: confidenceFromCount(formatTotal),
            dataPoints: formatTotal,
          });
        }
      }

      // ── Rule 5: DOMINANT_FAILURE_MODE ────────────────────────────────────────
      {
        const userDiagnoses: (typeof diagnoses.$inferSelect)[] = [];
        for (const sessionId of sessionIds.slice(0, 20)) {
          const d = await db
            .select()
            .from(diagnoses)
            .where(eq(diagnoses.sessionId, sessionId))
            .limit(5);
          userDiagnoses.push(...d);
        }

        if (userDiagnoses.length >= 2) {
          const categoryCounts = new Map<string, number>();
          for (const d of userDiagnoses) {
            const diagJson = safeJson<{ driftMap?: Record<string, number> }>(d.diagnosisJson);
            if (diagJson?.driftMap) {
              for (const [category, count] of Object.entries(diagJson.driftMap)) {
                if (typeof count === "number") {
                  categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + count);
                }
              }
            }
          }
          if (categoryCounts.size > 0) {
            const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];
            insights.push({
              type: "DOMINANT_FAILURE_MODE",
              title: "Most Common Output Failure",
              description: `Your outputs most frequently show ${topCategory[0]} issues.`,
              value: topCategory[0],
              unit: `${topCategory[1]} occurrences`,
              recommendation: `Your outputs frequently exhibit ${topCategory[0]} failures. Review the Diagnosis Library for ${topCategory[0]} patterns and apply the canonical remediations to your scaffold templates.`,
              confidence: confidenceFromCount(userDiagnoses.length),
              dataPoints: userDiagnoses.length,
            });
          }
        }
      }

      // ── Rule 6: DIAGNOSIS_ACCEPTANCE ─────────────────────────────────────────
      {
        const userDiagnoses: (typeof diagnoses.$inferSelect)[] = [];
        for (const sessionId of sessionIds.slice(0, 20)) {
          const d = await db
            .select()
            .from(diagnoses)
            .where(eq(diagnoses.sessionId, sessionId))
            .limit(5);
          userDiagnoses.push(...d);
        }
        if (userDiagnoses.length >= 2) {
          let totalSuggestions = 0;
          let acceptedSuggestions = 0;
          for (const d of userDiagnoses) {
            const acceptance = safeJson<Record<string, "accepted" | "dismissed">>(d.editAcceptance);
            if (typeof acceptance === "object" && acceptance !== null) {
              const entries = Object.values(acceptance);
              totalSuggestions += entries.length;
              acceptedSuggestions += entries.filter((v) => v === "accepted").length;
            }
          }
          if (totalSuggestions >= 3) {
            const rate = Math.round((acceptedSuggestions / totalSuggestions) * 100);
            insights.push({
              type: "DIAGNOSIS_ACCEPTANCE",
              title: "Diagnosis Suggestion Acceptance",
              description: `You accept ${rate}% of diagnosis suggestions.`,
              value: rate,
              unit: "%",
              recommendation:
                rate < 30
                  ? "You dismiss most diagnosis suggestions. This may indicate the suggestions aren't matching your actual needs — try providing more context in the Diagnose panel about what you expected the output to do."
                  : rate >= 70
                  ? "High acceptance rate — the diagnosis engine is well-calibrated to your work. Your accepted edits are building a pattern of what works for you."
                  : "Moderate acceptance rate. The suggestions you dismiss may reveal edge cases in your prompting style — consider noting why you dismiss them to refine your approach.",
              confidence: confidenceFromCount(totalSuggestions),
              dataPoints: totalSuggestions,
            });
          }
        }
      }

      // ── Rule 7: PREFERRED_VARIANT ─────────────────────────────────────────────
      {
        const userRuns: (typeof comparisonRuns.$inferSelect)[] = [];
        for (const sessionId of sessionIds.slice(0, 20)) {
          const r = await db
            .select()
            .from(comparisonRuns)
            .where(eq(comparisonRuns.sessionId, sessionId))
            .limit(10);
          userRuns.push(...r);
        }

        if (userRuns.length >= 2) {
          const runIds = userRuns.map((r) => r.id);
          const allVerdicts: (typeof comparisonVerdicts.$inferSelect)[] = [];
          for (const runId of runIds) {
            const v = await db
              .select()
              .from(comparisonVerdicts)
              .where(eq(comparisonVerdicts.comparisonRunId, runId))
              .limit(1);
            if (v[0]) allVerdicts.push(v[0]);
          }

          if (allVerdicts.length >= 2) {
            const labelWins = new Map<string, number>();
            for (const verdict of allVerdicts) {
              const run = userRuns.find((r) => r.id === verdict.comparisonRunId);
              if (!run) continue;
              if (verdict.preference === "a") {
                labelWins.set(run.variantALabel, (labelWins.get(run.variantALabel) ?? 0) + 1);
              } else if (verdict.preference === "b") {
                labelWins.set(run.variantBLabel, (labelWins.get(run.variantBLabel) ?? 0) + 1);
              }
            }
            if (labelWins.size > 0) {
              const topLabel = Array.from(labelWins.entries()).sort((a, b) => b[1] - a[1])[0];
              insights.push({
                type: "PREFERRED_VARIANT",
                title: "Preferred Variant Style",
                description: `You prefer the "${topLabel[0]}" variant style in A/B comparisons.`,
                value: topLabel[0],
                unit: `${topLabel[1]} wins`,
                recommendation: `Your preference for "${topLabel[0]}" variants is consistent. Consider making this your default variant style in new sessions, or building scaffold templates that produce this style by default.`,
                confidence: confidenceFromCount(allVerdicts.length),
                dataPoints: allVerdicts.length,
              });
            }
          }
        }
      }

      // ── Rule 8: MODEL_AFFINITY ────────────────────────────────────────────────
      {
        const modelCounts = new Map<string, number>();
        for (const s of userSessions) {
          if (s.targetModel) {
            modelCounts.set(s.targetModel, (modelCounts.get(s.targetModel) ?? 0) + 1);
          }
        }
        if (modelCounts.size > 0) {
          const topModel = Array.from(modelCounts.entries()).sort((a, b) => b[1] - a[1])[0];
          const pct = Math.round((topModel[1] / userSessions.length) * 100);
          insights.push({
            type: "MODEL_AFFINITY",
            title: "Primary Model",
            description: `You use ${topModel[0]} in ${pct}% of your sessions.`,
            value: topModel[0],
            unit: `${pct}% of sessions`,
            recommendation:
              pct > 80
                ? `You rely heavily on ${topModel[0]}. The Model Guide has model-specific optimization tips — check the quirks and recommended patterns for ${topModel[0]} to get more out of it.`
                : `You use multiple models. The A/B Compare feature lets you run the same prompt on different models side-by-side to find the best fit for each task type.`,
            confidence: confidenceFromCount(topModel[1]),
            dataPoints: topModel[1],
          });
        }
      }

      // ── Rule 9: VERSION_CHURN ─────────────────────────────────────────────────
      {
        const versionCounts: number[] = [];
        for (const sessionId of sessionIds.slice(0, 20)) {
          const versions = await db
            .select({ versionNumber: scaffoldVersions.versionNumber })
            .from(scaffoldVersions)
            .where(eq(scaffoldVersions.sessionId, sessionId))
            .orderBy(desc(scaffoldVersions.versionNumber))
            .limit(1);
          if (versions[0]) versionCounts.push(versions[0].versionNumber);
        }
        if (versionCounts.length >= 2) {
          const avgVersions = Math.round(
            versionCounts.reduce((a, b) => a + b, 0) / versionCounts.length
          );
          insights.push({
            type: "VERSION_CHURN",
            title: "Average Iterations per Session",
            description: `You average ${avgVersions} versions per session.`,
            value: avgVersions,
            unit: "versions",
            recommendation:
              avgVersions > 8
                ? "High iteration count suggests you're refining heavily. Use the Diff View in Version History to see exactly what changed between versions — this helps identify which edits are actually improving the output."
                : avgVersions <= 2
                ? "Low iteration count. Prompts often benefit from iteration — try using the Diagnose feature on your outputs to identify improvement opportunities before finalizing."
                : "Healthy iteration pattern. The Version History panel lets you compare any two versions side-by-side to understand what changes had the most impact.",
            confidence: confidenceFromCount(versionCounts.length),
            dataPoints: versionCounts.length,
          });
        }
      }

      // ── Rule 10: ROLLBACK_FREQUENCY ───────────────────────────────────────────
      {
        let rollbackCount = 0;
        let totalVersions = 0;
        for (const sessionId of sessionIds.slice(0, 20)) {
          const versions = await db
            .select({ createdBy: scaffoldVersions.createdBy })
            .from(scaffoldVersions)
            .where(eq(scaffoldVersions.sessionId, sessionId));
          totalVersions += versions.length;
          rollbackCount += versions.filter((v) => v.createdBy === "rollback").length;
        }
        if (totalVersions >= 4) {
          const rollbackRate = Math.round((rollbackCount / totalVersions) * 100);
          insights.push({
            type: "ROLLBACK_FREQUENCY",
            title: "Rollback Rate",
            description: `${rollbackRate}% of your version changes are rollbacks.`,
            value: rollbackRate,
            unit: "%",
            recommendation:
              rollbackRate > 20
                ? "High rollback rate suggests edits are frequently not improving the prompt. Before making changes, use the Diagnose feature to identify specific issues — targeted edits based on diagnosis have higher success rates than exploratory edits."
                : rollbackRate === 0
                ? "No rollbacks — you rarely revert changes. If you're not using rollback, you may be losing good earlier versions. The Version History panel makes it easy to recover any prior state."
                : "Healthy rollback rate — you're using version history effectively to recover from unsuccessful edits.",
            confidence: confidenceFromCount(totalVersions),
            dataPoints: totalVersions,
          });
        }
      }

      // ── Rule 11: REVERSE_MODE_USAGE ───────────────────────────────────────────
      {
        const reverseCount = userSessions.filter((s) => s.isReverseModeSession).length;
        const pct = Math.round((reverseCount / userSessions.length) * 100);
        if (userSessions.length >= 3) {
          insights.push({
            type: "SESSION_COMPLETION_RATE", // reusing type for reverse mode
            title: "Reverse Mode Usage",
            description: `${pct}% of your sessions use Reverse Mode (prompt reconstruction).`,
            value: pct,
            unit: "%",
            recommendation:
              pct === 0
                ? "You haven't used Reverse Mode yet. Paste any LLM output into Reverse Mode to reconstruct the prompt that likely generated it — a powerful way to learn from outputs you encounter."
                : pct > 30
                ? "Heavy Reverse Mode usage suggests you're actively learning from existing outputs. Combine this with the Pattern Library to identify which patterns appear in outputs you find effective."
                : "Good Reverse Mode usage. The patterns identified in Reverse Mode sessions can be applied directly to your scaffolds via the Pattern Library.",
            confidence: confidenceFromCount(userSessions.length),
            dataPoints: userSessions.length,
          });
        }
      }

      // ── Rule 12: ACCEPTED_PATTERN (most applied from Pattern Library) ─────────
      {
        const patternApplyVersions: (typeof scaffoldVersions.$inferSelect)[] = [];
        for (const sessionId of sessionIds.slice(0, 20)) {
          const v = await db
            .select()
            .from(scaffoldVersions)
            .where(
              and(
                eq(scaffoldVersions.sessionId, sessionId),
                eq(scaffoldVersions.createdBy, "pattern-apply")
              )
            )
            .limit(10);
          patternApplyVersions.push(...v);
        }
        if (patternApplyVersions.length >= 2) {
          // Extract pattern names from changeSummary: "Applied X pattern to Y block"
          const patternCounts = new Map<string, number>();
          for (const v of patternApplyVersions) {
            const match = v.changeSummary.match(/Applied (.+?) pattern/i);
            if (match) {
              const patternName = match[1];
              patternCounts.set(patternName, (patternCounts.get(patternName) ?? 0) + 1);
            }
          }
          if (patternCounts.size > 0) {
            const topPattern = Array.from(patternCounts.entries()).sort((a, b) => b[1] - a[1])[0];
            insights.push({
              type: "ACCEPTED_PATTERN",
              title: "Most Applied Pattern",
              description: `You apply the "${topPattern[0]}" pattern most frequently.`,
              value: topPattern[0],
              unit: `${topPattern[1]} applications`,
              recommendation: `"${topPattern[0]}" is your go-to pattern. Explore related patterns in the Pattern Library — patterns that complement "${topPattern[0]}" can further improve your outputs. Check the 'prevents anti-patterns' field to understand what failure modes you're already avoiding.`,
              confidence: confidenceFromCount(patternApplyVersions.length),
              dataPoints: patternApplyVersions.length,
            });
          }
        }
      }

      // Sort by confidence (high first), then by dataPoints
      const sorted = insights
        .sort((a, b) => {
          const confOrder = { high: 3, medium: 2, low: 1 };
          const confDiff = confOrder[b.confidence] - confOrder[a.confidence];
          if (confDiff !== 0) return confDiff;
          return b.dataPoints - a.dataPoints;
        })
        .slice(0, limit);

      const dataQuality =
        sorted.filter((i) => i.confidence === "high").length >= 3
          ? "high"
          : sorted.filter((i) => i.confidence !== "low").length >= 2
          ? "medium"
          : "low";

      return {
        insights: sorted,
        dataQuality: dataQuality as "low" | "medium" | "high",
        totalSessions: userSessions.length,
      };
    }),
});
