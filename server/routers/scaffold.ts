import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const ScaffoldBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  content: z.string(),
  enabled: z.boolean(),
  source: z.enum(["user", "template", "discovery", "reverse", "pattern"]),
  sourceName: z.string().optional(),
  tokenCount: z.number().optional(),
});

export const scaffoldRouter = router({
  /**
   * Generate scaffold blocks from a plain-text description.
   * Returns all 8 blocks pre-populated based on the user's intent.
   */
  generateFromDescription: publicProcedure
    .input(
      z.object({
        description: z.string().min(1).max(4000),
        targetModel: z.string().default("gpt-4o"),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are a prompt engineering expert. Given a user's description of what they want a language model to do, generate a structured prompt scaffold with exactly these 8 labeled sections:

1. Role — The expert identity/persona the model should adopt
2. Context — Background information and situational context
3. Task — The specific action to perform (active, imperative verbs)
4. Constraints — What to avoid, format limits, hard boundaries
5. Examples — 1-2 concrete input/output examples (if applicable)
6. Format — Output structure specification
7. Reasoning — How to think through the problem (omit for o1/o3 models)
8. Output Validation — Self-check criteria before responding

Return a JSON object with this exact structure:
{
  "blocks": [
    { "id": "role", "label": "Role", "content": "...", "enabled": true, "source": "discovery" },
    { "id": "context", "label": "Context", "content": "...", "enabled": true, "source": "discovery" },
    { "id": "task", "label": "Task", "content": "...", "enabled": true, "source": "discovery" },
    { "id": "constraints", "label": "Constraints", "content": "...", "enabled": true, "source": "discovery" },
    { "id": "examples", "label": "Examples", "content": "...", "enabled": false, "source": "discovery" },
    { "id": "format", "label": "Format", "content": "...", "enabled": true, "source": "discovery" },
    { "id": "reasoning", "label": "Reasoning", "content": "...", "enabled": true, "source": "discovery" },
    { "id": "output_validation", "label": "Output Validation", "content": "...", "enabled": true, "source": "discovery" }
  ],
  "title": "A concise 3-7 word title for this prompt session",
  "domain": "The detected domain (e.g., software-engineering, creative-writing, data-analysis)"
}

Rules:
- Write content that is specific and actionable, not generic
- For the Examples block: only enable it if you can write a genuinely useful example
- For the Reasoning block: if the target model is o1 or o3, set enabled to false
- Target model: ${input.targetModel}
- Keep each block focused on its single responsibility
- Use the domain context to calibrate vocabulary and specificity`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a prompt scaffold for: ${input.description}${input.domain ? `\n\nDomain context: ${input.domain}` : ""}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "scaffold_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                blocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      label: { type: "string" },
                      content: { type: "string" },
                      enabled: { type: "boolean" },
                      source: { type: "string" },
                    },
                    required: ["id", "label", "content", "enabled", "source"],
                    additionalProperties: false,
                  },
                },
                title: { type: "string" },
                domain: { type: "string" },
              },
              required: ["blocks", "title", "domain"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new Error("No response from LLM");
      return JSON.parse(content) as {
        blocks: Array<{
          id: string;
          label: string;
          content: string;
          enabled: boolean;
          source: string;
        }>;
        title: string;
        domain: string;
      };
    }),

  /**
   * Generate 3 variants (Terse, Detailed, Chain-of-Thought) from scaffold blocks.
   */
  generateVariants: publicProcedure
    .input(
      z.object({
        blocks: z.array(ScaffoldBlockSchema),
        targetModel: z.string().default("gpt-4o"),
      })
    )
    .mutation(async ({ input }) => {
      const enabledBlocks = input.blocks.filter((b) => b.enabled && b.content);
      const scaffoldText = enabledBlocks
        .map((b) => `## ${b.label}\n${b.content}`)
        .join("\n\n");

      const systemPrompt = `You are a prompt engineering expert. Given a prompt scaffold, generate 3 variants optimized for different use cases.

Return a JSON object with this exact structure:
{
  "variants": [
    {
      "type": "Terse",
      "content": "...",
      "rationale": "..."
    },
    {
      "type": "Detailed", 
      "content": "...",
      "rationale": "..."
    },
    {
      "type": "Chain-of-Thought",
      "content": "...",
      "rationale": "..."
    }
  ]
}

Variant specifications:
- Terse: Compress to the minimum viable prompt. Remove all redundancy. Prioritize the Role and Task blocks. Target: 30-50% of original length. Best for: simple tasks, high-volume use, cost optimization.
- Detailed: Expand with additional context, more specific constraints, and richer examples. Add edge case handling. Target: 120-150% of original length. Best for: complex tasks, high-stakes outputs, one-shot use.
- Chain-of-Thought: Restructure to explicitly guide reasoning. Add step-by-step thinking instructions, intermediate checkpoints, and self-verification steps. Do NOT use this pattern for o1/o3 models. Best for: multi-step reasoning, math, analysis.

Target model: ${input.targetModel}
Important: Write the actual prompt content, not descriptions of what the prompt should contain.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate 3 variants for this scaffold:\n\n${scaffoldText}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "variants_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      content: { type: "string" },
                      rationale: { type: "string" },
                    },
                    required: ["type", "content", "rationale"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["variants"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent2 = response.choices[0]?.message?.content;
      const content = typeof rawContent2 === "string" ? rawContent2 : null;
      if (!content) throw new Error("No response from LLM");
      return JSON.parse(content) as {
        variants: Array<{ type: string; content: string; rationale: string }>;
      };
    }),

  /**
   * Get model-specific optimization hints for the current scaffold.
   */
  getModelHints: publicProcedure
    .input(
      z.object({
        blocks: z.array(ScaffoldBlockSchema),
        targetModel: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const enabledBlocks = input.blocks.filter((b) => b.enabled && b.content);
      const scaffoldText = enabledBlocks
        .map((b) => `## ${b.label}\n${b.content}`)
        .join("\n\n");

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a prompt engineering expert specializing in model-specific optimization. Analyze the prompt scaffold and provide 3-5 specific, actionable optimization hints for the target model. Return JSON: { "hints": [{ "title": "...", "description": "...", "blockId": "role|context|task|constraints|examples|format|reasoning|output_validation|null", "priority": "high|medium|low" }] }`,
          },
          {
            role: "user",
            content: `Target model: ${input.targetModel}\n\nScaffold:\n${scaffoldText}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "hints_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                hints: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      blockId: { type: "string" },
                      priority: { type: "string" },
                    },
                    required: ["title", "description", "blockId", "priority"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["hints"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent3 = response.choices[0]?.message?.content;
      const content = typeof rawContent3 === "string" ? rawContent3 : null;
      if (!content) throw new Error("No response from LLM");
      return JSON.parse(content) as {
        hints: Array<{
          title: string;
          description: string;
          blockId: string;
          priority: string;
        }>;
      };
    }),

  /**
   * Apply a named prompt pattern to an existing scaffold.
   * The LLM rewrites the affected blocks to incorporate the pattern while
   * preserving the user's original intent. Returns the updated blocks plus
   * a human-readable rationale explaining what changed and why.
   *
   * Grounded in: Anthropic prompting guide, Wei et al. CoT paper, ReAct paper,
   * Constitutional AI (Bai et al.), and OpenAI prompt engineering guide.
   */
  applyPattern: publicProcedure
    .input(
      z.object({
        patternSlug: z.string(),
        patternName: z.string(),
        patternDescription: z.string(),
        blocks: z.array(ScaffoldBlockSchema),
        targetModel: z.string().default("gpt-4o"),
      })
    )
    .mutation(async ({ input }) => {
      const enabledBlocks = input.blocks.filter((b) => b.enabled && b.content);
      const scaffoldText = enabledBlocks
        .map((b) => `## ${b.label}\n${b.content}`)
        .join("\n\n");

      const systemPrompt = `You are a prompt engineering expert. Apply the specified prompting pattern to the existing scaffold.

Pattern to apply: ${input.patternName}
Pattern description: ${input.patternDescription}

Rules:
1. Rewrite ONLY the blocks that need to change to incorporate the pattern
2. Preserve the user's original intent and domain context exactly
3. Keep unchanged blocks identical to the input — copy them verbatim
4. For Chain-of-Thought pattern: if target model is o1 or o3, do not modify the reasoning block
5. Be specific and actionable — write real prompt content, not meta-descriptions
6. Return a concise rationale (2-3 sentences) explaining what you changed and why
7. blocksModified must list only the block ids you actually changed

Target model: ${input.targetModel}

Return JSON with this exact structure:
{
  "blocks": [
    { "id": "role", "label": "Role", "content": "...", "enabled": true, "source": "user" },
    { "id": "context", "label": "Context", "content": "...", "enabled": true, "source": "user" },
    { "id": "task", "label": "Task", "content": "...", "enabled": true, "source": "user" },
    { "id": "constraints", "label": "Constraints", "content": "...", "enabled": true, "source": "user" },
    { "id": "examples", "label": "Examples", "content": "...", "enabled": false, "source": "user" },
    { "id": "format", "label": "Format", "content": "...", "enabled": true, "source": "user" },
    { "id": "reasoning", "label": "Reasoning", "content": "...", "enabled": true, "source": "user" },
    { "id": "output_validation", "label": "Output Validation", "content": "...", "enabled": true, "source": "user" }
  ],
  "rationale": "What changed and why, in 2-3 sentences.",
  "blocksModified": ["role", "task"]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Apply the ${input.patternName} pattern to this scaffold:\n\n${scaffoldText || "(empty scaffold — generate appropriate starter content for this pattern)"}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "apply_pattern_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                blocks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      label: { type: "string" },
                      content: { type: "string" },
                      enabled: { type: "boolean" },
                      source: { type: "string" },
                    },
                    required: ["id", "label", "content", "enabled", "source"],
                    additionalProperties: false,
                  },
                },
                rationale: { type: "string" },
                blocksModified: { type: "array", items: { type: "string" } },
              },
              required: ["blocks", "rationale", "blocksModified"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent4 = response.choices[0]?.message?.content;
      const content4 = typeof rawContent4 === "string" ? rawContent4 : null;
      if (!content4) throw new Error("No response from LLM");

      const parsed = JSON.parse(content4) as {
        blocks: Array<{
          id: string;
          label: string;
          content: string;
          enabled: boolean;
          source: string;
          sourceName?: string;
        }>;
        rationale: string;
        blocksModified: string[];
      };

      // Stamp provenance: blocks that were modified get source="pattern" and sourceName=patternName
      const modifiedSet = new Set(parsed.blocksModified);
      parsed.blocks = parsed.blocks.map((b) =>
        modifiedSet.has(b.id)
          ? { ...b, source: "pattern", sourceName: input.patternName }
          : b
      );

      return parsed;
    }),
});
