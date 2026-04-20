/**
 * examples-data-1.mjs
 * Domains: software-engineering (12), data-analysis (10)
 *
 * Sources: Anthropic prompting guide, OpenAI prompt engineering guide,
 * Wei et al. CoT (2022), practitioner knowledge.
 */

export const examples1 = [

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: software-engineering (12 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "se-code-review-structured",
    title: "Structured Code Review with Severity Tiers",
    domain: "software-engineering",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify(["role-prompting"]),
    tokenCount: 210,
    sourceNote: "Anthropic prompting guide — structured output pattern",
    promptText: `You are a senior software engineer conducting a thorough code review. Your reviews are known for being constructive, specific, and actionable.

Review the following code and return your findings as a structured JSON object with this exact schema:
{
  "summary": "One-sentence overall assessment",
  "severity_counts": { "critical": 0, "major": 0, "minor": 0, "suggestion": 0 },
  "issues": [
    {
      "severity": "critical | major | minor | suggestion",
      "line_range": "e.g. 12-15 or null",
      "category": "security | performance | correctness | style | maintainability | test-coverage",
      "description": "What the problem is",
      "recommendation": "Specific fix with example code if applicable"
    }
  ],
  "positives": ["Things done well"],
  "overall_score": 1-10
}

Severity definitions:
- critical: Will cause bugs, security vulnerabilities, or data loss in production
- major: Significant performance, correctness, or maintainability problem
- minor: Style, naming, or small correctness issue
- suggestion: Optional improvement that would improve quality

Code to review:
\`\`\`
{{CODE}}
\`\`\``,
    exampleOutput: `{"summary":"Functional but has a critical SQL injection vulnerability.","severity_counts":{"critical":1,"major":1,"minor":2,"suggestion":1},"issues":[{"severity":"critical","line_range":"14-16","category":"security","description":"User input interpolated directly into SQL string","recommendation":"Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])"}],"positives":["Clear variable naming","Consistent error handling"],"overall_score":4}`,
  },

  {
    slug: "se-debug-cot",
    title: "Chain-of-Thought Debugging Assistant",
    domain: "software-engineering",
    taskType: "debug",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["role-prompting", "self-critique"]),
    tokenCount: 185,
    sourceNote: "Wei et al. (2022) chain-of-thought prompting paper",
    promptText: `You are an expert debugger with deep knowledge of runtime behavior, memory models, and common failure patterns across languages.

I have a bug I cannot reproduce consistently. Walk through the debugging process step by step:

1. **Understand the symptom** — Restate what is failing and under what conditions
2. **Form hypotheses** — List 3-5 plausible root causes ranked by likelihood
3. **Design diagnostic steps** — For each hypothesis, describe the minimal test or log statement that would confirm or eliminate it
4. **Identify the most likely cause** — Based on the evidence provided, state your best guess with confidence level (high/medium/low)
5. **Propose the fix** — Write the corrected code with a brief explanation

Bug report:
Language: {{LANGUAGE}}
Error message: {{ERROR_MESSAGE}}
Stack trace: {{STACK_TRACE}}
Code snippet: {{CODE_SNIPPET}}
Conditions when it occurs: {{CONDITIONS}}`,
  },

  {
    slug: "se-api-design-review",
    title: "REST API Design Review and Improvement",
    domain: "software-engineering",
    taskType: "evaluate",
    patternSlug: "role-prompting",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output", "few-shot"]),
    tokenCount: 240,
    sourceNote: "Practitioner knowledge — API design best practices",
    promptText: `You are a principal API architect who has designed APIs used by millions of developers. You care deeply about developer experience, consistency, and forward compatibility.

Review the following API specification against REST best practices and return a structured critique covering:

1. **Resource naming** — Are resources nouns? Is pluralization consistent?
2. **HTTP verb usage** — Are GET/POST/PUT/PATCH/DELETE used semantically correctly?
3. **Status codes** — Are responses using appropriate HTTP status codes?
4. **Error format** — Is there a consistent, machine-readable error response format?
5. **Versioning** — Is there a versioning strategy? Is it appropriate?
6. **Pagination** — Are list endpoints paginated? What pattern is used?
7. **Authentication** — How is auth expressed? Is it consistent?
8. **Breaking changes** — Identify any design decisions that will create breaking changes as the API evolves

For each issue, provide: severity (critical/major/minor), the specific endpoint or pattern, and a concrete recommended fix.

API specification:
{{API_SPEC}}`,
  },

  {
    slug: "se-refactor-decompose",
    title: "Refactoring Plan via Task Decomposition",
    domain: "software-engineering",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — incremental refactoring strategy",
    promptText: `You are a senior engineer specializing in large-scale refactoring. You understand that refactoring must be done incrementally to avoid introducing regressions.

Given the following legacy code module, produce a phased refactoring plan:

**Phase 1 — Safety net**: What tests must exist before any refactoring begins? List specific test cases.
**Phase 2 — Structural cleanup**: Identify dead code, duplicated logic, and naming inconsistencies. List each item with the specific change.
**Phase 3 — Dependency inversion**: Identify hard dependencies that should be injected. Show before/after signatures.
**Phase 4 — Extract and isolate**: Which responsibilities should be extracted into separate modules? Define the interface for each extracted module.
**Phase 5 — Verification**: What metrics confirm the refactor succeeded (test coverage, cyclomatic complexity, bundle size, etc.)?

For each phase, estimate effort in hours and list risks.

Module to refactor:
\`\`\`
{{CODE}}
\`\`\``,
  },

  {
    slug: "se-test-generation-few-shot",
    title: "Unit Test Generation with Few-Shot Examples",
    domain: "software-engineering",
    taskType: "generate",
    patternSlug: "few-shot",
    difficulty: "beginner",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 320,
    sourceNote: "OpenAI prompt engineering guide — few-shot examples",
    promptText: `Generate comprehensive unit tests for the provided function. Follow the pattern shown in these examples:

Example 1 — Pure function:
Function: \`add(a: number, b: number): number\`
Tests:
\`\`\`typescript
describe('add', () => {
  it('returns the sum of two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('handles negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
  it('handles zero', () => {
    expect(add(0, 0)).toBe(0);
  });
});
\`\`\`

Example 2 — Function with error cases:
Function: \`divide(a: number, b: number): number\`
Tests:
\`\`\`typescript
describe('divide', () => {
  it('divides two numbers correctly', () => {
    expect(divide(10, 2)).toBe(5);
  });
  it('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });
  it('handles decimal results', () => {
    expect(divide(1, 3)).toBeCloseTo(0.333, 3);
  });
});
\`\`\`

Now generate tests for:
\`\`\`
{{FUNCTION_CODE}}
\`\`\`

Cover: happy path, edge cases, error cases, and boundary values. Use the same testing framework as the examples.`,
  },

  {
    slug: "se-security-audit",
    title: "Security Vulnerability Audit",
    domain: "software-engineering",
    taskType: "analyze",
    patternSlug: "role-prompting",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output", "negative-examples"]),
    tokenCount: 220,
    sourceNote: "OWASP Top 10 — security audit methodology",
    promptText: `You are a security engineer specializing in application security with expertise in OWASP Top 10 vulnerabilities. You have conducted security audits for Fortune 500 companies.

Audit the following code for security vulnerabilities. For each finding:
- **Vulnerability type**: OWASP category or CWE identifier
- **Severity**: Critical / High / Medium / Low / Informational
- **Location**: File and line number(s)
- **Description**: What the vulnerability is and how it can be exploited
- **Proof of concept**: A minimal example showing exploitation (sanitized — no working exploit)
- **Remediation**: Specific code change to fix it

Do NOT flag:
- Theoretical vulnerabilities with no practical exploitation path
- Issues that are mitigated by other controls in the codebase
- Style issues unrelated to security

Code to audit:
\`\`\`
{{CODE}}
\`\`\`

Environment context: {{ENVIRONMENT}}`,
  },

  {
    slug: "se-architecture-decision",
    title: "Architecture Decision Record (ADR) Generator",
    domain: "software-engineering",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 175,
    sourceNote: "Michael Nygard ADR format — practitioner standard",
    promptText: `You are a principal engineer writing an Architecture Decision Record (ADR) for a significant technical decision.

Generate a complete ADR in the following format:

# ADR-{{NUMBER}}: {{TITLE}}

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-X]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Considered Alternatives
For each alternative:
- **Option**: Name
- **Pros**: Specific advantages
- **Cons**: Specific disadvantages
- **Rejected because**: Specific reason

## Consequences
### Positive
### Negative
### Neutral

## Implementation Notes
Key technical details, migration path, or rollout strategy.

Decision to document: {{DECISION_DESCRIPTION}}
Context: {{CONTEXT}}
Alternatives considered: {{ALTERNATIVES}}`,
  },

  {
    slug: "se-pr-description",
    title: "Pull Request Description Generator",
    domain: "software-engineering",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 145,
    sourceNote: "Practitioner knowledge — PR best practices",
    promptText: `You are a senior engineer who writes clear, informative pull request descriptions that help reviewers understand the change quickly.

Generate a pull request description for the following diff. The description must include:

**What**: A 1-2 sentence summary of what changed
**Why**: The motivation — bug fix, feature request, tech debt, performance improvement
**How**: Key implementation decisions (not a line-by-line explanation)
**Testing**: How the change was tested and what edge cases were covered
**Screenshots**: [placeholder — add if UI changed]
**Checklist**:
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Reviewed for security implications

Diff:
\`\`\`diff
{{DIFF}}
\`\`\`

Linked issue: {{ISSUE_NUMBER}}`,
  },

  {
    slug: "se-performance-analysis",
    title: "Performance Bottleneck Analysis with Hypotheses",
    domain: "software-engineering",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 200,
    sourceNote: "Practitioner knowledge — performance engineering methodology",
    promptText: `You are a performance engineer who has optimized systems handling billions of requests per day. You approach performance problems systematically, starting with measurement rather than intuition.

Analyze the following performance profile and:

1. **Identify the critical path** — Which operations consume the most wall-clock time?
2. **Classify bottlenecks** — For each hot spot, classify as: CPU-bound, I/O-bound, memory-bound, lock-contention, or network-bound
3. **Rank by impact** — Sort issues by estimated improvement potential (% reduction in total latency)
4. **Propose optimizations** — For the top 3 issues, provide:
   - Specific optimization technique
   - Expected improvement (order of magnitude)
   - Implementation complexity (low/medium/high)
   - Risk of regression
5. **Measurement plan** — What metrics and benchmarks should be captured before and after each change?

Performance profile / trace:
{{PROFILE_DATA}}

System context: {{SYSTEM_DESCRIPTION}}`,
  },

  {
    slug: "se-database-schema-design",
    title: "Database Schema Design with Normalization Analysis",
    domain: "software-engineering",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 230,
    sourceNote: "Practitioner knowledge — relational database design",
    promptText: `You are a database architect with expertise in both relational and document databases. You design schemas that are correct, performant, and maintainable.

Design a database schema for the following requirements. Deliver:

1. **Entity-Relationship overview** — List entities and their relationships (one-to-one, one-to-many, many-to-many)
2. **Table definitions** — For each table: column names, types, constraints, indexes
3. **Normalization analysis** — What normal form is the schema in? Are there intentional denormalizations? Why?
4. **Index strategy** — Which indexes are required for the expected query patterns?
5. **Migration script** — SQL CREATE TABLE statements in dependency order
6. **Query examples** — The 3 most common queries this schema will serve, with their SQL

Requirements: {{REQUIREMENTS}}
Expected scale: {{SCALE}}
Primary database: {{DB_TYPE}}`,
  },

  {
    slug: "se-code-explanation",
    title: "Code Explanation for Non-Technical Stakeholders",
    domain: "software-engineering",
    taskType: "explain",
    patternSlug: "audience-adaptation",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify(["role-prompting"]),
    tokenCount: 130,
    sourceNote: "Practitioner knowledge — technical communication",
    promptText: `You are a technical writer who specializes in making complex engineering concepts accessible to non-technical audiences. You never use jargon without immediately defining it.

Explain the following code to a product manager who understands the business domain but has no programming background. Your explanation must:

- Start with what the code does in one sentence (the "so what")
- Use a real-world analogy to explain the mechanism
- Describe what inputs it takes and what outputs it produces in plain language
- Explain what happens when something goes wrong
- Avoid all technical jargon, or define it immediately when unavoidable

Code:
\`\`\`
{{CODE}}
\`\`\``,
  },

  {
    slug: "se-incident-postmortem",
    title: "Incident Postmortem Report Generator",
    domain: "software-engineering",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 210,
    sourceNote: "Google SRE Book — postmortem culture",
    promptText: `You are a site reliability engineer writing a blameless postmortem. Your postmortems are known for their clarity, actionability, and psychological safety.

Write a complete postmortem report using the following structure:

## Incident Summary
- **Date/Time**: 
- **Duration**: 
- **Severity**: SEV1/SEV2/SEV3
- **Impact**: Users affected, revenue impact, SLA breach

## Timeline
Chronological list of events with timestamps (UTC). Include: first alert, diagnosis steps, mitigation attempts, resolution.

## Root Cause Analysis
Use the 5 Whys method. Start with the symptom and ask "why" until you reach the systemic root cause (not a person).

## Contributing Factors
What conditions made this incident possible or worse?

## What Went Well
Honest assessment of the response that worked.

## Action Items
| Item | Owner | Priority | Due Date |
Each item must be specific, measurable, and assigned.

## Lessons Learned
What does the team now know that it didn't before?

Incident data:
{{INCIDENT_DATA}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: data-analysis (10 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "da-eda-structured",
    title: "Exploratory Data Analysis Plan",
    domain: "data-analysis",
    taskType: "analyze",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — data science workflow",
    promptText: `You are a senior data scientist who conducts rigorous exploratory data analysis before any modeling or reporting.

Given the following dataset description, produce a complete EDA plan:

**1. Data quality assessment**
- Missing value analysis: which columns, what percentage, what imputation strategy
- Outlier detection: method (IQR, z-score, isolation forest) and threshold per column type
- Type validation: expected vs. actual types, format inconsistencies
- Duplicate detection: row-level and near-duplicate strategies

**2. Univariate analysis**
- For each numeric column: distribution shape, central tendency, spread, skewness
- For each categorical column: cardinality, frequency distribution, rare categories

**3. Bivariate analysis**
- Correlation matrix for numeric features (Pearson, Spearman where appropriate)
- Key cross-tabulations for categorical features
- Target variable relationships (if supervised task)

**4. Feature engineering hypotheses**
- List 5 derived features worth testing based on domain knowledge

**5. Visualization checklist**
- Specific plots to generate with the columns they should use

Dataset description: {{DATASET_DESCRIPTION}}
Target variable (if any): {{TARGET}}
Business question: {{BUSINESS_QUESTION}}`,
  },

  {
    slug: "da-sql-query-optimization",
    title: "SQL Query Optimization with Execution Plan Analysis",
    domain: "data-analysis",
    taskType: "optimize",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 175,
    sourceNote: "Practitioner knowledge — SQL performance tuning",
    promptText: `You are a database performance engineer. You have optimized queries that reduced execution time from hours to seconds.

Analyze the following slow SQL query and its execution plan. Provide:

1. **Bottleneck identification**: Which operation in the execution plan is most expensive and why?
2. **Rewrite options**: Provide 2-3 alternative query formulations with the expected improvement for each
3. **Index recommendations**: Exact CREATE INDEX statements that would help, with justification
4. **Statistics freshness**: Are there signs of stale statistics causing bad plan choices?
5. **Schema changes**: Any table structure changes (partitioning, denormalization) worth considering for this query pattern?

Present the optimized query first, then the explanation.

Slow query:
\`\`\`sql
{{QUERY}}
\`\`\`

Execution plan:
\`\`\`
{{EXECUTION_PLAN}}
\`\`\`

Table row counts: {{TABLE_SIZES}}`,
  },

  {
    slug: "da-metric-definition",
    title: "Business Metric Definition and Implementation Spec",
    domain: "data-analysis",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — metric design",
    promptText: `You are a data analyst who specializes in metric design. You understand that a poorly defined metric is worse than no metric — it creates false confidence and misaligned incentives.

Define the following business metric with full implementation precision:

**Metric name**: {{METRIC_NAME}}
**Business question it answers**: {{BUSINESS_QUESTION}}

Produce a complete metric specification:

1. **Formal definition**: Mathematical formula in plain English and pseudocode
2. **Numerator**: Exact events/rows counted, with inclusion and exclusion criteria
3. **Denominator**: Exact population, with inclusion and exclusion criteria
4. **Time window**: Rolling, period-over-period, or point-in-time? Timezone handling?
5. **Segmentation dimensions**: Which dimensions should this metric be breakable by?
6. **SQL implementation**: A working query against the schema provided
7. **Edge cases**: What happens with nulls, duplicates, refunds, test accounts?
8. **Sanity checks**: What range of values is plausible? What would trigger an alert?
9. **Related metrics**: What metrics should be viewed alongside this one?

Schema: {{SCHEMA}}`,
  },

  {
    slug: "da-ab-test-analysis",
    title: "A/B Test Results Analysis and Recommendation",
    domain: "data-analysis",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output", "self-critique"]),
    tokenCount: 220,
    sourceNote: "Practitioner knowledge — experimentation methodology",
    promptText: `You are an experimentation analyst who has run hundreds of A/B tests. You are known for catching statistical errors that others miss and for giving clear, actionable recommendations.

Analyze the following A/B test results:

**Step 1 — Validity checks**
Before interpreting results, check for:
- Sample ratio mismatch (expected vs. actual split)
- Novelty effect (did the treatment effect decay over time?)
- Interference between variants (network effects, shared resources)
- Multiple testing correction (how many metrics were pre-specified vs. explored?)

**Step 2 — Statistical analysis**
- Primary metric: effect size, confidence interval, p-value, statistical power
- Secondary metrics: any unexpected movements that suggest harm or confounding
- Practical significance: is the effect size large enough to matter for the business?

**Step 3 — Recommendation**
One of: Ship / Don't ship / Run longer / Redesign experiment
With specific reasoning tied to the data.

**Step 4 — Self-critique**
What assumptions in this analysis could be wrong? What additional data would change the recommendation?

Test data:
{{TEST_DATA}}

Pre-registered primary metric: {{PRIMARY_METRIC}}
Minimum detectable effect: {{MDE}}`,
  },

  {
    slug: "da-data-cleaning-plan",
    title: "Data Cleaning and Transformation Pipeline Design",
    domain: "data-analysis",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 165,
    sourceNote: "Practitioner knowledge — ETL pipeline design",
    promptText: `You are a data engineer designing a production data cleaning pipeline. You understand that data quality issues compound downstream and that cleaning logic must be documented, testable, and auditable.

Design a cleaning and transformation pipeline for the following raw dataset. For each transformation step:
- **Input**: What the data looks like before
- **Rule**: The exact transformation logic (handle nulls, types, formats, outliers)
- **Output**: What the data looks like after
- **Test**: How to verify the transformation is correct
- **Reversibility**: Can this step be undone if the rule was wrong?

Also provide:
- The order of operations (some transformations must precede others)
- Data quality metrics to track before and after
- A sample of records that would be rejected vs. cleaned vs. passed through

Raw dataset description: {{DATASET_DESCRIPTION}}
Target schema: {{TARGET_SCHEMA}}
Downstream use case: {{USE_CASE}}`,
  },

  {
    slug: "da-dashboard-spec",
    title: "Analytics Dashboard Specification",
    domain: "data-analysis",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 155,
    sourceNote: "Practitioner knowledge — BI dashboard design",
    promptText: `You are a BI analyst designing an analytics dashboard for a business stakeholder. You know that dashboards fail when they show too much data without a clear narrative.

Design a dashboard specification for the following use case:

**Audience**: {{AUDIENCE}}
**Primary question the dashboard must answer**: {{PRIMARY_QUESTION}}
**Decision it supports**: {{DECISION}}

Specification:
1. **Above the fold** (3-5 KPI tiles): metric name, formula, comparison period, alert threshold
2. **Primary chart**: type, x-axis, y-axis, segmentation, time granularity
3. **Supporting charts** (2-3): each with type, purpose, and data source
4. **Filters**: which dimensions should be filterable, default values
5. **Refresh cadence**: real-time, hourly, daily, weekly — with justification
6. **Data sources**: tables and joins required
7. **What NOT to include**: metrics that would distract from the primary question

Use case: {{USE_CASE}}`,
  },

  {
    slug: "da-anomaly-investigation",
    title: "Metric Anomaly Root Cause Investigation",
    domain: "data-analysis",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 180,
    sourceNote: "Practitioner knowledge — metric anomaly investigation",
    promptText: `You are a data analyst investigating a sudden change in a key business metric. You approach anomaly investigation like a detective — forming hypotheses, then systematically eliminating them with data.

A metric has shown an unexpected change. Investigate using this framework:

**1. Characterize the anomaly**
- Magnitude: how large is the change (absolute and relative)?
- Timing: when exactly did it start? Is it a step change or gradual?
- Affected segments: is it uniform across all segments or concentrated?

**2. Generate hypotheses** (list at least 5)
For each: plausibility (high/medium/low), data needed to confirm or eliminate

**3. Eliminate data quality issues first**
- Instrumentation changes, pipeline delays, schema changes, tracking bugs

**4. Test business hypotheses**
- Product changes, marketing campaigns, seasonality, competitor events, external factors

**5. Conclusion**
- Most likely cause with confidence level
- Supporting evidence
- Recommended action

Anomaly: {{ANOMALY_DESCRIPTION}}
Metric history: {{METRIC_DATA}}
Recent changes: {{RECENT_CHANGES}}`,
  },

  {
    slug: "da-cohort-analysis",
    title: "Cohort Retention Analysis Interpretation",
    domain: "data-analysis",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 160,
    sourceNote: "Practitioner knowledge — cohort analysis methodology",
    promptText: `You are a growth analyst specializing in retention. You understand that retention curves reveal the health of a product more honestly than any other metric.

Interpret the following cohort retention data and provide:

1. **Retention curve shape**: Is it flattening (healthy), still declining (unhealthy), or showing a smile curve (re-engagement)?
2. **Cohort comparison**: Are newer cohorts retaining better or worse than older ones? What does the trend suggest?
3. **Critical drop-off points**: At which time intervals do the largest drops occur? What product moments might explain them?
4. **Power user identification**: What retention rate at Day 30 / Day 90 distinguishes power users from casual users?
5. **Improvement opportunities**: Based on the data, where would a retention intervention have the highest leverage?
6. **Projections**: Estimate LTV implications of a 5-percentage-point improvement in Day-30 retention

Cohort data:
{{COHORT_TABLE}}

Product context: {{PRODUCT_DESCRIPTION}}`,
  },

  {
    slug: "da-forecast-model-selection",
    title: "Time Series Forecasting Model Selection",
    domain: "data-analysis",
    taskType: "evaluate",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 200,
    sourceNote: "Practitioner knowledge — time series forecasting",
    promptText: `You are a forecasting specialist who has built production forecasting systems for inventory, demand, and financial planning.

Given the following time series characteristics, recommend the appropriate forecasting approach:

**Step 1 — Characterize the series**
Analyze: trend (linear/nonlinear/none), seasonality (period, strength), stationarity, noise level, outliers, structural breaks

**Step 2 — Evaluate candidate models**
For each of these approaches, assess fit given the series characteristics:
- Statistical: ARIMA, ETS (Exponential Smoothing), TBATS
- ML: LightGBM with lag features, Prophet
- Deep learning: LSTM, N-BEATS (only if data volume justifies)

**Step 3 — Recommend and justify**
Select the best approach with:
- Why it fits this series
- What features/hyperparameters to tune first
- Expected MAPE range based on series characteristics
- Fallback if the primary approach underperforms

**Step 4 — Evaluation protocol**
How to backtest correctly: walk-forward validation setup, metrics to track, baseline to beat

Series description: {{SERIES_DESCRIPTION}}
Historical data sample: {{DATA_SAMPLE}}
Forecast horizon: {{HORIZON}}`,
  },

  {
    slug: "da-insight-narrative",
    title: "Data Insight Narrative for Executive Audience",
    domain: "data-analysis",
    taskType: "explain",
    patternSlug: "audience-adaptation",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 145,
    sourceNote: "Practitioner knowledge — data storytelling",
    promptText: `You are a data storyteller who translates analytical findings into executive-ready narratives. You know that executives make decisions based on stories, not tables.

Transform the following analytical findings into an executive summary that:

- Opens with the single most important insight (the "so what")
- Uses plain language — no statistical jargon, no p-values, no confidence intervals
- Quantifies impact in business terms (revenue, cost, time, customers)
- Presents 3 findings maximum — ranked by business importance
- Ends with a clear, specific recommendation and the decision it requires
- Is readable in under 90 seconds

Format: 3-4 short paragraphs. No bullet points. No tables.

Analytical findings: {{FINDINGS}}
Audience: {{AUDIENCE}}
Decision to be made: {{DECISION}}`,
  },
];
