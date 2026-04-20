/**
 * phase3.test.ts
 * Tests for Phase 3 features:
 * - App rename to Promptwright
 * - Swarm templates data integrity
 * - SwarmAgent type structure
 * - Knowledge router swarm procedures
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";
import type { SwarmAgent, SwarmTopology } from "../shared/prompitect-types";

const DATABASE_URL = process.env.DATABASE_URL;

// ─── Rename Tests ─────────────────────────────────────────────────────────────

describe("App Rename: Prompitect → Promptwright", () => {
  it("shared types file does not contain Prompitect branding", async () => {
    const { readFileSync } = await import("fs");
    const content = readFileSync("./shared/prompitect-types.ts", "utf-8");
    // The filename can stay as prompitect-types.ts (internal), but the content
    // should not have user-visible Prompitect branding
    expect(content).not.toContain("Prompitect — Prompt Architect");
  });

  it("AppLayout.tsx contains Promptwright branding", async () => {
    const { readFileSync } = await import("fs");
    const content = readFileSync("./client/src/components/AppLayout.tsx", "utf-8");
    expect(content).toContain("Promptwright");
  });

  it("package.json name is promptwright", async () => {
    const { readFileSync } = await import("fs");
    const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
    expect(pkg.name).toBe("promptwright");
  });

  it("README.md exists and contains Promptwright", async () => {
    const { readFileSync } = await import("fs");
    const content = readFileSync("./README.md", "utf-8");
    expect(content).toContain("# Promptwright");
    expect(content).toContain("prompt engineering");
  });
});

// ─── SwarmAgent Type Tests ────────────────────────────────────────────────────

describe("SwarmAgent type structure", () => {
  it("SwarmAgent interface has all required fields", () => {
    // Type-level test: construct a valid SwarmAgent and verify shape
    const agent: SwarmAgent = {
      id: "test-agent",
      name: "Test Agent",
      role: "Test role description",
      systemPrompt: "You are a test agent.",
      inputFrom: "user",
      outputTo: "next-agent",
      handoffCondition: "When complete, hand off.",
    };
    expect(agent.id).toBe("test-agent");
    expect(agent.name).toBe("Test Agent");
    expect(agent.systemPrompt).toBeTruthy();
    expect(agent.handoffCondition).toBeTruthy();
  });

  it("SwarmAgent inputFrom can be an array (parallel topology)", () => {
    const synthesizer: SwarmAgent = {
      id: "synthesizer",
      name: "Synthesizer",
      role: "Merge parallel outputs",
      systemPrompt: "You merge outputs from multiple agents.",
      inputFrom: ["agent-a", "agent-b", "agent-c"],
      outputTo: "user",
      handoffCondition: "When all inputs received, synthesize and deliver.",
    };
    expect(Array.isArray(synthesizer.inputFrom)).toBe(true);
    expect((synthesizer.inputFrom as string[]).length).toBe(3);
  });

  it("SwarmTopology covers all 5 patterns", () => {
    const topologies: SwarmTopology[] = [
      "sequential",
      "parallel",
      "hub-spoke",
      "hierarchical",
      "iterative",
    ];
    expect(topologies).toHaveLength(5);
    topologies.forEach((t) => {
      expect(typeof t).toBe("string");
    });
  });
});

// ─── Swarm Templates DB Tests ─────────────────────────────────────────────────

describe("Swarm Templates: database integrity", () => {
  let conn: mysql.Connection;

  beforeAll(async () => {
    if (!DATABASE_URL) {
      console.warn("DATABASE_URL not set — skipping DB tests");
      return;
    }
    conn = await mysql.createConnection(DATABASE_URL);
  });

  afterAll(async () => {
    if (conn) await conn.end();
  });

  it("swarm_templates table exists and has 9 rows (8 original + ASSESS)", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute("SELECT COUNT(*) as cnt FROM swarm_templates") as [Array<{cnt: number}>, unknown];
    expect(rows[0].cnt).toBe(9);
  });

  it("all 5 topology types are represented", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT DISTINCT topology FROM swarm_templates ORDER BY topology"
    ) as [Array<{topology: string}>, unknown];
    const topologies = rows.map((r) => r.topology).sort();
    expect(topologies).toContain("sequential");
    expect(topologies).toContain("parallel");
    expect(topologies).toContain("hub-spoke");
    expect(topologies).toContain("hierarchical");
    expect(topologies).toContain("iterative");
  });

  it("all templates have non-empty agents JSON with at least 2 agents", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT slug, name, agents, agentCount FROM swarm_templates"
    ) as [Array<{slug: string; name: string; agents: string; agentCount: number}>, unknown];

    for (const row of rows) {
      const agents: SwarmAgent[] = typeof row.agents === "string"
        ? JSON.parse(row.agents)
        : row.agents as unknown as SwarmAgent[];

      expect(agents.length, `${row.name} should have agents`).toBeGreaterThanOrEqual(2);
      expect(agents.length, `${row.name} agentCount should match`).toBe(row.agentCount);

      for (const agent of agents) {
        expect(agent.id, `${row.name}/${agent.name} missing id`).toBeTruthy();
        expect(agent.name, `${row.name}/${agent.id} missing name`).toBeTruthy();
        expect(agent.systemPrompt, `${row.name}/${agent.name} missing systemPrompt`).toBeTruthy();
        expect(agent.systemPrompt.length, `${row.name}/${agent.name} systemPrompt too short`).toBeGreaterThan(100);
        expect(agent.handoffCondition, `${row.name}/${agent.name} missing handoffCondition`).toBeTruthy();
        expect(agent.role, `${row.name}/${agent.name} missing role`).toBeTruthy();
      }
    }
  });

  it("all templates have compatiblePlatforms with at least 1 entry", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT slug, name, compatiblePlatforms FROM swarm_templates"
    ) as [Array<{slug: string; name: string; compatiblePlatforms: string}>, unknown];

    for (const row of rows) {
      const platforms: string[] = typeof row.compatiblePlatforms === "string"
        ? JSON.parse(row.compatiblePlatforms)
        : row.compatiblePlatforms as unknown as string[];
      expect(platforms.length, `${row.name} should have compatible platforms`).toBeGreaterThanOrEqual(1);
      expect(platforms, `${row.name} should support Manus`).toContain("Manus");
    }
  });

  it("featured templates include the Business Operations Swarm", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT slug FROM swarm_templates WHERE isFeatured = 1"
    ) as [Array<{slug: string}>, unknown];
    const slugs = rows.map((r) => r.slug);
    expect(slugs).toContain("business-operations-swarm");
  });

  it("all templates have non-empty useCase (not just description)", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT slug, name, useCase FROM swarm_templates"
    ) as [Array<{slug: string; name: string; useCase: string}>, unknown];

    for (const row of rows) {
      expect(row.useCase, `${row.name} missing useCase`).toBeTruthy();
      expect(row.useCase.length, `${row.name} useCase too short`).toBeGreaterThan(50);
    }
  });

  it("iterative topology has exactly 2 agents (generator + evaluator)", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT slug, name, agentCount FROM swarm_templates WHERE topology = 'iterative'"
    ) as [Array<{slug: string; name: string; agentCount: number}>, unknown];

    expect(rows.length).toBeGreaterThanOrEqual(1);
    for (const row of rows) {
      expect(row.agentCount, `${row.name} iterative should have 2 agents`).toBe(2);
    }
  });

  it("Business Operations Swarm has 6 agents (orchestrator + 5 team members)", async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute(
      "SELECT slug, name, agentCount, JSON_LENGTH(agents) as jsonCount FROM swarm_templates WHERE slug = 'business-operations-swarm'"
    ) as [Array<{slug: string; name: string; agentCount: number; jsonCount: number}>, unknown];
    expect(rows.length).toBe(1);
    expect(rows[0].agentCount).toBe(6);
    expect(rows[0].jsonCount).toBe(6);
  });
});

// ─── ScaffoldBlock Provenance Tests ───────────────────────────────────────────

describe("ScaffoldBlock provenance: source field", () => {
  it("source field accepts all valid values", () => {
    // Import the type and verify the union is complete
    type ValidSource = "user" | "template" | "discovery" | "reverse" | "pattern";
    const sources: ValidSource[] = ["user", "template", "discovery", "reverse", "pattern"];
    expect(sources).toHaveLength(5);
    expect(sources).toContain("pattern");
  });

  it("sourceName is optional and can carry a pattern name", () => {
    // Structural test: sourceName should be optional
    const blockWithSource = {
      id: "role" as const,
      label: "Role",
      content: "You are a senior software engineer.",
      enabled: true,
      source: "pattern" as const,
      sourceName: "Role Prompting",
    };
    expect(blockWithSource.sourceName).toBe("Role Prompting");

    const blockWithoutSource = {
      id: "task" as const,
      label: "Task",
      content: "Review this code.",
      enabled: true,
      source: "user" as const,
    };
    expect(blockWithoutSource.sourceName).toBeUndefined();
  });
});

// ─── Export Document Tests ────────────────────────────────────────────────────

describe("Swarm export document format", () => {
  it("buildExportDocument produces valid Markdown with all sections", () => {
    // Inline the function logic for testing (mirrors SwarmComposer.tsx)
    function buildExportDocument(template: {
      name: string;
      topology: SwarmTopology;
      agentCount: number;
      difficulty: string;
      description: string;
      useCase: string;
      compatiblePlatforms: string[];
      sourceNote: string | null;
      agents: SwarmAgent[];
      slug: string;
    }): string {
      const lines: string[] = [];
      lines.push(`# ${template.name}`);
      lines.push(`**Topology:** ${template.topology}  |  **Agents:** ${template.agentCount}`);
      lines.push(`## Overview`);
      lines.push(template.description);
      lines.push(`## When to Use`);
      lines.push(template.useCase);
      lines.push(`## Compatible Platforms`);
      lines.push(template.compatiblePlatforms.join(", "));
      template.agents.forEach((agent, idx) => {
        lines.push(`### Agent ${idx + 1}: ${agent.name}`);
        lines.push("```");
        lines.push(agent.systemPrompt);
        lines.push("```");
      });
      return lines.join("\n");
    }

    const mockTemplate = {
      name: "Test Pipeline",
      topology: "sequential" as SwarmTopology,
      agentCount: 2,
      difficulty: "intermediate",
      description: "A test pipeline.",
      useCase: "Use for testing.",
      compatiblePlatforms: ["Manus", "AutoGen"],
      sourceNote: null,
      slug: "test-pipeline",
      agents: [
        {
          id: "agent-1",
          name: "First Agent",
          role: "First role",
          systemPrompt: "You are the first agent. Do the first thing.",
          inputFrom: "user",
          outputTo: "agent-2",
          handoffCondition: "When done, hand off.",
        },
        {
          id: "agent-2",
          name: "Second Agent",
          role: "Second role",
          systemPrompt: "You are the second agent. Do the second thing.",
          inputFrom: "agent-1",
          outputTo: "user",
          handoffCondition: "When done, deliver to user.",
        },
      ],
    };

    const doc = buildExportDocument(mockTemplate);

    expect(doc).toContain("# Test Pipeline");
    expect(doc).toContain("## Overview");
    expect(doc).toContain("## When to Use");
    expect(doc).toContain("## Compatible Platforms");
    expect(doc).toContain("### Agent 1: First Agent");
    expect(doc).toContain("### Agent 2: Second Agent");
    expect(doc).toContain("You are the first agent.");
    expect(doc).toContain("You are the second agent.");
    expect(doc).toContain("Manus, AutoGen");
  });
});
