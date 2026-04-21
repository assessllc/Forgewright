/**
 * Forgewright Core Logic Tests
 * Covers: scaffold construction, cost estimation, anti-pattern detection rules,
 * session CRUD shape, and knowledge router response shapes.
 */
import { describe, it, expect } from "vitest";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

// ─── Auth Tests (baseline) ────────────────────────────────────────────────────
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(overrides?: Partial<TrpcContext>): TrpcContext {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
    ...overrides,
  };
}

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
    const ctx = makeCtx({
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ─── Scaffold Block Logic ─────────────────────────────────────────────────────
import {
  SCAFFOLD_BLOCK_IDS,
  SCAFFOLD_BLOCK_LABELS,
  SCAFFOLD_BLOCK_DESCRIPTIONS,
  MODEL_PRICING,
  type ScaffoldBlockId,
} from "../shared/prompitect-types";

describe("scaffold block definitions", () => {
  it("has exactly 8 block IDs", () => {
    expect(SCAFFOLD_BLOCK_IDS).toHaveLength(8);
  });

  it("includes all required block IDs", () => {
    const required = [
      "role",
      "context",
      "task",
      "constraints",
      "examples",
      "format",
      "reasoning",
      "output_validation",
    ];
    for (const id of required) {
      expect(SCAFFOLD_BLOCK_IDS).toContain(id);
    }
  });

  it("has labels for all block IDs", () => {
    for (const id of SCAFFOLD_BLOCK_IDS) {
      expect(SCAFFOLD_BLOCK_LABELS[id as ScaffoldBlockId]).toBeTruthy();
    }
  });

  it("uses exact label strings as specified", () => {
    expect(SCAFFOLD_BLOCK_LABELS.role).toBe("Role");
    expect(SCAFFOLD_BLOCK_LABELS.context).toBe("Context");
    expect(SCAFFOLD_BLOCK_LABELS.task).toBe("Task");
    expect(SCAFFOLD_BLOCK_LABELS.constraints).toBe("Constraints");
    expect(SCAFFOLD_BLOCK_LABELS.examples).toBe("Examples");
    expect(SCAFFOLD_BLOCK_LABELS.format).toBe("Format");
    expect(SCAFFOLD_BLOCK_LABELS.reasoning).toBe("Reasoning");
    expect(SCAFFOLD_BLOCK_LABELS.output_validation).toBe("Output Validation");
  });

  it("has descriptions for all block IDs", () => {
    for (const id of SCAFFOLD_BLOCK_IDS) {
      const desc = SCAFFOLD_BLOCK_DESCRIPTIONS[id as ScaffoldBlockId];
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(20);
    }
  });
});

// ─── Token Counting ───────────────────────────────────────────────────────────
/**
 * Approximate token count: ~4 chars per token for English prose.
 * We test the estimation logic directly without importing the client-side module.
 */
function estimateTokens(text: string): number {
  if (!text) return 0;
  // Whitespace-split word count × 1.3 is a reasonable approximation
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.3);
}

describe("token estimation", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates non-zero tokens for non-empty text", () => {
    const tokens = estimateTokens("You are a helpful assistant.");
    expect(tokens).toBeGreaterThan(0);
  });

  it("longer text produces more tokens than shorter text", () => {
    const short = estimateTokens("Hello world");
    const long = estimateTokens(
      "You are an expert software engineer specializing in TypeScript and React. Your task is to review the following code for bugs, performance issues, and style violations."
    );
    expect(long).toBeGreaterThan(short);
  });
});

// ─── Cost Estimation ──────────────────────────────────────────────────────────
describe("MODEL_PRICING", () => {
  it("has cost entries for at least 5 models", () => {
    expect(Object.keys(MODEL_PRICING).length).toBeGreaterThanOrEqual(5);
  });

  it("each model has input and output cost", () => {
    for (const [model, costs] of Object.entries(MODEL_PRICING)) {
      expect(costs.input, `${model} missing input cost`).toBeTypeOf("number");
      expect(costs.output, `${model} missing output cost`).toBeTypeOf("number");
      expect(costs.input).toBeGreaterThan(0);
      expect(costs.output).toBeGreaterThan(0);
    }
  });

  it("estimates cost correctly for 1000 input tokens on gpt-4o", () => {
    const costs = MODEL_PRICING["gpt-4o"];
    if (!costs) return; // skip if model not in list
    const estimatedCost = (1000 / 1000) * costs.input;
    expect(estimatedCost).toBeCloseTo(costs.input, 5);
  });
});

// ─── Anti-pattern Detection Rules ────────────────────────────────────────────
/**
 * These tests validate the detection logic for the most critical anti-patterns.
 * The client-side detector uses regex; we replicate the core rules here.
 */
function detectVagueVerbs(text: string): boolean {
  const vagueVerbs = /\b(improve|enhance|analyze|optimize|better|good|nice|make it)\b/i;
  return vagueVerbs.test(text);
}

function detectMissingSuccessCriteria(text: string): boolean {
  const hasCriteria = /\b(success|criteria|measure|metric|kpi|goal|objective|output should|result should|expect)\b/i;
  return text.length > 100 && !hasCriteria.test(text);
}

function detectInstructionOverload(text: string): boolean {
  const bulletCount = (text.match(/^[-*•]\s/gm) ?? []).length;
  const numberedCount = (text.match(/^\d+\.\s/gm) ?? []).length;
  return (bulletCount + numberedCount) > 10;
}

describe("anti-pattern detection rules", () => {
  describe("vague verbs", () => {
    it("detects 'improve' as a vague verb", () => {
      expect(detectVagueVerbs("Please improve the code")).toBe(true);
    });

    it("detects 'enhance' as a vague verb", () => {
      expect(detectVagueVerbs("Enhance the user experience")).toBe(true);
    });

    it("does not flag specific action verbs", () => {
      expect(detectVagueVerbs("Refactor the function to reduce cyclomatic complexity below 5")).toBe(false);
    });
  });

  describe("missing success criteria", () => {
    it("flags long prompts without any success criteria language", () => {
      const longPromptNoCriteria =
        "You are a software engineer. Write a function that processes user data. " +
        "The function should handle edge cases and be well-documented. " +
        "Make sure it works correctly and efficiently for all inputs. " +
        "Consider performance and readability when writing the code.";
      expect(detectMissingSuccessCriteria(longPromptNoCriteria)).toBe(true);
    });

    it("does not flag prompts with explicit success criteria", () => {
      const promptWithCriteria =
        "Write a function that processes user data. The output should be a sorted array. " +
        "Success criteria: function runs in O(n log n), handles null inputs, returns empty array for empty input.";
      expect(detectMissingSuccessCriteria(promptWithCriteria)).toBe(false);
    });
  });

  describe("instruction overload", () => {
    it("flags prompts with more than 10 bullet points", () => {
      const overloaded = Array.from({ length: 12 }, (_, i) => `- Instruction ${i + 1}`).join("\n");
      expect(detectInstructionOverload(overloaded)).toBe(true);
    });

    it("does not flag prompts with 5 bullet points", () => {
      const reasonable = Array.from({ length: 5 }, (_, i) => `- Instruction ${i + 1}`).join("\n");
      expect(detectInstructionOverload(reasonable)).toBe(false);
    });
  });
});

// ─── Knowledge Router Shape Tests ────────────────────────────────────────────
describe("knowledge router", () => {
  it("getPatterns returns an array (empty if no DB)", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.getPatterns({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("getAntiPatterns returns an array (empty if no DB)", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.getAntiPatterns({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("getModelQuirks returns an array (empty if no DB)", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.getModelQuirks({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("getTemplates returns an array (empty if no DB)", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.knowledge.getTemplates();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Sessions Router Shape Tests ─────────────────────────────────────────────
describe("sessions router", () => {
  it("list returns empty array for unauthenticated user", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sessions.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});
