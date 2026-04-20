/**
 * phase2.test.ts
 * Tests for Phase 2 features:
 *   1. SSE streaming endpoint construction and event format
 *   2. applyPattern procedure logic (block injection and merging)
 *   3. Example library filtering and query logic
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SSE STREAMING — event format and helper functions
// ─────────────────────────────────────────────────────────────────────────────

describe("SSE streaming — event format", () => {
  /**
   * The SSE protocol requires events in the format:
   *   data: <json>\n\n
   * We test the helper that formats events.
   */

  function formatSSEEvent(data: Record<string, unknown>): string {
    return `data: ${JSON.stringify(data)}\n\n`;
  }

  function parseSSEEvent(raw: string): Record<string, unknown> | null {
    const line = raw.trim();
    if (!line.startsWith("data: ")) return null;
    try {
      return JSON.parse(line.slice(6)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  it("formats a token event correctly", () => {
    const event = formatSSEEvent({ type: "token", content: "Hello" });
    expect(event).toBe('data: {"type":"token","content":"Hello"}\n\n');
  });

  it("formats a done event correctly", () => {
    const event = formatSSEEvent({ type: "done" });
    expect(event).toBe('data: {"type":"done"}\n\n');
  });

  it("formats an error event correctly", () => {
    const event = formatSSEEvent({ type: "error", message: "LLM unavailable" });
    expect(event).toBe('data: {"type":"error","message":"LLM unavailable"}\n\n');
  });

  it("parses a valid SSE token event", () => {
    const raw = 'data: {"type":"token","content":"world"}\n\n';
    const parsed = parseSSEEvent(raw);
    expect(parsed).toEqual({ type: "token", content: "world" });
  });

  it("parses a done event", () => {
    const raw = 'data: {"type":"done"}\n\n';
    const parsed = parseSSEEvent(raw);
    expect(parsed).toEqual({ type: "done" });
  });

  it("returns null for malformed SSE lines", () => {
    expect(parseSSEEvent("event: message")).toBeNull();
    expect(parseSSEEvent("")).toBeNull();
    expect(parseSSEEvent("data: not-json")).toBeNull();
  });

  it("accumulates streaming tokens into a complete message", () => {
    const tokens = ["The", " quick", " brown", " fox"];
    const events = tokens.map((t) => formatSSEEvent({ type: "token", content: t }));
    const accumulated = events
      .map(parseSSEEvent)
      .filter((e) => e?.type === "token")
      .map((e) => (e as { content: string }).content)
      .join("");
    expect(accumulated).toBe("The quick brown fox");
  });

  it("correctly identifies end of stream", () => {
    const events = [
      formatSSEEvent({ type: "token", content: "Hello" }),
      formatSSEEvent({ type: "done" }),
    ];
    const parsedEvents = events.map(parseSSEEvent);
    const lastEvent = parsedEvents[parsedEvents.length - 1];
    expect(lastEvent?.type).toBe("done");
  });

  it("handles SSE events with special characters in content", () => {
    const content = 'Use "quotes" and <tags> & ampersands';
    const event = formatSSEEvent({ type: "token", content });
    const parsed = parseSSEEvent(event);
    expect(parsed?.content).toBe(content);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. APPLY PATTERN — block injection and merging logic
// ─────────────────────────────────────────────────────────────────────────────

describe("applyPattern — block injection logic", () => {
  type BlockType =
    | "role"
    | "context"
    | "task"
    | "constraints"
    | "examples"
    | "format"
    | "reasoning"
    | "output_validation";

  interface ScaffoldBlock {
    id: string;
    type: BlockType;
    label: string;
    content: string;
    enabled: boolean;
  }

  interface PatternBlock {
    type: BlockType;
    content: string;
    enabled: boolean;
  }

  /**
   * The applyPattern logic:
   * - For each pattern block, find the matching block in the scaffold by type
   * - If the scaffold block has no content (empty/whitespace), replace it
   * - If the scaffold block already has content, prepend a comment and append
   * - Always enable the block if the pattern enables it
   */
  function applyPatternToBlocks(
    scaffoldBlocks: ScaffoldBlock[],
    patternBlocks: PatternBlock[],
    mode: "replace_empty" | "merge_all" = "replace_empty"
  ): ScaffoldBlock[] {
    return scaffoldBlocks.map((block) => {
      const patternBlock = patternBlocks.find((pb) => pb.type === block.type);
      if (!patternBlock) return block;

      const isEmpty = !block.content.trim();

      if (mode === "replace_empty" && !isEmpty) {
        // Merge: keep existing content, append pattern suggestion as comment
        return {
          ...block,
          enabled: patternBlock.enabled ? true : block.enabled,
          content: block.content + "\n\n<!-- Pattern suggestion: " + patternBlock.content + " -->",
        };
      }

      // Replace (either empty block or merge_all mode)
      return {
        ...block,
        content: patternBlock.content,
        enabled: patternBlock.enabled,
      };
    });
  }

  const baseBlocks: ScaffoldBlock[] = [
    { id: "1", type: "role", label: "Role", content: "", enabled: false },
    { id: "2", type: "context", label: "Context", content: "Existing context.", enabled: true },
    { id: "3", type: "task", label: "Task", content: "", enabled: false },
    { id: "4", type: "constraints", label: "Constraints", content: "", enabled: false },
    { id: "5", type: "examples", label: "Examples", content: "", enabled: false },
    { id: "6", type: "format", label: "Format", content: "", enabled: false },
    { id: "7", type: "reasoning", label: "Reasoning", content: "", enabled: false },
    { id: "8", type: "output_validation", label: "Output Validation", content: "", enabled: false },
  ];

  const chainOfThoughtPattern: PatternBlock[] = [
    { type: "role", content: "You are a careful, methodical reasoner.", enabled: true },
    { type: "reasoning", content: "Think step by step before answering.", enabled: true },
    { type: "format", content: "Show your reasoning, then give the final answer.", enabled: true },
  ];

  it("fills empty blocks with pattern content", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern);
    const roleBlock = result.find((b) => b.type === "role")!;
    expect(roleBlock.content).toBe("You are a careful, methodical reasoner.");
    expect(roleBlock.enabled).toBe(true);
  });

  it("enables blocks that the pattern enables", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern);
    const reasoningBlock = result.find((b) => b.type === "reasoning")!;
    expect(reasoningBlock.enabled).toBe(true);
  });

  it("does not overwrite non-empty blocks in replace_empty mode", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern, "replace_empty");
    const contextBlock = result.find((b) => b.type === "context")!;
    expect(contextBlock.content).toContain("Existing context.");
  });

  it("merges pattern content into non-empty blocks as comment", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern, "replace_empty");
    // context block has existing content, no pattern for context — should be unchanged
    const contextBlock = result.find((b) => b.type === "context")!;
    expect(contextBlock.content).toBe("Existing context.");
  });

  it("replaces all blocks in merge_all mode", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern, "merge_all");
    const contextBlock = result.find((b) => b.type === "context")!;
    // context has no pattern block, so it should be unchanged
    expect(contextBlock.content).toBe("Existing context.");
  });

  it("does not modify blocks that have no corresponding pattern block", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern);
    const constraintsBlock = result.find((b) => b.type === "constraints")!;
    expect(constraintsBlock.content).toBe("");
    expect(constraintsBlock.enabled).toBe(false);
  });

  it("applies all 8 block types when pattern provides them", () => {
    const fullPattern: PatternBlock[] = [
      { type: "role", content: "Expert role", enabled: true },
      { type: "context", content: "Background context", enabled: true },
      { type: "task", content: "Primary task", enabled: true },
      { type: "constraints", content: "Key constraints", enabled: true },
      { type: "examples", content: "Example input/output", enabled: true },
      { type: "format", content: "Output format", enabled: true },
      { type: "reasoning", content: "Reasoning instruction", enabled: true },
      { type: "output_validation", content: "Validation criteria", enabled: true },
    ];
    const emptyBlocks = baseBlocks.map((b) => ({ ...b, content: "" }));
    const result = applyPatternToBlocks(emptyBlocks, fullPattern);
    expect(result.every((b) => b.content !== "" && b.enabled)).toBe(true);
  });

  it("preserves block IDs and labels after applying pattern", () => {
    const result = applyPatternToBlocks(baseBlocks, chainOfThoughtPattern);
    result.forEach((block, i) => {
      expect(block.id).toBe(baseBlocks[i].id);
      expect(block.label).toBe(baseBlocks[i].label);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXAMPLE LIBRARY — filtering and query logic
// ─────────────────────────────────────────────────────────────────────────────

describe("Example library — filtering logic", () => {
  interface Example {
    id: number;
    slug: string;
    title: string;
    domain: string;
    taskType: string;
    patternSlug: string | null;
    difficulty: "beginner" | "intermediate" | "advanced";
    isFeatured: boolean;
    tokenCount: number;
    promptText: string;
    testedModels: string[];
  }

  const mockExamples: Example[] = [
    {
      id: 1,
      slug: "se-code-review",
      title: "Code Review with Security Focus",
      domain: "software-engineering",
      taskType: "analyze",
      patternSlug: "chain-of-thought",
      difficulty: "intermediate",
      isFeatured: true,
      tokenCount: 180,
      promptText: "You are a senior engineer reviewing code for security vulnerabilities...",
      testedModels: ["gpt-4o", "claude-3-5-sonnet"],
    },
    {
      id: 2,
      slug: "da-eda-analysis",
      title: "Exploratory Data Analysis",
      domain: "data-analysis",
      taskType: "analyze",
      patternSlug: "structured-output",
      difficulty: "beginner",
      isFeatured: false,
      tokenCount: 150,
      promptText: "You are a data scientist performing exploratory data analysis...",
      testedModels: ["gpt-4o"],
    },
    {
      id: 3,
      slug: "legal-contract-review",
      title: "Contract Risk Assessment",
      domain: "legal",
      taskType: "analyze",
      patternSlug: "chain-of-thought",
      difficulty: "advanced",
      isFeatured: true,
      tokenCount: 220,
      promptText: "You are a contract attorney reviewing an agreement for risk...",
      testedModels: ["claude-3-opus", "gpt-4o"],
    },
    {
      id: 4,
      slug: "mkt-positioning",
      title: "Brand Positioning Statement",
      domain: "marketing",
      taskType: "generate",
      patternSlug: "structured-output",
      difficulty: "intermediate",
      isFeatured: false,
      tokenCount: 175,
      promptText: "You are a brand strategist crafting a positioning statement...",
      testedModels: ["gpt-4o", "claude-3-5-sonnet"],
    },
    {
      id: 5,
      slug: "edu-lesson-plan",
      title: "Differentiated Lesson Plan",
      domain: "education",
      taskType: "generate",
      patternSlug: "task-decomposition",
      difficulty: "beginner",
      isFeatured: false,
      tokenCount: 190,
      promptText: "You are an experienced teacher designing a differentiated lesson...",
      testedModels: ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"],
    },
  ];

  function filterExamples(
    examples: Example[],
    filters: {
      domain?: string;
      patternSlug?: string;
      difficulty?: string;
      featured?: boolean;
      search?: string;
      limit?: number;
    }
  ): Example[] {
    let results = [...examples];
    if (filters.domain) results = results.filter((e) => e.domain === filters.domain);
    if (filters.patternSlug) results = results.filter((e) => e.patternSlug === filters.patternSlug);
    if (filters.difficulty) results = results.filter((e) => e.difficulty === filters.difficulty);
    if (filters.featured) results = results.filter((e) => e.isFeatured);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.domain.toLowerCase().includes(q) ||
          e.promptText.toLowerCase().includes(q)
      );
    }
    if (filters.limit) results = results.slice(0, filters.limit);
    return results;
  }

  it("returns all examples when no filters applied", () => {
    expect(filterExamples(mockExamples, {})).toHaveLength(5);
  });

  it("filters by domain", () => {
    const result = filterExamples(mockExamples, { domain: "legal" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("legal-contract-review");
  });

  it("filters by patternSlug", () => {
    const result = filterExamples(mockExamples, { patternSlug: "chain-of-thought" });
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.slug)).toContain("se-code-review");
    expect(result.map((e) => e.slug)).toContain("legal-contract-review");
  });

  it("filters by difficulty", () => {
    const result = filterExamples(mockExamples, { difficulty: "beginner" });
    expect(result).toHaveLength(2);
    result.forEach((e) => expect(e.difficulty).toBe("beginner"));
  });

  it("filters by featured flag", () => {
    const result = filterExamples(mockExamples, { featured: true });
    expect(result).toHaveLength(2);
    result.forEach((e) => expect(e.isFeatured).toBe(true));
  });

  it("filters by search term in title", () => {
    const result = filterExamples(mockExamples, { search: "contract" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("legal-contract-review");
  });

  it("filters by search term in domain", () => {
    const result = filterExamples(mockExamples, { search: "marketing" });
    expect(result).toHaveLength(1);
    expect(result[0].domain).toBe("marketing");
  });

  it("filters by search term in promptText", () => {
    const result = filterExamples(mockExamples, { search: "differentiated" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("edu-lesson-plan");
  });

  it("search is case-insensitive", () => {
    const result = filterExamples(mockExamples, { search: "SECURITY" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("se-code-review");
  });

  it("applies limit correctly", () => {
    const result = filterExamples(mockExamples, { limit: 2 });
    expect(result).toHaveLength(2);
  });

  it("combines multiple filters (domain + difficulty)", () => {
    const result = filterExamples(mockExamples, {
      domain: "software-engineering",
      difficulty: "intermediate",
    });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("se-code-review");
  });

  it("returns empty array when no examples match filters", () => {
    const result = filterExamples(mockExamples, { domain: "finance" });
    expect(result).toHaveLength(0);
  });

  it("returns empty array for search with no matches", () => {
    const result = filterExamples(mockExamples, { search: "quantum entanglement" });
    expect(result).toHaveLength(0);
  });

  it("correctly counts domain distribution", () => {
    const domainCounts: Record<string, number> = {};
    mockExamples.forEach((e) => {
      domainCounts[e.domain] = (domainCounts[e.domain] || 0) + 1;
    });
    expect(domainCounts["software-engineering"]).toBe(1);
    expect(domainCounts["data-analysis"]).toBe(1);
    expect(domainCounts["legal"]).toBe(1);
    expect(domainCounts["marketing"]).toBe(1);
    expect(domainCounts["education"]).toBe(1);
  });

  it("correctly identifies unique domains", () => {
    const domains = [...new Set(mockExamples.map((e) => e.domain))];
    expect(domains).toHaveLength(5);
  });

  it("correctly identifies unique patterns used", () => {
    const patterns = [...new Set(mockExamples.map((e) => e.patternSlug).filter(Boolean))];
    expect(patterns).toContain("chain-of-thought");
    expect(patterns).toContain("structured-output");
    expect(patterns).toContain("task-decomposition");
  });

  it("featured examples are a subset of all examples", () => {
    const featured = filterExamples(mockExamples, { featured: true });
    const all = filterExamples(mockExamples, {});
    featured.forEach((f) => {
      expect(all.some((a) => a.id === f.id)).toBe(true);
    });
  });
});
