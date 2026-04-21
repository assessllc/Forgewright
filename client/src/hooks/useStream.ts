/**
 * useStream — React hook for consuming Forgewright SSE streaming endpoints.
 *
 * Usage:
 *   const { stream, isStreaming, fullText, error } = useStream("/api/stream/discovery");
 *   await stream({ messages: [...] });
 *
 * The hook uses fetch + ReadableStream (not EventSource) so it works with POST bodies.
 * Each SSE event is: data: { type: "token"|"done"|"error", text?: string, fullText?: string, message?: string }
 */

import { useState, useCallback, useRef } from "react";

interface StreamEvent {
  type: "token" | "done" | "error";
  text?: string;
  fullText?: string;
  message?: string;
  /** Optional metadata returned with the done event (e.g. usage stats from test-prompt) */
  usage?: { inputTokens: number; outputTokens: number; model: string };
}

interface UseStreamOptions {
  onToken?: (token: string, accumulated: string) => void;
  onDone?: (fullText: string, meta?: { usage?: { inputTokens: number; outputTokens: number; model: string } }) => void;
  onError?: (message: string) => void;
}

interface UseStreamReturn {
  stream: (body: Record<string, unknown>) => Promise<string>;
  isStreaming: boolean;
  streamedText: string;
  error: string | null;
  reset: () => void;
}

export function useStream(endpoint: string, options: UseStreamOptions = {}): UseStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setStreamedText("");
    setError(null);
    setIsStreaming(false);
  }, []);

  const stream = useCallback(
    async (body: Record<string, unknown>): Promise<string> => {
      // Abort any in-flight stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setStreamedText("");
      setError(null);

      let accumulated = "";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "Request failed");
          throw new Error(errText);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const event = JSON.parse(jsonStr) as StreamEvent;

              if (event.type === "token" && event.text) {
                accumulated += event.text;
                setStreamedText(accumulated);
                options.onToken?.(event.text, accumulated);
              } else if (event.type === "done") {
                const finalText = event.fullText ?? accumulated;
                setStreamedText(finalText);
                options.onDone?.(finalText, event.usage ? { usage: event.usage } : undefined);
                setIsStreaming(false);
                return finalText;
              } else if (event.type === "error") {
                const errMsg = event.message ?? "Stream error";
                setError(errMsg);
                options.onError?.(errMsg);
                setIsStreaming(false);
                throw new Error(errMsg);
              }
            } catch (parseErr) {
              // Skip malformed events
            }
          }
        }

        // Stream ended without explicit done event
        setIsStreaming(false);
        return accumulated;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setIsStreaming(false);
          return accumulated;
        }
        const message = err instanceof Error ? err.message : "Unknown streaming error";
        setError(message);
        options.onError?.(message);
        setIsStreaming(false);
        throw err;
      }
    },
    [endpoint, options]
  );

  return { stream, isStreaming, streamedText, error, reset };
}
