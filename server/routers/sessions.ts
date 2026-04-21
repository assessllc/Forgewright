import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sessions, scaffoldVersions } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { diffLines } from "diff";

const ScaffoldBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: z.string(),
  enabled: z.boolean(),
  source: z.enum(["user", "template", "discovery", "reverse", "pattern"]).optional(),
  sourceName: z.string().optional(),
  tokenCount: z.number().optional(),
});

function parseSession(r: typeof sessions.$inferSelect) {
  return {
    id: r.id,
    userId: r.userId,
    title: r.title,
    description: r.description,
    domain: r.domain,
    targetModel: r.targetModel ?? "gpt-4o",
    blocks: r.scaffoldBlocks
      ? (typeof r.scaffoldBlocks === "string"
          ? JSON.parse(r.scaffoldBlocks)
          : r.scaffoldBlocks)
      : [],
    variants: r.variants
      ? (typeof r.variants === "string" ? JSON.parse(r.variants) : r.variants)
      : null,
    totalTokens: r.totalTokenCount ?? 0,
    isReverseModeSession: r.isReverseModeSession ?? false,
    tags: r.tags
      ? (typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags)
      : [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// ─── Version Helpers ──────────────────────────────────────────────────────────

/**
 * Create a new scaffold version for a session.
 * All version-creating actions (pattern-apply, diagnosis, rollback, etc.) call this.
 * Uses full-snapshot strategy for correctness over delta storage.
 */
export async function createScaffoldVersion(
  sessionId: number,
  blocks: unknown[],
  createdBy: "user" | "diagnosis" | "pattern-apply" | "swarm-sync" | "discovery" | "reverse" | "rollback",
  changeSummary: string,
  parentVersionId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const existing = await db
    .select({ versionNumber: scaffoldVersions.versionNumber })
    .from(scaffoldVersions)
    .where(eq(scaffoldVersions.sessionId, sessionId))
    .orderBy(desc(scaffoldVersions.versionNumber))
    .limit(1);

  const nextVersionNumber = existing.length > 0 ? existing[0].versionNumber + 1 : 1;

  await db.insert(scaffoldVersions).values({
    sessionId,
    versionNumber: nextVersionNumber,
    fullSnapshot: blocks as Record<string, unknown>[],
    createdBy,
    changeSummary,
    parentVersionId: parentVersionId ?? null,
  });

  return nextVersionNumber;
}

/**
 * Compute a per-block diff between two snapshots using Myers diff algorithm.
 * Source: Myers, E.W. (1986). "An O(ND) difference algorithm and its variations."
 */
function computeBlockDiff(
  snapshotA: Array<{ id: string; content: string; enabled: boolean; label: string }>,
  snapshotB: Array<{ id: string; content: string; enabled: boolean; label: string }>
) {
  const allBlockIds = [
    ...Array.from(new Set([...snapshotA.map((b) => b.id), ...snapshotB.map((b) => b.id)])),
  ];

  const blockDiffs = allBlockIds.map((blockId) => {
    const blockA = snapshotA.find((b) => b.id === blockId);
    const blockB = snapshotB.find((b) => b.id === blockId);

    if (!blockA && blockB) {
      return {
        blockId,
        label: blockB.label,
        changeType: "added" as const,
        enabledChanged: false,
        enabledA: false,
        enabledB: blockB.enabled,
        lineChanges: blockB.content.split("\n").map((text, i) => ({
          type: "add" as const,
          lineNumber: i + 1,
          text,
        })),
      };
    }
    if (blockA && !blockB) {
      return {
        blockId,
        label: blockA.label,
        changeType: "removed" as const,
        enabledChanged: false,
        enabledA: blockA.enabled,
        enabledB: false,
        lineChanges: blockA.content.split("\n").map((text, i) => ({
          type: "remove" as const,
          lineNumber: i + 1,
          text,
        })),
      };
    }
    if (!blockA || !blockB) {
      return { blockId, label: "", changeType: "unchanged" as const, enabledChanged: false, enabledA: false, enabledB: false, lineChanges: [] };
    }

    const contentChanged = blockA.content !== blockB.content;
    const enabledChanged = blockA.enabled !== blockB.enabled;

    if (!contentChanged && !enabledChanged) {
      return {
        blockId,
        label: blockA.label,
        changeType: "unchanged" as const,
        enabledChanged: false,
        enabledA: blockA.enabled,
        enabledB: blockB.enabled,
        lineChanges: [],
      };
    }

    const lineDiffs = diffLines(blockA.content, blockB.content);
    const lineChanges: Array<{ type: "add" | "remove" | "context"; lineNumber: number; text: string }> = [];
    let lineNumber = 1;

    for (const part of lineDiffs) {
      const textLines = part.value.endsWith("\n")
        ? part.value.slice(0, -1).split("\n")
        : part.value.split("\n");
      for (const text of textLines) {
        if (part.added) {
          lineChanges.push({ type: "add", lineNumber, text });
          lineNumber++;
        } else if (part.removed) {
          lineChanges.push({ type: "remove", lineNumber, text });
        } else {
          lineChanges.push({ type: "context", lineNumber, text });
          lineNumber++;
        }
      }
    }

    return {
      blockId,
      label: blockA.label,
      changeType: "modified" as const,
      enabledChanged,
      enabledA: blockA.enabled,
      enabledB: blockB.enabled,
      lineChanges,
    };
  });

  const changedCount = blockDiffs.filter((b) => b.changeType !== "unchanged").length;
  return { blockDiffs, changedCount };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const sessionsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const userId = ctx.user?.id;
      if (!userId) return [];
      const rows = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId))
        .orderBy(desc(sessions.updatedAt))
        .limit(input.limit)
        .offset(input.offset);
      return rows.map(parseSession);
    }),

  get: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, input.id))
        .limit(1);
      if (!rows[0]) return null;
      return parseSession(rows[0]);
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        targetModel: z.string(),
        blocks: z.array(ScaffoldBlockSchema),
        mode: z.enum(["discovery", "direct", "reverse"]).default("direct"),
        totalTokens: z.number().default(0),
        domain: z.string().optional(),
        discoveryData: z.string().optional(),
        // Phase 6: version history
        createVersion: z.boolean().optional().default(true),
        changeSummary: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user?.id ?? null;
      const result = await db.insert(sessions).values({
        userId,
        title: input.title,
        targetModel: input.targetModel,
        domain: input.domain ?? null,
        scaffoldBlocks: JSON.stringify(input.blocks) as unknown as null,
        isReverseModeSession: input.mode === "reverse",
        totalTokenCount: input.totalTokens,
        specData: input.discoveryData
          ? (JSON.parse(input.discoveryData) as unknown as null)
          : null,
      });
      const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId ?? 0;

      // Create initial version snapshot
      if (input.createVersion && input.blocks.length > 0) {
        const createdBy = input.mode === "discovery" ? "discovery"
          : input.mode === "reverse" ? "reverse"
          : "user";
        await createScaffoldVersion(
          insertId,
          input.blocks,
          createdBy,
          input.changeSummary ?? "Initial scaffold created"
        );
      }

      return { id: insertId };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        targetModel: z.string().optional(),
        blocks: z.array(ScaffoldBlockSchema).optional(),
        variants: z.any().optional(),
        totalTokens: z.number().optional(),
        domain: z.string().optional(),
        // Phase 6: version history
        createVersion: z.boolean().optional().default(false),
        createdBy: z.enum(["user", "diagnosis", "pattern-apply", "swarm-sync", "discovery", "reverse", "rollback"]).optional().default("user"),
        changeSummary: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title !== undefined) updateData.title = input.title;
      if (input.targetModel !== undefined) updateData.targetModel = input.targetModel;
      if (input.blocks !== undefined) updateData.scaffoldBlocks = JSON.stringify(input.blocks);
      if (input.variants !== undefined) updateData.variants = JSON.stringify(input.variants);
      if (input.totalTokens !== undefined) updateData.totalTokenCount = input.totalTokens;
      if (input.domain !== undefined) updateData.domain = input.domain;
      await db.update(sessions).set(updateData).where(eq(sessions.id, input.id));

      // Create version snapshot if requested
      if (input.createVersion && input.blocks && input.blocks.length > 0) {
        await createScaffoldVersion(
          input.id,
          input.blocks,
          input.createdBy ?? "user",
          input.changeSummary ?? "Scaffold updated"
        );
      }

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(sessions).where(eq(sessions.id, input.id));
      return { success: true };
    }),

  export: publicProcedure
    .input(z.object({ id: z.number(), format: z.enum(["json", "markdown"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, input.id))
        .limit(1);
      if (!rows[0]) return null;
      const session = parseSession(rows[0]);

      if (input.format === "json") {
        return {
          format: "json" as const,
          content: JSON.stringify(session, null, 2),
          filename: `forgewright-${session.id}-${Date.now()}.json`,
        };
      }

      const blocks = session.blocks as Array<{
        id: string;
        label: string;
        content: string;
        enabled: boolean;
      }>;
      const md = [
        `# ${session.title}`,
        ``,
        `**Model:** ${session.targetModel}  `,
        `**Created:** ${new Date(session.createdAt).toISOString()}  `,
        `**Tokens:** ${session.totalTokens}`,
        ``,
        `---`,
        ``,
        ...blocks
          .filter((b) => b.enabled && b.content)
          .map((b) => `## ${b.label}\n\n${b.content}\n`),
      ].join("\n");

      return {
        format: "markdown" as const,
        content: md,
        filename: `forgewright-${session.id}-${Date.now()}.md`,
      };
    }),

  // ─── Phase 6: Version History ────────────────────────────────────────────────

  /**
   * List all versions for a session, newest first.
   * Returns metadata only — no full snapshots (use getVersion for that).
   */
  listVersions: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select({
          id: scaffoldVersions.id,
          sessionId: scaffoldVersions.sessionId,
          versionNumber: scaffoldVersions.versionNumber,
          createdBy: scaffoldVersions.createdBy,
          changeSummary: scaffoldVersions.changeSummary,
          parentVersionId: scaffoldVersions.parentVersionId,
          createdAt: scaffoldVersions.createdAt,
        })
        .from(scaffoldVersions)
        .where(eq(scaffoldVersions.sessionId, input.sessionId))
        .orderBy(desc(scaffoldVersions.versionNumber));
    }),

  /**
   * Get a specific version's full snapshot.
   */
  getVersion: publicProcedure
    .input(z.object({ sessionId: z.number(), versionNumber: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(scaffoldVersions)
        .where(
          and(
            eq(scaffoldVersions.sessionId, input.sessionId),
            eq(scaffoldVersions.versionNumber, input.versionNumber)
          )
        )
        .limit(1);
      if (!rows[0]) return null;
      return rows[0];
    }),

  /**
   * Compute a Myers diff between two versions of a session.
   * Returns per-block diff with line-level add/remove/context annotations.
   */
  diffVersions: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        versionA: z.number(),
        versionB: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const [rowsA, rowsB] = await Promise.all([
        db
          .select()
          .from(scaffoldVersions)
          .where(
            and(
              eq(scaffoldVersions.sessionId, input.sessionId),
              eq(scaffoldVersions.versionNumber, input.versionA)
            )
          )
          .limit(1),
        db
          .select()
          .from(scaffoldVersions)
          .where(
            and(
              eq(scaffoldVersions.sessionId, input.sessionId),
              eq(scaffoldVersions.versionNumber, input.versionB)
            )
          )
          .limit(1),
      ]);

      if (!rowsA[0] || !rowsB[0]) throw new Error("One or both versions not found");

      const snapshotA = rowsA[0].fullSnapshot as Array<{ id: string; content: string; enabled: boolean; label: string }>;
      const snapshotB = rowsB[0].fullSnapshot as Array<{ id: string; content: string; enabled: boolean; label: string }>;

      return computeBlockDiff(snapshotA, snapshotB);
    }),

  /**
   * Roll back a session to a prior version.
   * Creates a NEW version (never mutates history) with createdBy: "rollback".
   * Preserves the full audit trail.
   */
  rollbackToVersion: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        versionNumber: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const rows = await db
        .select()
        .from(scaffoldVersions)
        .where(
          and(
            eq(scaffoldVersions.sessionId, input.sessionId),
            eq(scaffoldVersions.versionNumber, input.versionNumber)
          )
        )
        .limit(1);

      if (!rows[0]) throw new Error("Target version not found");

      const snapshot = rows[0].fullSnapshot as unknown[];

      const newVersionNumber = await createScaffoldVersion(
        input.sessionId,
        snapshot,
        "rollback",
        `Rolled back to version ${input.versionNumber}`,
        rows[0].id
      );

      // Update the live session to match the rolled-back snapshot
      await db
        .update(sessions)
        .set({
          scaffoldBlocks: JSON.stringify(snapshot),
          updatedAt: new Date(),
        })
        .where(eq(sessions.id, input.sessionId));

      return { newVersionNumber, restoredFromVersion: input.versionNumber };
    }),
});
