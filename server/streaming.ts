/**
 * SSE Streaming Module for Forgewright
 *
 * Provides a raw Express SSE endpoint that streams LLM responses token-by-token.
 * This bypasses tRPC (which buffers full responses) and uses the OpenAI-compatible
 * streaming API directly.
 *
 * Endpoints registered:
 *   POST /api/stream/discovery  — Discovery chat streaming
 *   POST /api/stream/reverse    — Reverse mode analysis streaming
 *
 * Protocol: text/event-stream, each event is `data: <json>\n\n`
 * Event types:
 *   { type: "token", text: string }         — incremental token
 *   { type: "done", fullText: string }      — stream complete
 *   { type: "error", message: string }      — error occurred
 */

import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DiscoveryStreamBody {
  messages: StreamMessage[];
  currentSpec?: Record<string, unknown>;
}

interface ReverseStreamBody {
  text: string;
}

interface DiagnoseStreamBody {
  outputText: string;
  promptText?: string;
}

interface CompareStreamBody {
  inputText: string;
  variantPrompt: string;
}

interface TestPromptStreamBody {
  /** The fully assembled prompt text to run against the model */
  promptText: string;
  /** Optional user-provided input to run the prompt against */
  userInput?: string;
  /** Target model identifier (from SUPPORTED_MODELS) */
  model?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveApiUrl(): string {
  const base = ENV.forgeApiUrl?.trim().replace(/\/$/, "");
  return base ? `${base}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
}

function sendSSE(res: Response, event: Record<string, unknown>): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

/**
 * Core streaming function: calls the OpenAI-compatible API with stream=true,
 * parses the SSE chunks, and forwards tokens to the client.
 */
async function streamLLM(
  res: Response,
  systemPrompt: string,
  userMessages: StreamMessage[]
): Promise<void> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...userMessages,
  ];

  const payload = {
    model: "gemini-2.5-flash",
    messages,
    stream: true,
    max_tokens: 4096,
  };

  let fetchResponse: globalThis.Response;
  try {
    fetchResponse = await fetch(resolveApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    sendSSE(res, { type: "error", message: "Failed to connect to LLM service" });
    res.end();
    return;
  }

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text().catch(() => "Unknown error");
    sendSSE(res, {
      type: "error",
      message: `LLM service error: ${fetchResponse.status} — ${errorText.slice(0, 200)}`,
    });
    res.end();
    return;
  }

  const reader = fetchResponse.body?.getReader();
  if (!reader) {
    sendSSE(res, { type: "error", message: "No response body from LLM service" });
    res.end();
    return;
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const chunk = JSON.parse(jsonStr) as {
            choices?: Array<{
              delta?: { content?: string };
              finish_reason?: string;
            }>;
          };
          const token = chunk.choices?.[0]?.delta?.content ?? "";
          if (token) {
            fullText += token;
            sendSSE(res, { type: "token", text: token });
          }
        } catch {
          // Malformed chunk — skip silently
        }
      }
    }
  } catch (err) {
    sendSSE(res, { type: "error", message: "Stream interrupted" });
    res.end();
    return;
  }

  sendSSE(res, { type: "done", fullText });
  res.end();
}

// ─── Discovery Chat Streaming ─────────────────────────────────────────────────

const DISCOVERY_SYSTEM_PROMPT = `You are a senior prompt engineer conducting a structured intake interview. Your goal is to extract the specification needed to build a high-quality LLM prompt.

Rules:
1. Ask ONE focused question per turn — the single question that most reduces uncertainty about the user's goal
2. Detect the domain from context (code, writing, data, legal, medical, marketing, etc.) and ask domain-appropriate follow-ups
3. Show smart defaults inline rather than asking about them — e.g., "I'll assume professional tone — correct me if not"
4. When you have enough to build a scaffold (completionScore ≥ 70), say so and offer to proceed
5. Keep responses concise — 2-4 sentences max
6. Never ask multiple questions in one turn

Respond in plain conversational text. Do not use markdown headers or bullet points in your reply.`;

async function handleDiscoveryStream(req: Request, res: Response): Promise<void> {
  const body = req.body as DiscoveryStreamBody;
  const messages = body.messages ?? [];

  if (!messages.length) {
    res.status(400).json({ error: "messages required" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const userMessages = messages.filter(
    (m): m is StreamMessage => m.role === "user" || m.role === "assistant"
  );

  await streamLLM(res, DISCOVERY_SYSTEM_PROMPT, userMessages);
}

// ─── Reverse Mode Analysis Streaming ─────────────────────────────────────────

const REVERSE_SYSTEM_PROMPT = `You are an expert prompt reverse-engineer. Given a piece of text produced by an LLM, analyze it to reconstruct the prompt that most likely generated it.

Analyze along these dimensions:
- tone: formal/informal/academic/conversational/technical/creative
- structure: how the content is organized (list, narrative, Q&A, step-by-step, etc.)
- impliedRole: what expert role the model was likely playing
- impliedAudience: who the output is written for
- domain: the subject domain (code, legal, medical, marketing, data, creative, etc.)
- taskType: what the model was asked to do (explain, generate, analyze, summarize, translate, etc.)
- keyPatterns: array of prompt patterns detected (chain-of-thought, role-prompting, few-shot, structured-output, etc.)
- suggestedBlocks: object with keys role, context, task, constraints, format, reasoning, output_validation — each a string with the reconstructed prompt block content

Respond ONLY with a valid JSON object matching this exact schema:
{
  "tone": string,
  "structure": string,
  "impliedRole": string,
  "impliedAudience": string,
  "domain": string,
  "taskType": string,
  "keyPatterns": string[],
  "suggestedBlocks": {
    "role": string,
    "context": string,
    "task": string,
    "constraints": string,
    "format": string,
    "reasoning": string,
    "output_validation": string
  }
}`;

async function handleReverseStream(req: Request, res: Response): Promise<void> {
  const body = req.body as ReverseStreamBody;
  const text = body.text?.trim();

  if (!text || text.length < 20) {
    res.status(400).json({ error: "text must be at least 20 characters" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const userMessages: StreamMessage[] = [
    {
      role: "user",
      content: `Analyze this text and reconstruct the prompt that produced it:\n\n${text}`,
    },
  ];

  await streamLLM(res, REVERSE_SYSTEM_PROMPT, userMessages);
}

// ─── Diagnose Output Streaming ───────────────────────────────────────────────

const DIAGNOSE_SYSTEM_PROMPT = `You are a senior prompt engineer specializing in output quality diagnosis.
You will be given an LLM output (and optionally the prompt that produced it).
Your task is to diagnose output quality failures using a structured analysis framework.

Analyze the output along these dimensions:
1. reasoning-drift: shallow reasoning, circular logic, false precision
2. hallucination: fabricated entities, temporal errors, invented citations
3. format-drift: length violations, structure violations, markdown bleed
4. persona-drift: role abandonment, tone inconsistency
5. scope-drift: scope creep, task underfulfillment
6. refusal-drift: overcautious refusal, caveat flooding
7. instruction-drift: instruction forgetting, constraint violation
8. output-quality: generic output, sycophantic agreement, confidence miscalibration
9. structural-drift: list flattening, context truncation
10. task-specific: code without explanation, translation register mismatch

For each detected failure, provide the exact failure mode slug, the specific text that triggered it, the affected scaffold block, and a concrete remediation.

Respond ONLY with a valid JSON object:
{
  "overallQuality": "good" | "acceptable" | "poor",
  "summary": "2-3 sentence plain English summary of the main issues",
  "driftMap": { "category-name": count },
  "issues": [
    {
      "id": "unique-id",
      "failureMode": "exact-slug",
      "category": "category-name",
      "severity": "low" | "medium" | "high",
      "title": "Short title",
      "explanation": "What specifically is wrong in this output",
      "affectedBlock": "role" | "context" | "task" | "constraints" | "format" | "reasoning" | "output_validation",
      "remediation": "Specific scaffold edit to fix this",
      "matchedText": "The specific text in the output that triggered this diagnosis"
    }
  ],
  "positives": ["What the output does well"]
}`;

async function handleDiagnoseStream(req: Request, res: Response): Promise<void> {
  const body = req.body as DiagnoseStreamBody;
  const outputText = body.outputText?.trim();
  if (!outputText || outputText.length < 20) {
    res.status(400).json({ error: "outputText must be at least 20 characters" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const contextSection = body.promptText
    ? `\n\nThe prompt that produced this output:\n<prompt>\n${body.promptText}\n</prompt>`
    : "";

  const userMessages: StreamMessage[] = [
    {
      role: "user",
      content: `Diagnose the quality failures in this LLM output:${contextSection}\n\n<output>\n${outputText}\n</output>`,
    },
  ];

  await streamLLM(res, DIAGNOSE_SYSTEM_PROMPT, userMessages);
}

// ─── Compare Variant Streaming ────────────────────────────────────────────────

async function handleCompareStream(req: Request, res: Response): Promise<void> {
  const body = req.body as CompareStreamBody;
  const inputText = body.inputText?.trim();
  const variantPrompt = body.variantPrompt?.trim();
  if (!inputText || !variantPrompt) {
    res.status(400).json({ error: "inputText and variantPrompt are required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // The variant prompt is the system prompt; inputText is the user message
  const userMessages: StreamMessage[] = [
    { role: "user", content: inputText },
  ];

  await streamLLM(res, variantPrompt, userMessages);
}

// ─── Test Prompt Streaming ───────────────────────────────────────────────────

/**
 * /api/stream/test-prompt
 *
 * Runs the assembled scaffold prompt against the selected model and streams
 * the output token-by-token back to the Scaffold Builder's inline output panel.
 *
 * The promptText is used as the system prompt. If userInput is provided, it
 * becomes the user turn; otherwise a minimal "Execute the above prompt." turn
 * is injected so the model has a user message to respond to.
 *
 * Returns usage metadata in the done event for accurate cost display:
 *   { type: "done", fullText, usage: { inputTokens, outputTokens, model } }
 */
async function handleTestPromptStream(req: Request, res: Response): Promise<void> {
  const body = req.body as TestPromptStreamBody;
  const promptText = body.promptText?.trim();

  if (!promptText || promptText.length < 10) {
    res.status(400).json({ error: "promptText must be at least 10 characters" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const userContent = body.userInput?.trim() || "Execute the above prompt and produce the output.";
  const userMessages: StreamMessage[] = [
    { role: "user", content: userContent },
  ];

  // Use the same streamLLM helper but capture usage for cost display.
  // We extend the done event with usage metadata so the client can show
  // actual (not estimated) token counts and cost.
  const messages = [
    { role: "system" as const, content: promptText },
    ...userMessages,
  ];

  const model = body.model ?? "gemini-2.5-flash";

  const payload = {
    model,
    messages,
    stream: true,
    max_tokens: 4096,
    stream_options: { include_usage: true },
  };

  let fetchResponse: globalThis.Response;
  try {
    fetchResponse = await fetch(resolveApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    sendSSE(res, { type: "error", message: "Failed to connect to LLM service" });
    res.end();
    return;
  }

  if (!fetchResponse.ok) {
    const errorText = await fetchResponse.text().catch(() => "Unknown error");
    sendSSE(res, {
      type: "error",
      message: `LLM service error: ${fetchResponse.status} — ${errorText.slice(0, 200)}`,
    });
    res.end();
    return;
  }

  const reader = fetchResponse.body?.getReader();
  if (!reader) {
    sendSSE(res, { type: "error", message: "No response body from LLM service" });
    res.end();
    return;
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";
  let inputTokens = 0;
  let outputTokens = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const chunk = JSON.parse(jsonStr) as {
            choices?: Array<{
              delta?: { content?: string };
              finish_reason?: string;
            }>;
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };

          const token = chunk.choices?.[0]?.delta?.content ?? "";
          if (token) {
            fullText += token;
            sendSSE(res, { type: "token", text: token });
          }

          // Capture usage if the provider returns it (some return in final chunk)
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? inputTokens;
            outputTokens = chunk.usage.completion_tokens ?? outputTokens;
          }
        } catch {
          // Malformed chunk — skip silently
        }
      }
    }
  } catch (err) {
    sendSSE(res, { type: "error", message: "Stream interrupted" });
    res.end();
    return;
  }

  sendSSE(res, {
    type: "done",
    fullText,
    usage: { inputTokens, outputTokens, model },
  });
  res.end();
}

// ─── Registration ─────────────────────────────────────────────────────────────

export function registerStreamingRoutes(app: Express): void {
  app.post("/api/stream/discovery", handleDiscoveryStream);
  app.post("/api/stream/reverse", handleReverseStream);
  app.post("/api/stream/diagnose", handleDiagnoseStream);
  app.post("/api/stream/compare", handleCompareStream);
  app.post("/api/stream/test-prompt", handleTestPromptStream);
}
