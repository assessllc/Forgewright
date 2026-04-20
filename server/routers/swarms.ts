/**
 * server/routers/swarms.ts
 * tRPC procedures for user-built custom swarm configurations.
 *
 * Procedures:
 *   list         — list the current user's saved swarms (protected)
 *   get          — get a single swarm by id (protected, ownership enforced)
 *   create       — create a new custom swarm (protected)
 *   update       — update an existing swarm (protected, ownership enforced)
 *   delete       — delete a swarm (protected, ownership enforced)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { customSwarms } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import type { SwarmAgent, SwarmTopology } from "../../shared/prompitect-types";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const CustomSwarmAgentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Agent name is required"),
  role: z.string().min(1, "Agent role is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  inputFrom: z.union([z.string(), z.array(z.string())]),
  outputTo: z.string(),
  handoffCondition: z.string(),
  // Optional: slug of the example_prompt this agent's system prompt was seeded from
  sourceExampleSlug: z.string().optional(),
  // Optional: title of the source example for display
  sourceExampleTitle: z.string().optional(),
});

const TopologyEnum = z.enum(["sequential", "parallel", "hub-spoke", "hierarchical", "iterative"]);

const CreateSwarmInput = z.object({
  name: z.string().min(1, "Swarm name is required").max(256),
  description: z.string().optional(),
  goal: z.string().optional(),
  topology: TopologyEnum,
  agents: z.array(CustomSwarmAgentSchema).min(1, "At least one agent is required"),
  compatiblePlatforms: z.array(z.string()).optional(),
});

const UpdateSwarmInput = CreateSwarmInput.extend({
  id: z.number().int().positive(),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function safeJson<T>(val: unknown): T {
  if (typeof val === "string") {
    try { return JSON.parse(val) as T; } catch { return [] as unknown as T; }
  }
  return (val ?? []) as T;
}

// ── Router ────────────────────────────────────────────────────────────────────

export const swarmsRouter = router({

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(customSwarms)
        .where(eq(customSwarms.userId, ctx.user.id))
        .orderBy(desc(customSwarms.updatedAt));
      return rows.map((r) => ({
        ...r,
        agents: safeJson<SwarmAgent[]>(r.agents),
        compatiblePlatforms: safeJson<string[]>(r.compatiblePlatforms),
      }));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const rows = await db
        .select()
        .from(customSwarms)
        .where(and(eq(customSwarms.id, input.id), eq(customSwarms.userId, ctx.user.id)));
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Swarm not found" });
      const r = rows[0];
      return {
        ...r,
        agents: safeJson<SwarmAgent[]>(r.agents),
        compatiblePlatforms: safeJson<string[]>(r.compatiblePlatforms),
      };
    }),

  create: protectedProcedure
    .input(CreateSwarmInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const result = await db.insert(customSwarms).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description ?? null,
        goal: input.goal ?? null,
        topology: input.topology as SwarmTopology,
        agents: JSON.stringify(input.agents),
        agentCount: input.agents.length,
        compatiblePlatforms: JSON.stringify(input.compatiblePlatforms ?? ["Manus"]),
      });
      const insertId = (result[0] as { insertId?: number })?.insertId ?? 0;
      return { id: insertId, success: true };
    }),

  update: protectedProcedure
    .input(UpdateSwarmInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      // Ownership check
      const existing = await db
        .select({ id: customSwarms.id })
        .from(customSwarms)
        .where(and(eq(customSwarms.id, input.id), eq(customSwarms.userId, ctx.user.id)));
      if (!existing.length) throw new TRPCError({ code: "NOT_FOUND", message: "Swarm not found" });
      await db
        .update(customSwarms)
        .set({
          name: input.name,
          description: input.description ?? null,
          goal: input.goal ?? null,
          topology: input.topology as SwarmTopology,
          agents: JSON.stringify(input.agents),
          agentCount: input.agents.length,
          compatiblePlatforms: JSON.stringify(input.compatiblePlatforms ?? ["Manus"]),
        })
        .where(eq(customSwarms.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const existing = await db
        .select({ id: customSwarms.id })
        .from(customSwarms)
        .where(and(eq(customSwarms.id, input.id), eq(customSwarms.userId, ctx.user.id)));
      if (!existing.length) throw new TRPCError({ code: "NOT_FOUND", message: "Swarm not found" });
      await db.delete(customSwarms).where(eq(customSwarms.id, input.id));
      return { success: true };
    }),
});
