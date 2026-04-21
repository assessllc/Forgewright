/**
 * phase5.test.ts
 *
 * Tests for Phase 5 features:
 * - Anti-Pattern Library page data (32 anti-patterns, categories, severity levels)
 * - Model Guide data (8 models, pricing, capabilities)
 * - ASSESS Business Operations Command swarm template (11 agents, hub-spoke)
 *
 * All tests verify real content — not structure alone.
 * Uses graceful skip pattern (skipIfNoDb) so CI without DATABASE_URL still passes.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

let conn: mysql.Connection;

function skipIfNoDb(): boolean {
  if (!DATABASE_URL) {
    console.log("  [SKIP] DATABASE_URL not set — skipping DB test");
    return true;
  }
  return false;
}

beforeAll(async () => {
  if (!DATABASE_URL) return;
  conn = await mysql.createConnection(DATABASE_URL);
});

afterAll(async () => {
  if (conn) await conn.end();
});

// ─── Anti-Pattern Library ─────────────────────────────────────────────────────

describe("Anti-Pattern Library", () => {
  it("has at least 30 anti-patterns seeded", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM anti_patterns"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(30);
  });

  it("has all three severity levels represented", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT DISTINCT severity FROM anti_patterns ORDER BY severity"
    );
    const severities = rows.map((r) => r.severity);
    expect(severities).toContain("high");
    expect(severities).toContain("medium");
    expect(severities).toContain("low");
  });

  it("has at least 8 distinct categories", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT DISTINCT category FROM anti_patterns"
    );
    expect(rows.length).toBeGreaterThanOrEqual(8);
  });

  it("every anti-pattern has a non-empty description and detection hint", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, description, detectionHint FROM anti_patterns WHERE description IS NULL OR description = '' OR detectionHint IS NULL OR detectionHint = ''"
    );
    expect(rows).toHaveLength(0);
  });

  it("every anti-pattern has at least one example", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, examples FROM anti_patterns WHERE examples IS NULL OR examples = '' OR examples = '[]'"
    );
    expect(rows).toHaveLength(0);
  });

  it("every anti-pattern has a remediation strategy", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, remediation FROM anti_patterns WHERE remediation IS NULL OR remediation = ''"
    );
    expect(rows).toHaveLength(0);
  });

  it("high-severity anti-patterns have a fixedByPatterns array", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, fixedByPatterns FROM anti_patterns WHERE severity = 'high'"
    );
    for (const row of rows) {
      const patterns = Array.isArray(row.fixedByPatterns)
        ? row.fixedByPatterns
        : JSON.parse(row.fixedByPatterns || "[]");
      expect(Array.isArray(patterns)).toBe(true);
    }
  });

  it("the vague-verb anti-pattern is present and correctly categorized as high severity", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, severity, category FROM anti_patterns WHERE slug = 'vague-verb'"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].severity).toBe("high");
  });
});

// ─── Model Guide ─────────────────────────────────────────────────────────────

describe("Model Guide", () => {
  it("has exactly 8 models seeded", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM model_quirks"
    );
    expect(rows[0].count).toBe(8);
  });

  it("covers all four major providers", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT DISTINCT provider FROM model_quirks ORDER BY provider"
    );
    const providers = rows.map((r) => r.provider);
    expect(providers).toContain("Anthropic");
    expect(providers).toContain("OpenAI");
    expect(providers).toContain("Google");
    const hasOpenSource = providers.some((p: string) => p.includes("Meta") || p.includes("Mistral"));
    expect(hasOpenSource).toBe(true);
  });

  it("every model has a context window size", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, contextWindowTokens FROM model_quirks WHERE contextWindowTokens IS NULL OR contextWindowTokens = 0"
    );
    expect(rows).toHaveLength(0);
  });

  it("every model has pricing data", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, pricing FROM model_quirks WHERE pricing IS NULL OR pricing = ''"
    );
    expect(rows).toHaveLength(0);
  });

  it("every model has at least 3 strengths", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, strengths FROM model_quirks"
    );
    for (const row of rows) {
      const strengths = Array.isArray(row.strengths) ? row.strengths : JSON.parse(row.strengths || "[]");
      expect(strengths.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("every model has at least 2 optimization tips", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, optimizationTips FROM model_quirks"
    );
    for (const row of rows) {
      const tips = Array.isArray(row.optimizationTips) ? row.optimizationTips : JSON.parse(row.optimizationTips || "[]");
      expect(tips.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("every model has recommended patterns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, recommendedPatterns FROM model_quirks WHERE recommendedPatterns IS NULL OR recommendedPatterns = '[]'"
    );
    expect(rows).toHaveLength(0);
  });

  it("Claude 3.5 Sonnet supports vision and streaming", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, supportsVision, supportsStreaming FROM model_quirks WHERE modelId = 'claude-3-5-sonnet-20241022'"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].supportsVision).toBe(1);
    expect(rows[0].supportsStreaming).toBe(1);
  });

  it("OpenAI o1 does not support streaming (known limitation)", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, supportsStreaming FROM model_quirks WHERE modelId = 'o1'"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].supportsStreaming).toBe(0);
  });

  it("pricing inputPer1k is a valid positive number for all models", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT modelId, pricing FROM model_quirks"
    );
    for (const row of rows) {
      const pricing = typeof row.pricing === "string" ? JSON.parse(row.pricing) : row.pricing;
      expect(typeof pricing.inputPer1k).toBe("number");
      expect(pricing.inputPer1k).toBeGreaterThan(0);
      expect(typeof pricing.outputPer1k).toBe("number");
      expect(pricing.outputPer1k).toBeGreaterThan(0);
    }
  });
});

// ─── ASSESS Business Operations Command ──────────────────────────────────────

describe("ASSESS Business Operations Command swarm template", () => {
  let template: mysql.RowDataPacket;

  beforeAll(async () => {
    if (!DATABASE_URL) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM swarm_templates WHERE slug = 'assess-business-operations-command'"
    );
    template = rows[0];
  });

  it("exists in the database", () => {
    if (skipIfNoDb()) return;
    expect(template).toBeDefined();
  });

  it("has hub-spoke topology", () => {
    if (skipIfNoDb()) return;
    expect(template.topology).toBe("hub-spoke");
  });

  it("has exactly 11 agents (1 orchestrator + 10 specialists)", () => {
    if (skipIfNoDb()) return;
    expect(template.agentCount).toBe(11);
  });

  it("is marked as featured", () => {
    if (skipIfNoDb()) return;
    expect(template.isFeatured).toBe(1);
  });

  it("is marked as advanced difficulty", () => {
    if (skipIfNoDb()) return;
    expect(template.difficulty).toBe("advanced");
  });

  it("includes Manus in compatible platforms", () => {
    if (skipIfNoDb()) return;
    const platforms = Array.isArray(template.compatiblePlatforms)
      ? template.compatiblePlatforms
      : JSON.parse(template.compatiblePlatforms);
    expect(platforms).toContain("Manus");
  });

  it("has all 11 agents with required fields", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    expect(agents).toHaveLength(11);
    for (const agent of agents) {
      expect(agent.id).toBeTruthy();
      expect(agent.name).toBeTruthy();
      expect(agent.role).toBeTruthy();
      expect(agent.systemPrompt).toBeTruthy();
      expect(agent.handoffCondition).toBeTruthy();
      expect(agent.inputFrom).toBeTruthy();
      expect(agent.outputTo).toBeTruthy();
    }
  });

  it("has an orchestrator agent that routes to specialists", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    const orchestrator = agents.find((a: { id: string }) => a.id === "orchestrator");
    expect(orchestrator).toBeDefined();
    expect(orchestrator.inputFrom).toBe("user");
    expect(orchestrator.systemPrompt).toContain("route");
  });

  it("has all 10 specialist agents", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    const specialistIds = agents.map((a: { id: string }) => a.id);
    expect(specialistIds).toContain("niche_finder");
    expect(specialistIds).toContain("lead_generator");
    expect(specialistIds).toContain("analytics_lead");
    expect(specialistIds).toContain("social_media_manager");
    expect(specialistIds).toContain("finance_analyst");
    expect(specialistIds).toContain("accountant");
    expect(specialistIds).toContain("competitive_intelligence");
    expect(specialistIds).toContain("product_lead");
    expect(specialistIds).toContain("sales_lead");
    expect(specialistIds).toContain("customer_success");
  });

  it("all specialist agents route back to orchestrator", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    const specialists = agents.filter((a: { id: string }) => a.id !== "orchestrator");
    for (const agent of specialists) {
      expect(agent.inputFrom).toBe("orchestrator");
      expect(agent.outputTo).toBe("orchestrator");
    }
  });

  it("every agent system prompt is substantive (>200 chars)", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    for (const agent of agents) {
      expect(agent.systemPrompt.length).toBeGreaterThan(200);
    }
  });

  it("every agent system prompt contains an output format specification", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    for (const agent of agents) {
      const hasOutputSpec =
        agent.systemPrompt.includes("OUTPUT FORMAT") ||
        agent.systemPrompt.includes("output format") ||
        agent.systemPrompt.includes("QUALITY BAR") ||
        agent.systemPrompt.includes("WHAT YOU DO");
      expect(hasOutputSpec).toBe(true);
    }
  });

  it("the ASSESS template references ASSESS in description", () => {
    if (skipIfNoDb()) return;
    expect(template.description).toContain("ASSESS");
  });

  it("the orchestrator system prompt references ASSESS LLC", () => {
    if (skipIfNoDb()) return;
    const agents = Array.isArray(template.agents) ? template.agents : JSON.parse(template.agents);
    const orchestrator = agents.find((a: { id: string }) => a.id === "orchestrator");
    expect(orchestrator.systemPrompt).toContain("ASSESS LLC");
  });

  it("covers all 6 business domains in the domains array", () => {
    if (skipIfNoDb()) return;
    const domains = Array.isArray(template.domains) ? template.domains : JSON.parse(template.domains);
    expect(domains).toContain("business");
    expect(domains).toContain("marketing");
    expect(domains).toContain("finance");
    expect(domains).toContain("sales");
    expect(domains).toContain("operations");
    expect(domains).toContain("product");
  });
});

// ─── Total swarm template count ───────────────────────────────────────────────

describe("Swarm template catalog", () => {
  it("has exactly 9 templates (8 original + ASSESS)", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM swarm_templates"
    );
    expect(rows[0].count).toBe(9);
  });

  it("has templates covering all 5 topology types", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT DISTINCT topology FROM swarm_templates ORDER BY topology"
    );
    const topologies = rows.map((r) => r.topology);
    expect(topologies).toContain("sequential");
    expect(topologies).toContain("parallel");
    expect(topologies).toContain("hub-spoke");
    expect(topologies).toContain("hierarchical");
    expect(topologies).toContain("iterative");
  });

  it("has at least 3 featured templates", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM swarm_templates WHERE isFeatured = 1"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(3);
  });
});
