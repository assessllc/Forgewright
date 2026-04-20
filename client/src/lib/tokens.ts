/**
 * Client-side token estimation utilities.
 *
 * Uses the standard approximation of ~4 characters per token for English text,
 * which is accurate to within ~10% for most LLM tokenizers (GPT, Claude, Gemini).
 * For precise counts, use the server-side tiktoken endpoint.
 */

import {
  MODEL_PRICING,
  MODEL_CONTEXT_WINDOWS,
  type SupportedModel,
} from "../../../shared/prompitect-types";

/**
 * Estimate token count from text using the 4-chars-per-token heuristic.
 * Accurate to ±10% for English prose; less accurate for code and non-English text.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // More accurate: count words * 1.3 + punctuation
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  // Blend word-based and char-based estimates
  return Math.ceil((words * 1.3 + chars / 4) / 2);
}

/**
 * Calculate estimated cost for a prompt given model and token counts.
 * Returns cost in USD.
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: SupportedModel
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  return (
    (inputTokens / 1000) * pricing.input +
    (outputTokens / 1000) * pricing.output
  );
}

/**
 * Format a cost value as a human-readable string.
 */
export function formatCost(costUsd: number): string {
  if (costUsd < 0.0001) return "< $0.0001";
  if (costUsd < 0.01) return `$${costUsd.toFixed(4)}`;
  return `$${costUsd.toFixed(3)}`;
}

/**
 * Format a token count with K abbreviation for large numbers.
 */
export function formatTokens(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Get context window utilization as a percentage.
 */
export function getContextUtilization(
  tokenCount: number,
  model: SupportedModel
): number {
  const windowSize = MODEL_CONTEXT_WINDOWS[model];
  if (!windowSize) return 0;
  return Math.min(100, (tokenCount / windowSize) * 100);
}

/**
 * Get a color class for context utilization.
 */
export function getUtilizationColor(utilization: number): string {
  if (utilization > 80) return "text-destructive";
  if (utilization > 60) return "text-warning";
  return "text-muted-foreground";
}
