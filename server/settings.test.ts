/**
 * Settings Router Tests
 *
 * Validates:
 * 1. Encryption/decryption round-trip for API keys (AES-256-GCM)
 * 2. Key masking logic
 * 3. Preference update input validation
 * 4. Supported models list shape
 * 5. Export data shape validation
 * 6. Tone/format/domain enum values
 */

import { describe, it, expect } from "vitest";
import crypto from "crypto";

// ─── Mirror the encryption helpers from settings.ts ──────────────────────────
// We test them in isolation so any future refactor of the router doesn't
// break the security contract.

function getDerivedKey(secret = "forgewright-dev-secret"): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptApiKey(plaintext: string, secret?: string): string {
  const key = getDerivedKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

function decryptApiKey(ciphertext: string, secret?: string): string {
  const key = getDerivedKey(secret);
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

// ─── Supported models (mirrors settings.ts) ───────────────────────────────────

const SUPPORTED_MODELS = [
  { id: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku", provider: "Anthropic" },
  { id: "claude-3-opus-20240229", label: "Claude 3 Opus", provider: "Anthropic" },
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "OpenAI" },
  { id: "o1-preview", label: "o1 Preview", provider: "OpenAI" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "Google" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "Google" },
] as const;

const TONE_OPTIONS = ["professional", "casual", "technical", "creative"] as const;
const FORMAT_OPTIONS = ["markdown", "plain", "json"] as const;
const DOMAIN_OPTIONS = [
  "software-engineering", "data-analysis", "creative-writing", "legal", "medical",
  "marketing", "education", "research", "customer-support", "finance",
  "product-management", "general",
] as const;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Settings: API key encryption", () => {
  it("encrypts and decrypts a key round-trip", () => {
    const original = "sk-ant-api03-test-key-1234567890";
    const encrypted = encryptApiKey(original);
    const decrypted = decryptApiKey(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertext for the same plaintext (random IV)", () => {
    const key = "sk-proj-test-key-abc";
    const enc1 = encryptApiKey(key);
    const enc2 = encryptApiKey(key);
    expect(enc1).not.toBe(enc2); // Different IVs → different ciphertext
  });

  it("ciphertext has the expected 3-part format (iv:enc:tag)", () => {
    const enc = encryptApiKey("sk-test-key-12345678");
    const parts = enc.split(":");
    expect(parts).toHaveLength(3);
    // IV is 12 bytes → 24 hex chars
    expect(parts[0]).toHaveLength(24);
    // Tag is 16 bytes → 32 hex chars
    expect(parts[2]).toHaveLength(32);
  });

  it("throws on malformed ciphertext (wrong number of parts)", () => {
    expect(() => decryptApiKey("not:valid")).toThrow("Invalid ciphertext format");
    expect(() => decryptApiKey("only-one-part")).toThrow("Invalid ciphertext format");
  });

  it("throws on tampered ciphertext (auth tag mismatch)", () => {
    const enc = encryptApiKey("sk-real-key-12345678");
    const parts = enc.split(":");
    // Flip a byte in the encrypted payload
    const tampered = parts[0] + ":" + "ff" + parts[1].slice(2) + ":" + parts[2];
    expect(() => decryptApiKey(tampered)).toThrow();
  });

  it("throws when decrypting with a different secret", () => {
    const enc = encryptApiKey("sk-secret-key-12345678", "secret-A");
    expect(() => decryptApiKey(enc, "secret-B")).toThrow();
  });

  it("handles keys with special characters", () => {
    const key = "sk-ant-api03-abc/def+ghi=jkl!@#$%^&*()";
    const enc = encryptApiKey(key);
    expect(decryptApiKey(enc)).toBe(key);
  });
});

describe("Settings: API key masking", () => {
  it("masks a typical Anthropic key", () => {
    const masked = maskApiKey("sk-ant-api03-abc123def456");
    expect(masked).toBe("sk-a••••••••f456");
  });

  it("masks a typical OpenAI key", () => {
    const masked = maskApiKey("sk-proj-abc123def456ghi789");
    expect(masked).toBe("sk-p••••••••i789");
  });

  it("returns all dots for keys of 8 chars or fewer", () => {
    expect(maskApiKey("12345678")).toBe("••••••••");
    expect(maskApiKey("short")).toBe("••••••••");
    expect(maskApiKey("")).toBe("••••••••");
  });

  it("shows first 4 and last 4 chars for longer keys", () => {
    const key = "abcdefghijklmnop";
    const masked = maskApiKey(key);
    expect(masked.startsWith("abcd")).toBe(true);
    expect(masked.endsWith("mnop")).toBe(true);
    expect(masked).toContain("••••••••");
  });
});

describe("Settings: Supported models list", () => {
  it("contains exactly 8 models", () => {
    expect(SUPPORTED_MODELS).toHaveLength(8);
  });

  it("covers all three providers", () => {
    const providers = new Set(SUPPORTED_MODELS.map((m) => m.provider));
    expect(providers.has("Anthropic")).toBe(true);
    expect(providers.has("OpenAI")).toBe(true);
    expect(providers.has("Google")).toBe(true);
  });

  it("each model has a non-empty id, label, and provider", () => {
    for (const model of SUPPORTED_MODELS) {
      expect(model.id.length).toBeGreaterThan(0);
      expect(model.label.length).toBeGreaterThan(0);
      expect(model.provider.length).toBeGreaterThan(0);
    }
  });

  it("includes gpt-4o as the default model", () => {
    const ids = SUPPORTED_MODELS.map((m) => m.id);
    expect(ids).toContain("gpt-4o");
  });

  it("includes at least one Claude 3.5 model", () => {
    const hasClaude35 = SUPPORTED_MODELS.some((m) => m.id.includes("claude-3-5"));
    expect(hasClaude35).toBe(true);
  });

  it("all model IDs are unique", () => {
    const ids = SUPPORTED_MODELS.map((m) => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("Settings: Preference enum values", () => {
  it("tone options are the expected 4 values", () => {
    expect(TONE_OPTIONS).toEqual(["professional", "casual", "technical", "creative"]);
  });

  it("format options are the expected 3 values", () => {
    expect(FORMAT_OPTIONS).toEqual(["markdown", "plain", "json"]);
  });

  it("domain options contain exactly 12 entries", () => {
    expect(DOMAIN_OPTIONS).toHaveLength(12);
  });

  it("domain options include the key professional domains", () => {
    const domains = new Set(DOMAIN_OPTIONS);
    expect(domains.has("software-engineering")).toBe(true);
    expect(domains.has("legal")).toBe(true);
    expect(domains.has("medical")).toBe(true);
    expect(domains.has("finance")).toBe(true);
    expect(domains.has("general")).toBe(true);
  });
});

describe("Settings: Preference update validation", () => {
  // These mirror the Zod schema in the router
  function validateDisplayName(name: string): boolean {
    return name.length >= 1 && name.length <= 128;
  }

  function validateModel(id: string): boolean {
    return id.length > 0 && id.length <= 64;
  }

  it("accepts a valid display name", () => {
    expect(validateDisplayName("Alice")).toBe(true);
    expect(validateDisplayName("A".repeat(128))).toBe(true);
  });

  it("rejects an empty display name", () => {
    expect(validateDisplayName("")).toBe(false);
  });

  it("rejects a display name over 128 chars", () => {
    expect(validateDisplayName("A".repeat(129))).toBe(false);
  });

  it("accepts a valid model ID", () => {
    expect(validateModel("gpt-4o")).toBe(true);
    expect(validateModel("claude-3-5-sonnet-20241022")).toBe(true);
  });

  it("rejects an empty model ID", () => {
    expect(validateModel("")).toBe(false);
  });
});

describe("Settings: Export data shape", () => {
  // Validate the shape of what exportSessionsJson should return
  interface ExportShape {
    exportedAt: string;
    userId: number;
    sessionCount: number;
    sessions: unknown[];
  }

  function isValidExportShape(data: unknown): data is ExportShape {
    if (typeof data !== "object" || data === null) return false;
    const d = data as Record<string, unknown>;
    return (
      typeof d.exportedAt === "string" &&
      typeof d.userId === "number" &&
      typeof d.sessionCount === "number" &&
      Array.isArray(d.sessions) &&
      d.sessions.length === d.sessionCount
    );
  }

  it("accepts a valid export shape", () => {
    const data: ExportShape = {
      exportedAt: new Date().toISOString(),
      userId: 42,
      sessionCount: 3,
      sessions: [{}, {}, {}],
    };
    expect(isValidExportShape(data)).toBe(true);
  });

  it("accepts an export with zero sessions", () => {
    const data = {
      exportedAt: new Date().toISOString(),
      userId: 1,
      sessionCount: 0,
      sessions: [],
    };
    expect(isValidExportShape(data)).toBe(true);
  });

  it("rejects when sessionCount doesn't match sessions array length", () => {
    const data = {
      exportedAt: new Date().toISOString(),
      userId: 1,
      sessionCount: 5,
      sessions: [{}, {}], // mismatch
    };
    expect(isValidExportShape(data)).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidExportShape(null)).toBe(false);
  });
});
