/**
 * SSE Streaming Module for Promptwright
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

// ─── Registration ─────────────────────────────────────────────────────────────

export function registerStreamingRoutes(app: Express): void {
  app.post("/api/stream/discovery", handleDiscoveryStream);
  app.post("/api/stream/reverse", handleReverseStream);
}
