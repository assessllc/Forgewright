// ─── Scaffold Block Types ────────────────────────────────────────────────────

export const SCAFFOLD_BLOCK_IDS = [
  "role",
  "context",
  "task",
  "constraints",
  "examples",
  "format",
  "reasoning",
  "output_validation",
] as const;

export type ScaffoldBlockId = (typeof SCAFFOLD_BLOCK_IDS)[number];

export const SCAFFOLD_BLOCK_LABELS: Record<ScaffoldBlockId, string> = {
  role: "Role",
  context: "Context",
  task: "Task",
  constraints: "Constraints",
  examples: "Examples",
  format: "Format",
  reasoning: "Reasoning",
  output_validation: "Output Validation",
};

export const SCAFFOLD_BLOCK_DESCRIPTIONS: Record<ScaffoldBlockId, string> = {
  role: "Define the expert identity, persona, or perspective the model should adopt. A specific role activates relevant knowledge clusters and calibrates vocabulary, tone, and epistemic standards.",
  context: "Provide the background information, situational context, and relevant facts the model needs. Good context prevents wrong assumptions and reduces hallucination.",
  task: "State the specific action to perform. Use active, imperative verbs with clear success criteria. Avoid vague verbs like 'improve' or 'analyze' without specification.",
  constraints: "Specify what to avoid, format limits, compliance requirements, and hard boundaries. Negative constraints often communicate requirements more precisely than positive instructions.",
  examples: "Provide 2–5 input/output examples demonstrating the desired format, style, and quality. Examples prime the model more reliably than written descriptions alone.",
  format: "Define the output structure: length, sections, headings, list vs prose, code blocks, tables. Explicit format prevents the model from choosing a structure that doesn't fit your use case.",
  reasoning: "Instruct the model on how to think through the problem: step-by-step, tree-of-thought, or specific reasoning frameworks. Omit for reasoning models (o1, o3) which handle this internally.",
  output_validation: "Specify criteria the model should use to self-check its output before responding. Reduces errors on high-stakes tasks without requiring a second API call.",
};

export interface ScaffoldBlock {
  id: ScaffoldBlockId;
  label: string;
  content: string;
  enabled: boolean;
  source: "user" | "template" | "discovery" | "reverse" | "pattern";
  /** Human-readable name of the pattern, template, or workflow that originated this block */
  sourceName?: string;
  tokenCount?: number;
}

// ─── Swarm Types ─────────────────────────────────────────────────────────────

export interface SwarmAgent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  inputFrom: string | string[];
  outputTo: string;
  handoffCondition: string;
}

export type SwarmTopology = "sequential" | "parallel" | "hub-spoke" | "hierarchical" | "iterative";

// ─── Model Types ─────────────────────────────────────────────────────────────

export const SUPPORTED_MODELS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-opus-20240229",
  "gpt-4o",
  "gpt-4o-mini",
  "o1",
  "gemini-1.5-pro",
  "llama-3-70b",
  "mistral-large",
] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

export const MODEL_DISPLAY_NAMES: Record<SupportedModel, string> = {
  "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
  "claude-3-opus-20240229": "Claude 3 Opus",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o mini",
  "o1": "o1",
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "llama-3-70b": "Llama 3 70B",
  "mistral-large": "Mistral Large",
};

export const MODEL_PROVIDERS: Record<SupportedModel, string> = {
  "claude-3-5-sonnet-20241022": "Anthropic",
  "claude-3-opus-20240229": "Anthropic",
  "gpt-4o": "OpenAI",
  "gpt-4o-mini": "OpenAI",
  "o1": "OpenAI",
  "gemini-1.5-pro": "Google",
  "llama-3-70b": "Meta",
  "mistral-large": "Mistral AI",
};

// Token pricing per 1K tokens (USD)
export const MODEL_PRICING: Record<SupportedModel, { input: number; output: number }> = {
  "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
  "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "o1": { input: 0.015, output: 0.06 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "llama-3-70b": { input: 0.0009, output: 0.0009 },
  "mistral-large": { input: 0.002, output: 0.006 },
};

// Context window sizes in tokens
export const MODEL_CONTEXT_WINDOWS: Record<SupportedModel, number> = {
  "claude-3-5-sonnet-20241022": 200000,
  "claude-3-opus-20240229": 200000,
  "gpt-4o": 128000,
  "gpt-4o-mini": 128000,
  "o1": 128000,
  "gemini-1.5-pro": 1000000,
  "llama-3-70b": 8192,
  "mistral-large": 32000,
};

// ─── Session Types ────────────────────────────────────────────────────────────

export interface PromptSession {
  id: number;
  title: string;
  targetModel: SupportedModel;
  blocks: ScaffoldBlock[];
  totalTokens: number;
  estimatedCost: number;
  mode: "discovery" | "direct" | "reverse";
  createdAt: Date;
  updatedAt: Date;
}

// ─── Variant Types ────────────────────────────────────────────────────────────

export const VARIANT_TYPES = ["Terse", "Detailed", "Chain-of-Thought"] as const;
export type VariantType = (typeof VARIANT_TYPES)[number];

export interface PromptVariant {
  type: VariantType;
  content: string;
  tokenCount: number;
  estimatedCost: number;
}

// ─── Anti-pattern Detection ───────────────────────────────────────────────────

export interface DetectedAntiPattern {
  slug: string;
  name: string;
  severity: "low" | "medium" | "high";
  description: string;
  detectionHint: string;
  remediation: string;
  fixedByPatterns: string[];
  matchedText?: string;
}

// ─── Discovery Types ──────────────────────────────────────────────────────────

export interface DiscoveryMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
}

export interface DiscoverySpec {
  domain?: string;
  role?: string;
  context?: string;
  task?: string;
  constraints?: string[];
  format?: string;
  audience?: string;
  targetModel?: SupportedModel;
  completionScore: number; // 0–100
}
