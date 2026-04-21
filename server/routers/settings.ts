/**
 * Settings Router
 *
 * Handles user preferences, API key management, data export, and account operations.
 *
 * Security notes:
 * - API keys are encrypted with AES-256-GCM before storage using a key derived from JWT_SECRET.
 * - The raw key is NEVER returned to the client after storage — only a masked version.
 * - encryptedApiKeys column is excluded from all getPreferences responses.
 * - deleteAccount is a hard delete: user row + all sessions + all diagnoses.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, sessions, diagnoses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// ─── Encryption helpers ───────────────────────────────────────────────────────
// AES-256-GCM with a 32-byte key derived from JWT_SECRET via SHA-256.
// IV is random per encryption; stored as hex prefix: "<24-hex-iv>:<hex-ciphertext>:<32-hex-tag>"

function getDerivedKey(): Buffer {
  const secret = process.env.JWT_SECRET ?? "forgewright-dev-secret";
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptApiKey(plaintext: string): string {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

function decryptApiKey(ciphertext: string): string {
  const key = getDerivedKey();
  const parts = ciphertext.split(":");
  if (parts.length !== 3) throw new Error("Invalid ciphertext format");
  const [ivHex, encHex, tagHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString("utf8") + decipher.final("utf8");
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

// ─── Supported models list ────────────────────────────────────────────────────

export const SUPPORTED_MODELS = [
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "Anthropic" },
  { id: "claude-3-opus-20240229", label: "Claude 3 Opus", provider: "Anthropic" },
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { id: "o1-preview", label: "o1 Preview", provider: "OpenAI" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google" },
] as const;

export const TONE_OPTIONS = ["professional", "casual", "technical", "creative"] as const;
export const FORMAT_OPTIONS = ["markdown", "plain", "json"] as const;
export const DOMAIN_OPTIONS = [
  "software-engineering",
  "data-analysis",
  "creative-writing",
  "legal",
  "medical",
  "marketing",
  "education",
  "research",
  "customer-support",
  "finance",
  "product-management",
  "general",
] as const;

// ─── Router ───────────────────────────────────────────────────────────────────

export const settingsRouter = router({
  /**
   * Get the current user's preferences.
   * Returns all preference fields EXCEPT encryptedApiKeys (raw).
   * Returns masked API key indicators instead.
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        displayName: users.displayName,
        email: users.email,
        defaultModel: users.defaultModel,
        defaultTone: users.defaultTone,
        defaultDomain: users.defaultDomain,
        formatHabit: users.formatHabit,
        encryptedApiKeys: users.encryptedApiKeys,
        plan: users.plan,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    // Parse encrypted keys and return only masked versions
    let apiKeyStatus: { anthropic: boolean; openai: boolean; gemini: boolean } = {
      anthropic: false,
      openai: false,
      gemini: false,
    };

    if (user.encryptedApiKeys) {
      try {
        const parsed = JSON.parse(user.encryptedApiKeys) as Record<string, string>;
        apiKeyStatus = {
          anthropic: !!parsed.anthropic,
          openai: !!parsed.openai,
          gemini: !!parsed.gemini,
        };
      } catch {
        // malformed JSON — treat as no keys
      }
    }

    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      defaultModel: user.defaultModel ?? "gpt-4o",
      defaultTone: user.defaultTone ?? "professional",
      defaultDomain: user.defaultDomain ?? null,
      formatHabit: user.formatHabit ?? "markdown",
      apiKeyStatus,
      plan: user.plan ?? "free",
      createdAt: user.createdAt,
    };
  }),

  /**
   * Update user preferences (model, tone, format, domain, display name).
   * Does NOT touch API keys — use setApiKey/removeApiKey for those.
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(128).optional(),
        defaultModel: z.string().max(64).optional(),
        defaultTone: z.enum(TONE_OPTIONS).optional(),
        defaultDomain: z.enum(DOMAIN_OPTIONS).nullable().optional(),
        formatHabit: z.enum(FORMAT_OPTIONS).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const updates: Partial<typeof users.$inferInsert> = {};

      if (input.displayName !== undefined) updates.displayName = input.displayName;
      if (input.defaultModel !== undefined) updates.defaultModel = input.defaultModel;
      if (input.defaultTone !== undefined) updates.defaultTone = input.defaultTone;
      if (input.defaultDomain !== undefined) updates.defaultDomain = input.defaultDomain ?? undefined;
      if (input.formatHabit !== undefined) updates.formatHabit = input.formatHabit;

      if (Object.keys(updates).length === 0) {
        return { success: true };
      }

      await db.update(users).set(updates).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  /**
   * Store an encrypted API key for a specific provider.
   * The raw key is encrypted before storage and never returned.
   */
  setApiKey: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["anthropic", "openai", "gemini"]),
        apiKey: z.string().min(8).max(256),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Load existing keys
      const [user] = await db
        .select({ encryptedApiKeys: users.encryptedApiKeys })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      let keyMap: Record<string, string> = {};
      if (user?.encryptedApiKeys) {
        try {
          keyMap = JSON.parse(user.encryptedApiKeys);
        } catch {
          keyMap = {};
        }
      }

      // Encrypt and store
      keyMap[input.provider] = encryptApiKey(input.apiKey);
      await db
        .update(users)
        .set({ encryptedApiKeys: JSON.stringify(keyMap) })
        .where(eq(users.id, ctx.user.id));

      return { success: true, masked: maskApiKey(input.apiKey) };
    }),

  /**
   * Remove a stored API key for a specific provider.
   */
  removeApiKey: protectedProcedure
    .input(z.object({ provider: z.enum(["anthropic", "openai", "gemini"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [user] = await db
        .select({ encryptedApiKeys: users.encryptedApiKeys })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user?.encryptedApiKeys) return { success: true };

      let keyMap: Record<string, string> = {};
      try {
        keyMap = JSON.parse(user.encryptedApiKeys);
      } catch {
        return { success: true };
      }

      delete keyMap[input.provider];
      await db
        .update(users)
        .set({ encryptedApiKeys: JSON.stringify(keyMap) })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  /**
   * Export all sessions for the current user as a structured JSON array.
   * Each session includes its scaffold blocks, variants, and metadata.
   * The client is responsible for triggering the download.
   */
  exportSessionsJson: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, ctx.user.id))
      .orderBy(sessions.createdAt);

    return {
      exportedAt: new Date().toISOString(),
      userId: ctx.user.id,
      sessionCount: userSessions.length,
      sessions: userSessions,
    };
  }),

  /**
   * Export all sessions as Markdown — returns an array of { title, markdown } objects.
   * The client assembles them into a ZIP file using JSZip.
   */
  exportSessionsMarkdown: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, ctx.user.id))
      .orderBy(sessions.createdAt);

    const files = userSessions.map((s: typeof sessions.$inferSelect) => {
      const blocks = (s.scaffoldBlocks as Array<{ label: string; content: string }> | null) ?? [];
      const lines: string[] = [
        `# ${s.title}`,
        ``,
        `**Domain:** ${s.domain ?? "General"}  `,
        `**Model:** ${s.targetModel ?? "gpt-4o"}  `,
        `**Created:** ${s.createdAt.toISOString()}  `,
        ``,
        `---`,
        ``,
      ];

      for (const block of blocks) {
        if (block.content?.trim()) {
          lines.push(`## ${block.label}`, ``, block.content.trim(), ``);
        }
      }

      return {
        filename: `${s.id}-${s.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 48)}.md`,
        content: lines.join("\n"),
      };
    });

    return {
      exportedAt: new Date().toISOString(),
      fileCount: files.length,
      files,
    };
  }),

  /**
   * Permanently delete the current user's account and all associated data.
   * This is irreversible. The client must show a confirmation dialog before calling.
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const userId = ctx.user.id;

    // Delete in dependency order: diagnoses → sessions → user
    await db.delete(diagnoses).where(eq(diagnoses.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(users).where(eq(users.id, userId));

    return { success: true, message: "Account and all associated data deleted." };
  }),

  /**
   * Return the list of supported models for the model selector.
   */
  getSupportedModels: protectedProcedure.query(() => {
    return SUPPORTED_MODELS;
  }),
});
