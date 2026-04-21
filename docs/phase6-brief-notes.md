# Phase 6 Brief: The Iteration Loop
## "Closing the gap between 'here's your prompt' and 'the output is right'"

---

## Context
Phases 1–5 built: discovery engine, scaffold builder, pattern library, reverse-mode analyzer, swarm composer, associated knowledge bases.
Phase 6 adds: the iteration loop — feedback machinery that turns a good prompt into the right prompt through repeated refinement against real outputs.

## Guiding Principles (unchanged)
1. Discovery engine first, generator second
2. Visibility over magic — diagnoses, diffs, win-rate data must be legible and traceable
3. Teach through use — every iteration should make the user a better prompter
4. Real content, not placeholders

---

## Build Order (MANDATORY — do not deviate)
1. Feature 3 (Version History) FIRST — every other feature writes versions
2. Feature 1 (Output Diagnosis) SECOND — unlocks largest user value, seeds data for Feature 4
3. Feature 2 (A/B Comparison) THIRD — depends on versioning, generates data for Feature 4
4. Feature 4 (Personal Pattern Learning) LAST — consumes data from Features 1–3

---

## Feature 1 — Output Diagnosis

### What it is
User ran a prompt. Output wasn't right. They paste the output (or reference saved scaffold). App produces targeted diagnosis identifying WHY the prompt produced that output, with block-level edit suggestions.

**NOT a full rewrite** — targeted, surgical edits tied to specific scaffold blocks.

### Diagnosis contains:
- **Intent-vs-output drift map** — per enabled block: hit / partial / miss / not-attempted
- **Root-cause analysis** — for each miss/partial: specific failure mode (ambiguous verb, unstated audience, conflicting instruction, format drift, instruction overload, premature closure, missing edge-case handling, etc.)
- **Surgical edit suggestions** — block-level edit with before/after text (not prose suggestions)
- **Pattern recommendations** — one-click "Apply [pattern]" when diagnosis maps to a pattern
- **Anti-pattern cross-reference** — link to Anti-Pattern Library when applicable

### Seed dataset: Diagnosis Patterns (minimum 25 entries)
Each entry must include:
- slug, name, category (reasoning-drift, format-drift, persona-drift, scope-drift, hallucination, refusal-drift, length-drift, tone-drift, etc.)
- Description of failure mode
- Detection heuristics (what output looks like when this is happening)
- Example prompt-output pair demonstrating the failure
- Canonical remediation (which block to edit, what to add)
- Linked patterns (from Pattern Library) and linked anti-patterns
- Source reference

### Research citations (required in seed file header):
- Dhuliawala et al. (2023) — "Chain-of-Verification Reduces Hallucination in Large Language Models"
- Madaan et al. (2023) — "Self-Refine: Iterative Refinement with Self-Feedback"
- Shinn et al. (2023) — "Reflexion: Language Agents with Verbal Reinforcement Learning"
- Wang et al. (2022) — "Self-Consistency Improves Chain of Thought Reasoning in Large Language Models"
- Anthropic Prompt Engineering Guide — model-specific drift patterns
- OpenAI Prompt Engineering Guide — GPT-family drift patterns

### Database schema:
- New table: `diagnosis_patterns` — mirrors anti_patterns schema with added `linkedPatternSlugs` and `linkedAntiPatternSlugs` arrays
- New table: `diagnoses` — ties scaffold session to a diagnosis event; stores outputText, diagnosisJSON, suggestedEdits, timestamp, userAcceptance of each suggestion

### tRPC procedures:
- `analysis.diagnoseOutput` — input: sessionId + outputText + optional pastedPromptText; output: structured diagnosis per schema
- `analysis.applyDiagnosisEdit` — input: sessionId + editId; effect: applies block-level edit and saves new version (Feature 3 integration)
- `knowledge.getDiagnosisPatterns` — list/filter for Diagnosis Library page

### Diagnosis response schema (JSON, strict):
```json
{
  "driftMap": [
    { "blockId": "role", "status": "hit|partial|miss|not-attempted", "evidence": "..." }
  ],
  "rootCauses": [
    {
      "diagnosisPatternSlug": "...",
      "severity": "high|medium|low",
      "affectedBlocks": ["role", "format"],
      "explanation": "...",
      "evidenceInOutput": "..."
    }
  ],
  "suggestedEdits": [
    {
      "id": "edit-1",
      "blockId": "constraints",
      "editType": "append|replace|insert-example",
      "beforeText": "...",
      "afterText": "...",
      "rationale": "..."
    }
  ],
  "recommendedPatterns": ["few-shot", "self-critique"],
  "crossReferencedAntiPatterns": ["vague-verb-without-criteria"]
}
```

### UI requirements:
- New page: `/diagnose` — accessible from any saved session via "Diagnose output" action
- Input panel: output paste area (required), prompt reference (auto-filled from session, editable)
- Results panel: drift map as vertical block-aligned tracker (hit=green check, partial=amber dash, miss=red x, not-attempted=gray circle); root causes as expandable cards; suggested edits inline with accept/dismiss buttons per edit
- Each suggested edit shows mini-diff preview (before → after) before user accepts
- Accepting an edit creates a new version in session history (Feature 3 integration)
- New page: `/diagnosis-library` — mirrors Pattern Library and Anti-Pattern Library layout; browse all 25+ diagnosis patterns with filter by category and severity

### Acceptance criteria:
- Diagnosing an output against a saved session returns drift map covering every enabled block
- At least one suggested edit returned for any diagnosis with at least one miss or partial
- Accepted edits create a new session version and surface in version history (Feature 3)
- Diagnosis Library page renders all 25+ entries with working filters
- Tests cover: diagnosis response schema validation, edit application idempotency, cross-reference integrity between diagnosis patterns / patterns / anti-patterns

---

## Feature 2 — A/B Comparison with Win-Rate Tracking

### What it is
Run two prompt variants against the same input. Display outputs side-by-side. User rates outputs (pairwise preference is primary; individual ratings secondary). System tracks win rates over time per variant, per pattern, per user.

### Research foundation (required in feature documentation):
- Chiang et al. (2024) — "Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference" — primary methodology for pairwise preference tracking
- Zheng et al. (2023) — "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" — statistical considerations for preference aggregation
- Bai et al. (2022) — "Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback" — pairwise comparison as reliability superior to absolute rating

**Why pairwise, not absolute:** absolute rating ("rate this output 1–5") has well-documented calibration problems. Pairwise preference is the methodology used by every major LLM evaluation platform.

### Database schema:
- New table: `comparison_runs` — ties two variants to a session, stores input, both outputs, timestamps, model used for each
- New table: `comparison_verdicts` — stores userId, comparisonRunId, preference (a|b|tie|both-bad), optional per-output rating (1–5), optional reason tags (accuracy, tone, format, concision, creativity, safety), free-text notes
- Indexed aggregation view: `variant_winrates` — user-scoped rollups of win rate per variant type (terse/detailed/chain-of-thought/custom), per pattern applied, per model targeted, per domain

### tRPC procedures:
- `analysis.runComparison` — input: sessionId + variantAIds + variantBIds + inputText; effect: runs both variants against input in parallel, stores results
- `analysis.recordVerdict` — input: comparisonRunId + verdict object; stores the verdict
- `knowledge.getWinRates` — returns user's win-rate aggregations for the Insights page (Feature 4)

### UI requirements:
- New page: `/compare/:sessionId` — accessible from Variant view
- Left-right split: Variant A / Variant B with full prompt scaffolds visible above outputs (collapsible)
- Single shared input field at top; "Run both" button streams both outputs concurrently
- Below outputs: preference selector (A / B / tie / both-bad), optional per-output rating, optional reason tags, optional notes
- "Next comparison" button runs same variants against different input (for robustness)
- Aggregation strip at bottom showing running win rate for this session's comparisons
- Integration with existing Variants page: "Compare variants" button routes here

### Acceptance criteria:
- Running a comparison streams both outputs in parallel, not sequentially
- Verdict submission is idempotent — re-submitting for same comparisonRunId updates existing verdict
- Win-rate aggregations update within 2 seconds of verdict submission
- The Insights page (Feature 4) surfaces win-rate data within first render
- Tests cover: parallel streaming, verdict idempotency, aggregation correctness across at least three distinct variant types

---

## Feature 3 — Version History with Diff View

### What it is
Every scaffold edit creates a new version. Users can see diffs between any two versions, roll back to any prior version, and understand the lineage of their prompt over time.

### Technical foundation:
- Myers diff algorithm (Myers, 1986) — implemented via the `diff` npm package
- Version storage strategy: full snapshots (not deltas). Disk is cheap, correctness is expensive. Scaffold version is small (< 10 KB typical).

### Database schema:
- New table: `scaffold_versions` — sessionId, versionNumber (monotonic per session), fullSnapshot JSON (all blocks at this point in time), createdAt, createdBy (user | diagnosis | pattern-apply | swarm-sync | discovery | reverse), changeSummary (short human-readable string), parentVersionId
- Index: (sessionId, versionNumber) unique

### Version creation triggers (MANDATORY — no silent state changes):
- Any scaffold block edit via the builder
- Any accepted diagnosis edit (Feature 1)
- Any pattern application from the Pattern Library
- Any reverse-mode re-analysis applied to an existing session
- Any swarm template application

Every one of these actions must produce a version with explicit `createdBy` value and a `changeSummary` that a user can read and understand.

### tRPC procedures:
- `sessions.listVersions` — input: sessionId; output: ordered list of versions with summaries and createdBy metadata
- `sessions.getVersion` — input: sessionId + versionNumber; output: full snapshot
- `sessions.diffVersions` — input: sessionId + versionA + versionB; output: per-block diff structure (block-level add/remove/modify, with line-level diffs inside modified blocks)
- `sessions.rollbackToVersion` — input: sessionId + versionNumber; effect: creates new version whose content matches target version, with `createdBy: "rollback"` and changeSummary referencing source version

### Diff output schema:
```json
{
  "blockDiffs": [
    {
      "blockId": "role",
      "changeType": "added|removed|modified|unchanged",
      "lineChanges": [
        { "type": "add|remove|context", "lineNumber": 3, "text": "..." }
      ]
    }
  ]
}
```

### UI requirements:
- New sidebar panel on Scaffold Builder: "History" — collapsible list of all versions for this session with timestamp, createdBy badge (color-coded by source), and changeSummary
- Click any version to view it read-only
- Select any two versions → "Compare" button opens split-view diff page at `/session/:id/diff/:a/:b`
- Diff view: left pane = version A, right pane = version B; modified blocks show inline line-level diff with add/remove highlighting; unchanged blocks collapsed by default
- "Rollback to this version" button on any historical version with confirmation modal
- Rollback creates a new version (never rewrites history) — important for auditability

### Acceptance criteria:
- Every triggering action creates exactly one version with correct `createdBy` attribution
- Diffing any two versions returns block-aligned diff structure with accurate line-level changes
- Rollback creates a new version; rolled-back state accessible via version number, never by mutation
- Version history UI renders at least 50 versions without performance degradation (virtualized list if needed)
- Tests cover: version creation on each trigger type, diff correctness for add/remove/modify at block and line level, rollback idempotency, parent-child lineage integrity

---

## Feature 4 — Personal Pattern Learning

### What it is
Over time, as user accumulates sessions, diagnoses, and verdicts, surface patterns in their own prompting behavior. Analytics, not machine learning — deterministic aggregation and rules over user's own data.

### What gets surfaced:
1. **Most-reached-for patterns** — "You apply Chain-of-Thought in 60% of your reasoning-domain sessions"
2. **Consistent under-specifications** — "In the last 20 sessions, you disabled the Audience block 80% of the time. Your lowest-rated outputs all had Audience disabled."
3. **Variant-type win-rate preferences** — "Your Detailed variants win 64% of comparisons. Terse variants win 21%."
4. **Model-specific performance** — "Your prompts score highest on Claude 3.5 Sonnet and lowest on GPT-4o-mini — consider promoting Sonnet as your default."
5. **Diagnosis recurrence** — "The 'vague-verb-without-criteria' diagnosis has appeared in 7 of your last 15 sessions. Consider adding success criteria earlier in your workflow."
6. **Domain drift** — "You have 43 sessions in software-engineering and 2 in creative-writing. Domain-specific patterns are available that you have not tried."

### Insight generation strategy — rules, not ML:
Each insight type is a deterministic SQL aggregation plus a threshold rule. Not generative AI. Insights are computed, not hallucinated. Every insight surfaced must be traceable to a specific query over the user's real data.

### Insight ruleset (minimum 12 rules — real, implemented, not placeholder):
1. Pattern application frequency per domain (reached-for)
2. Block disablement rate correlated with output rating (under-specification)
3. Variant type win rate from comparison verdicts (preference)
4. Model-specific rating distribution (performance)
5. Diagnosis pattern recurrence (recurrence)
6. Domain distribution (drift)
7. Session length trend over time (engagement)
8. Reverse-mode usage rate (learning behavior)
9. Swarm composition frequency (multi-agent adoption)
10. Pattern-to-verdict correlation (what wins)
11. Anti-pattern flag acceptance rate (self-correction)
12. Rollback frequency per session (indecision signal)

### Database schema:
- No new tables required — reads from existing tables (sessions, scaffold_versions, comparison_verdicts, diagnoses)
- New indexed view: `user_insights` — materialized nightly for performance, queryable for Insights page

### tRPC procedures:
- `knowledge.getInsights` — input: userId (from auth context); output: ordered list of insights with rule source, value, threshold met, and human-readable conclusion
- Each insight returned must carry a `ruleSlug` so user can trace it back

### UI requirements:
- New page: `/insights` — accessible from main nav
- Layout: vertical list of insight cards, ordered by actionability (actionable insights first, informational last)
- Each insight card: icon (category-based), headline conclusion, supporting number, "why this matters" expansion, optional CTA ("Apply Few-Shot to your next session", "Try Gemini on your next reasoning prompt")
- Filter by category: behavioral / performance / recurrence / drift
- "Export insights as markdown" action for users who want to share or save their patterns

### Acceptance criteria:
- Every surfaced insight is traceable to a deterministic SQL query — no synthesized or hallucinated insights
- Users with fewer than 5 sessions see a "not enough data yet" state, not speculative insights
- At least 12 rules are implemented, each with real data-backed output
- Tests cover: each rule's SQL correctness against seeded test data, threshold behavior at boundary values, empty-data graceful degradation

---

## Cross-cutting requirements
- **Streaming:** All LLM-dependent procedures (diagnoseOutput, runComparison) must use existing SSE streaming infrastructure. No blocking calls.
- **Schema response enforcement:** All LLM-dependent procedures must use `response_format: { type: "json_schema", strict: true }` as the existing analysis router does. No loose JSON parsing.
- **Type safety:** All new schemas must be Zod-validated at the tRPC boundary and typed end-to-end to the client. TypeScript strict mode remains on.
- **Accessibility:** All new UI meets WCAG AA. Diff views must not rely on color alone — use text markers (+, –) in addition to color for add/remove.
- **Test coverage:** Phase 6 must add at least 40 new test cases across the four features, bringing total from 137 to 177+. Follow the phase-numbered test file convention (server/phase6.test.ts).

---

## Seed datasets required in this phase

| Dataset | Minimum count | Primary sources |
|---|---|---|
| Diagnosis patterns | 25 | Dhuliawala 2023, Madaan 2023, Shinn 2023, Anthropic/OpenAI guides |
| Insight rules | 12 | Implemented as SQL + threshold rules, not a seed file |

The diagnosis pattern seed file must follow the same format as the existing pattern/anti-pattern seed files, with real citations in the file header comment and real worked examples per entry.
