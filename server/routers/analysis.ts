import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const analysisRouter = router({
  /**
   * Reverse mode: analyze example output and reconstruct the prompt that produced it.
   * Returns scaffold blocks pre-populated from the analysis.
   */
  reverseAnalyze: publicProcedure
    .input(
      z.object({
        exampleOutput: z.string().min(10).max(8000),
        targetModel: z.string().default("gpt-4o"),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are a prompt engineering expert performing reverse prompt engineering. Given an example output from a language model, analyze it and reconstruct the prompt scaffold that most likely produced it.

Analyze the output for:
1. Tone and register (formal/informal, technical/accessible)
2. Structural patterns (lists, headers, prose, code)
3. Implicit role/persona (what kind of expert wrote this?)
4. Implicit constraints (what was avoided? what format was enforced?)
5. Apparent audience (who was this written for?)
6. Domain and task type
7. Reasoning style (step-by-step, direct, analytical)

Return a JSON object with this exact structure:
{
  "analysis": {
    "tone": "...",
    "structure": "...",
    "impliedRole": "...",
    "impliedAudience": "...",
    "domain": "...",
    "taskType": "...",
    "keyPatterns": ["...", "..."]
  },
  "blocks": [
    { "id": "role", "label": "Role", "content": "...", "enabled": true, "source": "reverse" },
    { "id": "context", "label": "Context", "content": "...", "enabled": true, "source": "reverse" },
    { "id": "task", "label": "Task", "content": "...", "enabled": true, "source": "reverse" },
    { "id": "constraints", "label": "Constraints", "content": "...", "enabled": true, "source": "reverse" },
    { "id": "examples", "label": "Examples", "content": "", "enabled": false, "source": "reverse" },
    { "id": "format", "label": "Format", "content": "...", "enabled": true, "source": "reverse" },
    { "id": "reasoning", "label": "Reasoning", "content": "...", "enabled": true, "source": "reverse" },
    { "id": "output_validation", "label": "Output Validation", "content": "...", "enabled": false, "source": "reverse" }
  ],
  "title": "Reverse-engineered: [concise description]",
  "confidence": "high|medium|low",
  "confidenceNote": "Brief explanation of confidence level"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this example output and reconstruct the prompt scaffold:\n\n${input.exampleOutput}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "reverse_analysis_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                analysis: {
                  type: "object",
                  properties: {
                    tone: { type: "string" },
                    structure: { type: "string" },
                    impliedRole: { type: "string" },
                    impliedAudience: { type: "string" },
                    domain: { type: "string" },
                    taskType: { type: "string" },
                    keyPatterns: { type: "array", items: { type: "string" } },
                  },
                  required: ["tone", "structure", "impliedRole", "impliedAudience", "domain", "taskType", "keyPatterns"],
                  additionalProperties: false,
                },
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
                confidence: { type: "string" },
                confidenceNote: { type: "string" },
              },
              required: ["analysis", "blocks", "title", "confidence", "confidenceNote"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new Error("No response from LLM");
      return JSON.parse(content) as {
        analysis: {
          tone: string;
          structure: string;
          impliedRole: string;
          impliedAudience: string;
          domain: string;
          taskType: string;
          keyPatterns: string[];
        };
        blocks: Array<{
          id: string;
          label: string;
          content: string;
          enabled: boolean;
          source: string;
        }>;
        title: string;
        confidence: string;
        confidenceNote: string;
      };
    }),

  /**
   * Deep anti-pattern analysis using LLM (supplements client-side regex detection).
   */
  detectAntiPatterns: publicProcedure
    .input(
      z.object({
        promptText: z.string().min(10).max(8000),
        targetModel: z.string().default("gpt-4o"),
      })
    )
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a prompt engineering expert. Analyze the given prompt for anti-patterns and quality issues. Return JSON: { "issues": [{ "name": "...", "severity": "high|medium|low", "description": "...", "remediation": "...", "matchedText": "..." }] }. Focus on: vague verbs without success criteria, conflicting instructions, missing format specification, hallucination invitations, role-task mismatches, token inefficiency, and model-specific issues for ${input.targetModel}.`,
          },
          {
            role: "user",
            content: `Analyze this prompt:\n\n${input.promptText}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "antipattern_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                issues: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      severity: { type: "string" },
                      description: { type: "string" },
                      remediation: { type: "string" },
                      matchedText: { type: "string" },
                    },
                    required: ["name", "severity", "description", "remediation", "matchedText"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["issues"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new Error("No response from LLM");
      return JSON.parse(content) as {
        issues: Array<{
          name: string;
          severity: string;
          description: string;
          remediation: string;
          matchedText: string;
        }>;
      };
    }),

  /**
   * Discovery intake: process a user message and update the spec card.
   */
  discoveryChat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        currentSpec: z.record(z.string(), z.unknown()).optional(),
        domain: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const systemPrompt = `You are a prompt engineering intake specialist. Your job is to help users articulate exactly what they want a language model to do through a structured conversation.

Ask focused, specific questions to uncover:
- The exact task (what action should the model take?)
- The target audience (who will read the output?)
- The output format (length, structure, style)
- Any constraints or requirements
- The domain and context
- Success criteria (how will they know the output is good?)

Rules:
- Ask ONE question at a time
- Make questions specific and concrete
- Offer smart defaults when appropriate
- Detect the domain from context and apply domain-specific questions
- When you have enough information (completionScore >= 80), suggest moving to scaffold

Return JSON: {
  "message": "Your response to the user",
  "updatedSpec": {
    "domain": "...",
    "role": "...",
    "context": "...",
    "task": "...",
    "constraints": ["..."],
    "format": "...",
    "audience": "...",
    "completionScore": 0-100
  },
  "suggestScaffold": true/false
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "discovery_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
                updatedSpec: {
                  type: "object",
                  properties: {
                    domain: { type: "string" },
                    role: { type: "string" },
                    context: { type: "string" },
                    task: { type: "string" },
                    constraints: { type: "array", items: { type: "string" } },
                    format: { type: "string" },
                    audience: { type: "string" },
                    completionScore: { type: "number" },
                  },
                  required: ["domain", "role", "context", "task", "constraints", "format", "audience", "completionScore"],
                  additionalProperties: false,
                },
                suggestScaffold: { type: "boolean" },
              },
              required: ["message", "updatedSpec", "suggestScaffold"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : null;
      if (!content) throw new Error("No response from LLM");
      return JSON.parse(content) as {
        message: string;
        updatedSpec: {
          domain: string;
          role: string;
          context: string;
          task: string;
          constraints: string[];
          format: string;
          audience: string;
          completionScore: number;
        };
        suggestScaffold: boolean;
      };
    }),
});
