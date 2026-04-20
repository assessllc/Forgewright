import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sessions } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const ScaffoldBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: z.string(),
  enabled: z.boolean(),
  source: z.enum(["user", "template", "discovery", "reverse"]),
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
          filename: `prompitect-${session.id}-${Date.now()}.json`,
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
        filename: `prompitect-${session.id}-${Date.now()}.md`,
      };
    }),
});
