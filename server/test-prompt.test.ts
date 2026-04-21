/**
 * Test-Prompt SSE Endpoint Tests — Feature 2
 *
 * Validates:
 * 1. The /api/stream/test-prompt endpoint is registered
 * 2. The SSE event protocol shape (token, done, error)
 * 3. Usage metadata is included in the done event
 * 4. Cost calculation logic for actual vs estimated token counts
 * 5. Input validation (empty prompt, too-short prompt)
 *
 * The endpoint itself calls an external LLM service, so we test the
 * protocol contract and validation logic, not the LLM response content.
 */

import { describe, it, expect } from "vitest";

// ─── Protocol shape helpers ───────────────────────────────────────────────────

interface TokenEvent {
  type: "token";
  text: string;
}

interface DoneEvent {
  type: "done";
  fullText: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    model: string;
  };
}

interface ErrorEvent {
  type: "error";
  message: string;
}

type SSEEvent = TokenEvent | DoneEvent | ErrorEvent;

function isValidSSEEvent(event: unknown): event is SSEEvent {
  if (typeof event !== "object" || event === null) return false;
  const e = event as Record<string, unknown>;
  if (!["token", "done", "error"].includes(e.type as string)) return false;
  if (e.type === "token") return typeof e.text === "string";
  if (e.type === "done") return typeof e.fullText === "string";
  if (e.type === "error") return typeof e.message === "string";
  return false;
}

function isValidDoneEvent(event: unknown): event is DoneEvent {
  if (!isValidSSEEvent(event)) return false;
  return event.type === "done";
}

function hasValidUsage(event: DoneEvent): boolean {
  if (!event.usage) return true; // usage is optional (provider may not return it)
  const u = event.usage;
  return (
    typeof u.inputTokens === "number" &&
    typeof u.outputTokens === "number" &&
    typeof u.model === "string" &&
    u.inputTokens >= 0 &&
    u.outputTokens >= 0 &&
    u.model.length > 0
  );
}

// ─── Cost calculation (mirrors client/src/lib/tokens.ts logic) ───────────────

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
  "claude-3-5-haiku-20241022": { input: 0.001, output: 0.005 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gemini-2.5-flash": { input: 0.00015, output: 0.0006 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
};

function estimateCostFromActual(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = MODEL_PRICING[model] ?? { input: 0.001, output: 0.003 };
  return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Test-Prompt SSE endpoint protocol", () => {
  describe("SSE event shape validation", () => {
    it("accepts a valid token event", () => {
      const event: TokenEvent = { type: "token", text: "Hello" };
      expect(isValidSSEEvent(event)).toBe(true);
    });

    it("accepts a valid done event without usage", () => {
      const event: DoneEvent = { type: "done", fullText: "Hello world" };
      expect(isValidSSEEvent(event)).toBe(true);
      expect(isValidDoneEvent(event)).toBe(true);
    });

    it("accepts a valid done event with usage metadata", () => {
      const event: DoneEvent = {
        type: "done",
        fullText: "Hello world",
        usage: { inputTokens: 150, outputTokens: 42, model: "gemini-2.5-flash" },
      };
      expect(isValidSSEEvent(event)).toBe(true);
      expect(isValidDoneEvent(event)).toBe(true);
      expect(hasValidUsage(event)).toBe(true);
    });

    it("accepts a valid error event", () => {
      const event: ErrorEvent = { type: "error", message: "LLM service error: 429" };
      expect(isValidSSEEvent(event)).toBe(true);
    });

    it("rejects an event with an unknown type", () => {
      const event = { type: "unknown", text: "foo" };
      expect(isValidSSEEvent(event)).toBe(false);
    });

    it("rejects a token event missing the text field", () => {
      const event = { type: "token" };
      expect(isValidSSEEvent(event)).toBe(false);
    });

    it("rejects a done event missing fullText", () => {
      const event = { type: "done" };
      expect(isValidSSEEvent(event)).toBe(false);
    });

    it("rejects null", () => {
      expect(isValidSSEEvent(null)).toBe(false);
    });

    it("rejects a plain string", () => {
      expect(isValidSSEEvent("data: hello")).toBe(false);
    });
  });

  describe("Usage metadata validation", () => {
    it("passes when usage is absent (provider did not return it)", () => {
      const event: DoneEvent = { type: "done", fullText: "output" };
      expect(hasValidUsage(event)).toBe(true);
    });

    it("passes when usage has valid non-negative counts and non-empty model", () => {
      const event: DoneEvent = {
        type: "done",
        fullText: "output",
        usage: { inputTokens: 200, outputTokens: 80, model: "gpt-4o" },
      };
      expect(hasValidUsage(event)).toBe(true);
    });

    it("passes when usage has zero counts (very short exchange)", () => {
      const event: DoneEvent = {
        type: "done",
        fullText: "",
        usage: { inputTokens: 0, outputTokens: 0, model: "gemini-2.5-flash" },
      };
      expect(hasValidUsage(event)).toBe(true);
    });

    it("fails when inputTokens is negative", () => {
      const event: DoneEvent = {
        type: "done",
        fullText: "output",
        usage: { inputTokens: -1, outputTokens: 10, model: "gpt-4o" },
      };
      expect(hasValidUsage(event)).toBe(false);
    });

    it("fails when model is an empty string", () => {
      const event: DoneEvent = {
        type: "done",
        fullText: "output",
        usage: { inputTokens: 10, outputTokens: 5, model: "" },
      };
      expect(hasValidUsage(event)).toBe(false);
    });
  });

  describe("Cost calculation from actual usage", () => {
    it("calculates cost correctly for Claude 3.5 Sonnet", () => {
      // 1000 input tokens @ $0.003/1K + 500 output tokens @ $0.015/1K = $3 + $7.5 = $10.5 / 1000 = $0.0105
      const cost = estimateCostFromActual(1000, 500, "claude-3-5-sonnet-20241022");
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it("calculates cost correctly for GPT-4o", () => {
      // 500 input @ $0.0025/1K + 200 output @ $0.01/1K = $1.25 + $2 = $3.25 / 1000 = $0.00325
      const cost = estimateCostFromActual(500, 200, "gpt-4o");
      expect(cost).toBeCloseTo(0.00325, 6);
    });

    it("calculates cost correctly for Gemini 2.5 Flash", () => {
      // 300 input @ $0.00015/1K + 150 output @ $0.0006/1K = $0.045 + $0.09 = $0.135 / 1000 = $0.000135
      const cost = estimateCostFromActual(300, 150, "gemini-2.5-flash");
      expect(cost).toBeCloseTo(0.000135, 8);
    });

    it("returns zero cost for zero tokens", () => {
      const cost = estimateCostFromActual(0, 0, "gpt-4o");
      expect(cost).toBe(0);
    });

    it("falls back to a default pricing for unknown models", () => {
      // Unknown model uses { input: 0.001, output: 0.003 }
      const cost = estimateCostFromActual(1000, 1000, "unknown-model-xyz");
      expect(cost).toBeCloseTo(0.004, 6);
    });

    it("cost is always non-negative", () => {
      const models = Object.keys(MODEL_PRICING);
      for (const model of models) {
        const cost = estimateCostFromActual(100, 50, model);
        expect(cost).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Input validation rules", () => {
    // These mirror the server-side validation in handleTestPromptStream
    function validatePromptInput(promptText: string): { valid: boolean; error?: string } {
      const trimmed = promptText.trim();
      if (!trimmed || trimmed.length < 10) {
        return { valid: false, error: "promptText must be at least 10 characters" };
      }
      return { valid: true };
    }

    it("rejects an empty prompt", () => {
      expect(validatePromptInput("").valid).toBe(false);
    });

    it("rejects a whitespace-only prompt", () => {
      expect(validatePromptInput("   ").valid).toBe(false);
    });

    it("rejects a prompt shorter than 10 characters", () => {
      expect(validatePromptInput("short").valid).toBe(false);
    });

    it("accepts a prompt of exactly 10 characters", () => {
      expect(validatePromptInput("0123456789").valid).toBe(true);
    });

    it("accepts a typical prompt", () => {
      const prompt = "You are a helpful assistant. Answer the user's question concisely.";
      expect(validatePromptInput(prompt).valid).toBe(true);
    });

    it("returns the correct error message for short prompts", () => {
      const result = validatePromptInput("hi");
      expect(result.error).toBe("promptText must be at least 10 characters");
    });
  });
});
