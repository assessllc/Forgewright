/**
 * Client-side anti-pattern detection.
 * Runs regex-based rules against prompt text and returns detected issues.
 * Server-side LLM analysis is available for deeper detection.
 */

import type { DetectedAntiPattern } from "../../../shared/prompitect-types";

interface AntiPatternRule {
  slug: string;
  name: string;
  severity: "low" | "medium" | "high";
  description: string;
  detectionHint: string;
  remediation: string;
  fixedByPatterns: string[];
  patterns: RegExp[];
  checkFn?: (text: string) => boolean;
}

const RULES: AntiPatternRule[] = [
  {
    slug: "vague-verb",
    name: "Vague Action Verb",
    severity: "high",
    description: "Using action verbs like 'summarize', 'improve', 'analyze', or 'fix' without specifying what success looks like.",
    detectionHint: "Vague action verb detected without specification of success criteria or scope.",
    remediation: "Specify what success looks like: length, format, focus areas. 'Summarize' → 'Write a 3-sentence summary for a non-technical executive, focusing on business impact.'",
    fixedByPatterns: ["format-specification", "constraint-specification"],
    patterns: [
      /\b(summarize|improve|analyze|review|fix|enhance|optimize|update|check|evaluate)\b(?!.{0,60}(to|by|so that|in order to|such that|focusing on|specifically|for|into|as))/i,
    ],
  },
  {
    slug: "conflicting-instructions",
    name: "Conflicting Instructions",
    severity: "high",
    description: "Instructions that contradict each other, like 'brief but thorough' or 'formal but friendly'.",
    detectionHint: "Potentially conflicting instructions detected (e.g., brief + thorough, formal + casual).",
    remediation: "Choose one priority and specify it clearly, or specify the balance explicitly.",
    fixedByPatterns: ["constraint-specification", "format-specification"],
    patterns: [
      /\b(brief|concise|short)\b[\s\S]{0,100}\b(thorough|comprehensive|detailed|complete)\b/i,
      /\b(formal)\b[\s\S]{0,100}\b(casual|friendly|conversational)\b/i,
    ],
  },
  {
    slug: "excessive-politeness",
    name: "Excessive Politeness",
    severity: "low",
    description: "Padding prompts with excessive please/thank you or hedging language dilutes the signal.",
    detectionHint: "Excessive politeness detected. LLMs respond better to direct instructions.",
    remediation: "Use direct, imperative instructions. 'Summarize this document in 3 sentences.'",
    fixedByPatterns: ["constraint-specification"],
    patterns: [
      /\b(please|kindly|if you don't mind|if possible|when you get a chance|I was wondering if|I hope you don't mind)\b/i,
    ],
  },
  {
    slug: "hallucination-invitation",
    name: "Hallucination Invitation",
    severity: "high",
    description: "Asking for specific facts, statistics, or citations without providing source material.",
    detectionHint: "Request for specific facts or citations detected. Provide source material or instruct the model to acknowledge uncertainty.",
    remediation: "Either provide the source material in the prompt, or use the Knowledge Boundary Declaration pattern.",
    fixedByPatterns: ["knowledge-boundary", "context-priming"],
    patterns: [
      /\b(cite|citation|reference|source|statistic|percentage|study|research|according to|data shows)\b/i,
    ],
  },
  {
    slug: "role-mismatch",
    name: "Generic Role",
    severity: "medium",
    description: "Using a generic role like 'helpful assistant' provides no calibration benefit.",
    detectionHint: "Generic role detected. A more specific expert role would better calibrate the model.",
    remediation: "Match the role to the task domain: 'contracts attorney' for legal work, 'radiologist' for medical descriptions.",
    fixedByPatterns: ["role-prompting"],
    patterns: [
      /\b(helpful assistant|AI assistant|language model|chatbot|assistant)\b/i,
    ],
  },
  {
    slug: "token-waste",
    name: "Token-Inefficient Preamble",
    severity: "low",
    description: "Starting prompts with lengthy explanations of what you're about to ask wastes tokens.",
    detectionHint: "Prompt begins with preamble. Consider starting directly with the task or role.",
    remediation: "Start with the role or the task directly.",
    fixedByPatterns: ["role-prompting", "format-specification"],
    patterns: [
      /^(I would like you to|I want you to|I need you to|Could you please|I am going to ask you to|In this task, you will)/i,
    ],
  },
  {
    slug: "cot-on-reasoning-model",
    name: "Explicit CoT Instruction",
    severity: "medium",
    description: "Using 'think step by step' on reasoning models (o1, o3) interferes with their internal reasoning.",
    detectionHint: "Chain-of-thought instruction detected. If targeting a reasoning model (o1, o3), this may hurt performance.",
    remediation: "For reasoning models, omit CoT instructions entirely. Let the model's internal reasoning work.",
    fixedByPatterns: [],
    patterns: [
      /\b(think step by step|let's think|step by step|think through|reason through|show your work|show your reasoning)\b/i,
    ],
  },
  {
    slug: "no-format-for-code",
    name: "Code Without Language Specification",
    severity: "medium",
    description: "Requesting code without specifying the programming language.",
    detectionHint: "Code request without language specification detected.",
    remediation: "Specify language, version, framework, style guide, and whether tests are required.",
    fixedByPatterns: ["constraint-specification", "format-specification"],
    patterns: [
      /\b(write code|write a function|write a script|implement|create a program)\b(?!.{0,100}(in Python|in JavaScript|in TypeScript|in Java|in Go|in Rust|in C|using|with))/i,
    ],
  },
  {
    slug: "missing-domain-priors",
    name: "Missing Domain Safety Scaffolding",
    severity: "high",
    description: "Omitting domain-specific safety scaffolding for regulated domains (medical, legal, financial).",
    detectionHint: "Regulated domain detected. Ensure appropriate disclaimers and scope limitations are included.",
    remediation: "Apply the appropriate domain prior: medical → recommend consulting a doctor; legal → non-advice framing; financial → not-investment-advice.",
    fixedByPatterns: ["constitutional-prompting", "constraint-specification"],
    patterns: [
      /\b(medical|health|diagnosis|treatment|medication|legal|law|contract|financial|investment|advice)\b/i,
    ],
  },
  {
    slug: "passive-voice-instructions",
    name: "Passive Voice Instructions",
    severity: "low",
    description: "Writing instructions in passive voice obscures who should do what.",
    detectionHint: "Passive voice in instructions detected. Active voice is clearer for instruction-following.",
    remediation: "Rewrite in active imperative form: 'Summarize the document', not 'The document should be summarized'.",
    fixedByPatterns: ["constraint-specification"],
    patterns: [
      /\b(should be|must be|needs to be|has to be|ought to be)\b/i,
    ],
  },
  {
    slug: "xml-in-gpt",
    name: "XML Tags Detected",
    severity: "low",
    description: "XML tags are optimized for Claude. For GPT-4, markdown headers work better.",
    detectionHint: "XML tags detected. These are optimized for Claude. For GPT-4, consider markdown headers instead.",
    remediation: "For GPT-4: use markdown headers (## Context, ## Task). For Claude: XML tags are recommended.",
    fixedByPatterns: ["structured-output"],
    patterns: [
      /<[a-zA-Z_]+>[\s\S]*?<\/[a-zA-Z_]+>/,
    ],
  },
  {
    slug: "false-certainty",
    name: "False Certainty Request",
    severity: "high",
    description: "Asking for definitive answers on topics where uncertainty is appropriate.",
    detectionHint: "Request for definitive answer on potentially uncertain topic. Consider allowing the model to express uncertainty.",
    remediation: "Use the Knowledge Boundary Declaration pattern: explicitly allow the model to express uncertainty.",
    fixedByPatterns: ["knowledge-boundary"],
    patterns: [
      /\b(tell me exactly|give me the definitive|what is the correct|what is the right|what should I definitely)\b/i,
    ],
  },
];

/**
 * Run all client-side detection rules against prompt text.
 * Returns detected anti-patterns sorted by severity.
 */
export function detectAntiPatterns(text: string): DetectedAntiPattern[] {
  if (!text || text.trim().length < 10) return [];

  const detected: DetectedAntiPattern[] = [];

  for (const rule of RULES) {
    let matched = false;
    let matchedText: string | undefined;

    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        matched = true;
        matchedText = match[0];
        break;
      }
    }

    if (rule.checkFn && !matched) {
      matched = rule.checkFn(text);
    }

    if (matched) {
      detected.push({
        slug: rule.slug,
        name: rule.name,
        severity: rule.severity,
        description: rule.description,
        detectionHint: rule.detectionHint,
        remediation: rule.remediation,
        fixedByPatterns: rule.fixedByPatterns,
        matchedText,
      });
    }
  }

  // Sort: high → medium → low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return detected.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

/**
 * Get severity badge class for an anti-pattern severity.
 */
export function getSeverityClass(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "bg-destructive/15 text-destructive border border-destructive/20";
    case "medium":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/20";
    case "low":
      return "bg-muted text-muted-foreground border border-border";
  }
}
