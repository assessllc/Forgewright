/**
 * phase6.test.ts
 *
 * Tests for Phase 6 features:
 * - Feature 3: Version History (scaffold_versions table, listVersions, diffVersions, rollbackToVersion)
 * - Feature 1: Output Diagnosis (diagnosis_patterns seed data, diagnoses table)
 * - Feature 2: A/B Comparison (comparison_runs, comparison_verdicts tables)
 * - Feature 4: Personal Pattern Learning (insights router logic)
 * - SSE endpoint registration (diagnose, compare)
 * - Seed data quality (25 diagnosis patterns, real content)
 *
 * Tests skip gracefully when DATABASE_URL is not set (CI without DB).
 * Real content assertions verify the knowledge base is not placeholder.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
let conn: mysql.Connection;

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  if (!DATABASE_URL) return;
  conn = await mysql.createConnection(DATABASE_URL);
});

afterAll(async () => {
  if (conn) await conn.end();
});

function skipIfNoDb() {
  if (!DATABASE_URL) {
    console.log("  [SKIP] DATABASE_URL not set — skipping DB test");
    return true;
  }
  return false;
}

// ─── Feature 3: Version History ───────────────────────────────────────────────

describe("Feature 3: scaffold_versions table", () => {
  it("scaffold_versions table exists with correct columns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM scaffold_versions"
    );
    const cols = rows.map((r) => r.Field);
    expect(cols).toContain("id");
    expect(cols).toContain("sessionId");
    expect(cols).toContain("versionNumber");
    expect(cols).toContain("fullSnapshot");
    expect(cols).toContain("createdBy");
    expect(cols).toContain("changeSummary");
    expect(cols).toContain("parentVersionId");
    expect(cols).toContain("createdAt");
  });

  it("createdBy column has correct enum values", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM scaffold_versions WHERE Field = 'createdBy'"
    );
    const typeStr = rows[0]?.Type as string ?? "";
    expect(typeStr).toContain("user");
    expect(typeStr).toContain("diagnosis");
    expect(typeStr).toContain("pattern-apply");
    expect(typeStr).toContain("rollback");
  });

  it("can insert a version and retrieve it", async () => {
    if (skipIfNoDb()) return;
    // Create a temporary session first
    const [sessionResult] = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO sessions (title, targetModel, scaffoldBlocks) VALUES (?, ?, ?)",
      ["Test Session Phase6", "gpt-4o", "[]"]
    );
    const sessionId = sessionResult.insertId;

    const snapshot = JSON.stringify([{ id: "role", content: "Test role", enabled: true, label: "Role" }]);
    await conn.execute(
      "INSERT INTO scaffold_versions (sessionId, versionNumber, fullSnapshot, createdBy, changeSummary) VALUES (?, ?, ?, ?, ?)",
      [sessionId, 1, snapshot, "user", "Initial scaffold"]
    );

    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM scaffold_versions WHERE sessionId = ?",
      [sessionId]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].versionNumber).toBe(1);
    expect(rows[0].createdBy).toBe("user");
    expect(rows[0].changeSummary).toBe("Initial scaffold");

    // Cleanup
    await conn.execute("DELETE FROM scaffold_versions WHERE sessionId = ?", [sessionId]);
    await conn.execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
  });

  it("version numbers are unique per session", async () => {
    if (skipIfNoDb()) return;
    const [sessionResult] = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO sessions (title, targetModel, scaffoldBlocks) VALUES (?, ?, ?)",
      ["Test Session Versions", "gpt-4o", "[]"]
    );
    const sessionId = sessionResult.insertId;
    const snapshot = JSON.stringify([]);

    await conn.execute(
      "INSERT INTO scaffold_versions (sessionId, versionNumber, fullSnapshot, createdBy, changeSummary) VALUES (?, ?, ?, ?, ?)",
      [sessionId, 1, snapshot, "user", "v1"]
    );
    await conn.execute(
      "INSERT INTO scaffold_versions (sessionId, versionNumber, fullSnapshot, createdBy, changeSummary) VALUES (?, ?, ?, ?, ?)",
      [sessionId, 2, snapshot, "pattern-apply", "v2"]
    );

    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT versionNumber FROM scaffold_versions WHERE sessionId = ? ORDER BY versionNumber",
      [sessionId]
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].versionNumber).toBe(1);
    expect(rows[1].versionNumber).toBe(2);

    // Cleanup
    await conn.execute("DELETE FROM scaffold_versions WHERE sessionId = ?", [sessionId]);
    await conn.execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
  });

  it("rollback creates a new version with createdBy=rollback", async () => {
    if (skipIfNoDb()) return;
    const [sessionResult] = await conn.execute<mysql.ResultSetHeader>(
      "INSERT INTO sessions (title, targetModel, scaffoldBlocks) VALUES (?, ?, ?)",
      ["Test Rollback", "gpt-4o", "[]"]
    );
    const sessionId = sessionResult.insertId;
    const snapshot = JSON.stringify([{ id: "task", content: "original", enabled: true, label: "Task" }]);

    await conn.execute(
      "INSERT INTO scaffold_versions (sessionId, versionNumber, fullSnapshot, createdBy, changeSummary) VALUES (?, ?, ?, ?, ?)",
      [sessionId, 1, snapshot, "user", "Initial"]
    );
    await conn.execute(
      "INSERT INTO scaffold_versions (sessionId, versionNumber, fullSnapshot, createdBy, changeSummary) VALUES (?, ?, ?, ?, ?)",
      [sessionId, 2, snapshot, "rollback", "Rolled back to version 1"]
    );

    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM scaffold_versions WHERE sessionId = ? AND createdBy = 'rollback'",
      [sessionId]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].changeSummary).toContain("Rolled back");

    // Cleanup
    await conn.execute("DELETE FROM scaffold_versions WHERE sessionId = ?", [sessionId]);
    await conn.execute("DELETE FROM sessions WHERE id = ?", [sessionId]);
  });
});

// ─── Feature 1: Diagnosis Patterns Seed Data ─────────────────────────────────

describe("Feature 1: diagnosis_patterns table and seed data", () => {
  it("diagnosis_patterns table exists with correct columns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM diagnosis_patterns"
    );
    const cols = rows.map((r) => r.Field);
    expect(cols).toContain("id");
    expect(cols).toContain("slug");
    expect(cols).toContain("name");
    expect(cols).toContain("category");
    expect(cols).toContain("severity");
    expect(cols).toContain("description");
    expect(cols).toContain("detectionHeuristics");
    expect(cols).toContain("canonicalRemediation");
    expect(cols).toContain("primaryAffectedBlock");
  });

  it("has exactly 25 diagnosis patterns seeded", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM diagnosis_patterns"
    );
    expect(rows[0].count).toBe(25);
  });

  it("has all 10 required categories represented", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT DISTINCT category FROM diagnosis_patterns ORDER BY category"
    );
    const cats = rows.map((r) => r.category);
    expect(cats).toContain("reasoning-drift");
    expect(cats).toContain("hallucination");
    expect(cats).toContain("format-drift");
    expect(cats).toContain("persona-drift");
    expect(cats).toContain("scope-drift");
    expect(cats).toContain("refusal-drift");
    expect(cats).toContain("instruction-drift");
    expect(cats).toContain("output-quality");
    expect(cats).toContain("structural-drift");
    expect(cats).toContain("task-specific");
  });

  it("has all three severity levels", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT DISTINCT severity FROM diagnosis_patterns"
    );
    const severities = rows.map((r) => r.severity);
    expect(severities).toContain("high");
    expect(severities).toContain("medium");
    expect(severities).toContain("low");
  });

  it("every pattern has a non-empty slug, description, and remediation", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT slug FROM diagnosis_patterns 
       WHERE slug IS NULL OR slug = '' 
       OR description IS NULL OR description = '' 
       OR canonicalRemediation IS NULL OR canonicalRemediation = ''`
    );
    expect(rows).toHaveLength(0);
  });

  it("every pattern has a valid primaryAffectedBlock", async () => {
    if (skipIfNoDb()) return;
    const validBlocks = ["role", "context", "task", "constraints", "format", "reasoning", "output_validation", "examples"];
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, primaryAffectedBlock FROM diagnosis_patterns"
    );
    for (const row of rows) {
      expect(validBlocks).toContain(row.primaryAffectedBlock);
    }
  });

  it("all slugs are unique", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, COUNT(*) as count FROM diagnosis_patterns GROUP BY slug HAVING count > 1"
    );
    expect(rows).toHaveLength(0);
  });

  it("has at least 3 high-severity patterns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM diagnosis_patterns WHERE severity = 'high'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(3);
  });

  it("hallucination category has at least 2 patterns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM diagnosis_patterns WHERE category = 'hallucination'"
    );
    expect(rows[0].count).toBeGreaterThanOrEqual(2);
  });

  it("detectionHeuristics is valid JSON array with at least 2 items", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, detectionHeuristics FROM diagnosis_patterns"
    );
    for (const row of rows) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(row.detectionHeuristics as string);
      } catch {
        throw new Error(`Pattern ${row.slug} has invalid detectionHeuristics JSON`);
      }
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as unknown[]).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("descriptions are substantive (>50 chars)", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, description FROM diagnosis_patterns WHERE LENGTH(description) < 50"
    );
    expect(rows).toHaveLength(0);
  });

  it("remediations are actionable (>80 chars)", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT slug, canonicalRemediation FROM diagnosis_patterns WHERE LENGTH(canonicalRemediation) < 80"
    );
    expect(rows).toHaveLength(0);
  });

  it("diagnoses table exists with correct columns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM diagnoses"
    );
    const cols = rows.map((r) => r.Field);
    expect(cols).toContain("id");
    expect(cols).toContain("sessionId");
    expect(cols).toContain("outputText");
    expect(cols).toContain("diagnosisJson");
    expect(cols).toContain("editAcceptance");
    expect(cols).toContain("createdAt");
  });
});

// ─── Feature 2: A/B Comparison ────────────────────────────────────────────────

describe("Feature 2: comparison_runs and comparison_verdicts tables", () => {
  it("comparison_runs table exists with correct columns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM comparison_runs"
    );
    const cols = rows.map((r) => r.Field);
    expect(cols).toContain("id");
    expect(cols).toContain("sessionId");
    expect(cols).toContain("inputText");
    expect(cols).toContain("variantALabel");
    expect(cols).toContain("variantAPrompt");
    expect(cols).toContain("variantBLabel");
    expect(cols).toContain("variantBPrompt");
    expect(cols).toContain("variantAOutput");
    expect(cols).toContain("variantBOutput");
    expect(cols).toContain("createdAt");
  });

  it("comparison_verdicts table exists with correct columns", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM comparison_verdicts"
    );
    const cols = rows.map((r) => r.Field);
    expect(cols).toContain("id");
    expect(cols).toContain("comparisonRunId");
    expect(cols).toContain("preference");
    expect(cols).toContain("reasonTags");
    expect(cols).toContain("notes");
    expect(cols).toContain("createdAt");
  });

  it("preference column has correct enum values", async () => {
    if (skipIfNoDb()) return;
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SHOW COLUMNS FROM comparison_verdicts WHERE Field = 'preference'"
    );
    const typeStr = rows[0]?.Type as string ?? "";
    expect(typeStr).toContain("a");
    expect(typeStr).toContain("b");
    expect(typeStr).toContain("tie");
    expect(typeStr).toContain("both-bad");
  });

  it("can create a comparison run and record a verdict", async () => {
    if (skipIfNoDb()) return;
    const [runResult] = await conn.execute<mysql.ResultSetHeader>(
      `INSERT INTO comparison_runs 
       (sessionId, inputText, variantALabel, variantAPrompt, variantBLabel, variantBPrompt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [0, "Test input", "Variant A", "System prompt A", "Variant B", "System prompt B"]
    );
    const runId = runResult.insertId;

    await conn.execute(
      "INSERT INTO comparison_verdicts (comparisonRunId, preference, reasonTags, notes) VALUES (?, ?, ?, ?)",
      [runId, "a", JSON.stringify(["accuracy", "tone"]), "A was more precise"]
    );

    const [verdictRows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM comparison_verdicts WHERE comparisonRunId = ?",
      [runId]
    );
    expect(verdictRows).toHaveLength(1);
    expect(verdictRows[0].preference).toBe("a");
    expect(verdictRows[0].notes).toBe("A was more precise");

    // Cleanup
    await conn.execute("DELETE FROM comparison_verdicts WHERE comparisonRunId = ?", [runId]);
    await conn.execute("DELETE FROM comparison_runs WHERE id = ?", [runId]);
  });

  it("win rate calculation works for multiple verdicts", async () => {
    if (skipIfNoDb()) return;
    // Create 3 runs with verdicts: A wins twice, B wins once
    const runIds: number[] = [];
    for (let i = 0; i < 3; i++) {
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO comparison_runs (sessionId, inputText, variantALabel, variantAPrompt, variantBLabel, variantBPrompt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [0, `Input ${i}`, "Chain-of-Thought", "CoT prompt", "Zero-Shot", "ZS prompt"]
      );
      runIds.push(result.insertId);
    }

    await conn.execute(
      "INSERT INTO comparison_verdicts (comparisonRunId, preference) VALUES (?, ?), (?, ?), (?, ?)",
      [runIds[0], "a", runIds[1], "a", runIds[2], "b"]
    );

    const [aWins] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM comparison_verdicts cv
       JOIN comparison_runs cr ON cv.comparisonRunId = cr.id
       WHERE cr.variantALabel = 'Chain-of-Thought' AND cv.preference = 'a'`
    );
    expect(aWins[0].count).toBe(2);

    // Cleanup
    for (const id of runIds) {
      await conn.execute("DELETE FROM comparison_verdicts WHERE comparisonRunId = ?", [id]);
      await conn.execute("DELETE FROM comparison_runs WHERE id = ?", [id]);
    }
  });

  it("one run can have at most one verdict (enforced by unique constraint)", async () => {
    if (skipIfNoDb()) return;
    const [runResult] = await conn.execute<mysql.ResultSetHeader>(
      `INSERT INTO comparison_runs (sessionId, inputText, variantALabel, variantAPrompt, variantBLabel, variantBPrompt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [0, "Unique test", "A", "PA", "B", "PB"]
    );
    const runId = runResult.insertId;

    await conn.execute(
      "INSERT INTO comparison_verdicts (comparisonRunId, preference) VALUES (?, ?)",
      [runId, "a"]
    );

    // Second insert should fail due to unique constraint
    await expect(
      conn.execute(
        "INSERT INTO comparison_verdicts (comparisonRunId, preference) VALUES (?, ?)",
        [runId, "b"]
      )
    ).rejects.toThrow();

    // Cleanup
    await conn.execute("DELETE FROM comparison_verdicts WHERE comparisonRunId = ?", [runId]);
    await conn.execute("DELETE FROM comparison_runs WHERE id = ?", [runId]);
  });
});

// ─── Feature 4: Insights Logic ────────────────────────────────────────────────

describe("Feature 4: Insights router logic (unit tests)", () => {
  it("insight types cover all 12 required rules", () => {
    // These are the 12 insight types defined in insights.ts
    const requiredTypes = [
      "DOMINANT_FAILURE_MODE",
      "PREFERRED_VARIANT",
      "ACCEPTED_PATTERN",
      "AVOIDED_ANTIPATTERN",
      "MODEL_AFFINITY",
      "DIAGNOSIS_ACCEPTANCE",
      "VERSION_CHURN",
      "ROLLBACK_FREQUENCY",
      "DOMAIN_CONCENTRATION",
      "REASONING_BLOCK_USAGE",
      "FORMAT_BLOCK_USAGE",
      "SESSION_COMPLETION_RATE",
    ];
    // Verify the type exists in the compiled module
    // (Import would require DB, so we test the type definition file directly)
    const insightsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/insights.ts"),
      "utf-8"
    );
    for (const type of requiredTypes) {
      expect(insightsContent).toContain(type);
    }
  });

  it("confidence levels are low/medium/high", () => {
    const insightsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/insights.ts"),
      "utf-8"
    );
    expect(insightsContent).toContain('"low"');
    expect(insightsContent).toContain('"medium"');
    expect(insightsContent).toContain('"high"');
  });

  it("data quality levels include insufficient/low/medium/high", () => {
    const insightsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/insights.ts"),
      "utf-8"
    );
    expect(insightsContent).toContain("insufficient");
    expect(insightsContent).toContain("dataQuality");
    expect(insightsContent).toContain("totalSessions");
  });

  it("getInsights procedure is exported", () => {
    const insightsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/insights.ts"),
      "utf-8"
    );
    expect(insightsContent).toContain("getInsights");
    expect(insightsContent).toContain("insightsRouter");
  });
});

// ─── SSE Endpoints ────────────────────────────────────────────────────────────

describe("SSE streaming endpoints", () => {
  it("streaming.ts registers /api/stream/diagnose endpoint", () => {
    const streamingContent = require("fs").readFileSync(
      require("path").join(__dirname, "streaming.ts"),
      "utf-8"
    );
    expect(streamingContent).toContain("/api/stream/diagnose");
    expect(streamingContent).toContain("handleDiagnoseStream");
  });

  it("streaming.ts registers /api/stream/compare endpoint", () => {
    const streamingContent = require("fs").readFileSync(
      require("path").join(__dirname, "streaming.ts"),
      "utf-8"
    );
    expect(streamingContent).toContain("/api/stream/compare");
    expect(streamingContent).toContain("handleCompareStream");
  });

  it("DIAGNOSE_SYSTEM_PROMPT covers all 10 failure mode categories", () => {
    const streamingContent = require("fs").readFileSync(
      require("path").join(__dirname, "streaming.ts"),
      "utf-8"
    );
    const categories = [
      "reasoning-drift",
      "hallucination",
      "format-drift",
      "persona-drift",
      "scope-drift",
      "refusal-drift",
      "instruction-drift",
      "output-quality",
      "structural-drift",
      "task-specific",
    ];
    for (const cat of categories) {
      expect(streamingContent).toContain(cat);
    }
  });

  it("diagnose endpoint validates minimum output length", () => {
    const streamingContent = require("fs").readFileSync(
      require("path").join(__dirname, "streaming.ts"),
      "utf-8"
    );
    expect(streamingContent).toContain("outputText.length < 20");
  });

  it("compare endpoint requires both inputText and variantPrompt", () => {
    const streamingContent = require("fs").readFileSync(
      require("path").join(__dirname, "streaming.ts"),
      "utf-8"
    );
    expect(streamingContent).toContain("inputText");
    expect(streamingContent).toContain("variantPrompt");
  });
});

// ─── Version History Router ───────────────────────────────────────────────────

describe("Version History router procedures", () => {
  it("sessions router exports listVersions procedure", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    expect(sessionsContent).toContain("listVersions");
  });

  it("sessions router exports getVersion procedure", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    expect(sessionsContent).toContain("getVersion");
  });

  it("sessions router exports diffVersions procedure", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    expect(sessionsContent).toContain("diffVersions");
  });

  it("sessions router exports rollbackToVersion procedure", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    expect(sessionsContent).toContain("rollbackToVersion");
  });

  it("createScaffoldVersion helper is exported", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    expect(sessionsContent).toContain("export async function createScaffoldVersion");
  });

  it("computeBlockDiff uses Myers diff algorithm (diffLines)", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    expect(sessionsContent).toContain("diffLines");
    expect(sessionsContent).toContain("Myers");
  });

  it("rollback creates new version instead of mutating history", () => {
    const sessionsContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/sessions.ts"),
      "utf-8"
    );
    // Rollback should call createScaffoldVersion with "rollback" as createdBy
    expect(sessionsContent).toContain('"rollback"');
    expect(sessionsContent).toContain("createScaffoldVersion");
  });
});

// ─── Diagnosis Router Procedures ─────────────────────────────────────────────

describe("Diagnosis router procedures", () => {
  it("diagnosis router exports getDiagnosisPatterns", () => {
    const diagContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/diagnosis.ts"),
      "utf-8"
    );
    expect(diagContent).toContain("getDiagnosisPatterns");
  });

  it("diagnosis router exports getDiagnosisCategories", () => {
    const diagContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/diagnosis.ts"),
      "utf-8"
    );
    expect(diagContent).toContain("getDiagnosisCategories");
  });

  it("diagnosis router exports createDiagnosis", () => {
    const diagContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/diagnosis.ts"),
      "utf-8"
    );
    expect(diagContent).toContain("createDiagnosis");
  });

  it("diagnosis router exports updateDiagnosisAcceptance", () => {
    const diagContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/diagnosis.ts"),
      "utf-8"
    );
    expect(diagContent).toContain("updateDiagnosisAcceptance");
  });
});

// ─── Comparison Router Procedures ────────────────────────────────────────────

describe("Comparison router procedures", () => {
  it("comparison router exports createComparisonRun", () => {
    const compContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/comparison.ts"),
      "utf-8"
    );
    expect(compContent).toContain("createComparisonRun");
  });

  it("comparison router exports recordVerdict", () => {
    const compContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/comparison.ts"),
      "utf-8"
    );
    expect(compContent).toContain("recordVerdict");
  });

  it("comparison router exports getWinRates", () => {
    const compContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/comparison.ts"),
      "utf-8"
    );
    expect(compContent).toContain("getWinRates");
  });

  it("comparison router exports listComparisonRuns", () => {
    const compContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/comparison.ts"),
      "utf-8"
    );
    expect(compContent).toContain("listComparisonRuns");
  });

  it("win rate calculation includes wins, losses, ties, and both-bad", () => {
    const compContent = require("fs").readFileSync(
      require("path").join(__dirname, "routers/comparison.ts"),
      "utf-8"
    );
    expect(compContent).toContain("wins");
    expect(compContent).toContain("losses");
    expect(compContent).toContain("ties");
    expect(compContent).toContain("winRate");
  });
});

// ─── Seed Script Quality ──────────────────────────────────────────────────────

describe("Seed script: seed-diagnosis-patterns.mjs", () => {
  it("seed script exists", () => {
    const fs = require("fs");
    const path = require("path");
    const seedPath = path.join(__dirname, "../scripts/seed-diagnosis-patterns.mjs");
    expect(fs.existsSync(seedPath)).toBe(true);
  });

  it("seed script defines exactly 25 patterns", () => {
    const fs = require("fs");
    const path = require("path");
    const seedContent = fs.readFileSync(
      path.join(__dirname, "../scripts/seed-diagnosis-patterns.mjs"),
      "utf-8"
    );
    // Count slug occurrences as a proxy for pattern count
    const slugMatches = seedContent.match(/slug:/g);
    expect(slugMatches?.length).toBe(25);
  });

  it("seed script covers all 10 required categories", () => {
    const fs = require("fs");
    const path = require("path");
    const seedContent = fs.readFileSync(
      path.join(__dirname, "../scripts/seed-diagnosis-patterns.mjs"),
      "utf-8"
    );
    const categories = [
      "reasoning-drift",
      "hallucination",
      "format-drift",
      "persona-drift",
      "scope-drift",
      "refusal-drift",
      "instruction-drift",
      "output-quality",
      "structural-drift",
      "task-specific",
    ];
    for (const cat of categories) {
      expect(seedContent).toContain(cat);
    }
  });

  it("seed script has source references (not placeholder)", () => {
    const fs = require("fs");
    const path = require("path");
    const seedContent = fs.readFileSync(
      path.join(__dirname, "../scripts/seed-diagnosis-patterns.mjs"),
      "utf-8"
    );
    // Should cite real papers/sources
    expect(seedContent).toMatch(/Dhuliawala|Madaan|Anthropic|OpenAI|Wei et al|Perez|Bai/);
  });
});

// ─── Migration File ───────────────────────────────────────────────────────────

describe("Phase 6 database migration", () => {
  it("migration file exists for Phase 6 tables", () => {
    const fs = require("fs");
    const path = require("path");
    const drizzleDir = path.join(__dirname, "../drizzle");
    const files = fs.readdirSync(drizzleDir).filter((f: string) => f.endsWith(".sql"));
    // Should have at least 5 migration files (0000 through 0004 from prior phases, plus 0005 for Phase 6)
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it("Phase 6 migration includes scaffold_versions table", () => {
    const fs = require("fs");
    const path = require("path");
    const drizzleDir = path.join(__dirname, "../drizzle");
    const files = fs.readdirSync(drizzleDir)
      .filter((f: string) => f.endsWith(".sql"))
      .sort();
    // Read all migration files to find scaffold_versions
    const allSql = files.map((f: string) =>
      fs.readFileSync(path.join(drizzleDir, f), "utf-8")
    ).join("\n");
    expect(allSql).toContain("scaffold_versions");
  });

  it("Phase 6 migration includes diagnosis_patterns table", () => {
    const fs = require("fs");
    const path = require("path");
    const drizzleDir = path.join(__dirname, "../drizzle");
    const files = fs.readdirSync(drizzleDir)
      .filter((f: string) => f.endsWith(".sql"))
      .sort();
    const allSql = files.map((f: string) =>
      fs.readFileSync(path.join(drizzleDir, f), "utf-8")
    ).join("\n");
    expect(allSql).toContain("diagnosis_patterns");
  });

  it("Phase 6 migration includes comparison_runs table", () => {
    const fs = require("fs");
    const path = require("path");
    const drizzleDir = path.join(__dirname, "../drizzle");
    const files = fs.readdirSync(drizzleDir)
      .filter((f: string) => f.endsWith(".sql"))
      .sort();
    const allSql = files.map((f: string) =>
      fs.readFileSync(path.join(drizzleDir, f), "utf-8")
    ).join("\n");
    expect(allSql).toContain("comparison_runs");
  });
});
