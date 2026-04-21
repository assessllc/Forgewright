# Forgewright — Project TODO

## Schema & Database
- [x] Define schema: sessions, scaffold_blocks, prompt_patterns, anti_patterns, model_quirks, domain_scripts
- [x] Run migration and apply SQL
- [x] Seed 22 prompt patterns (real, researched content)
- [x] Seed 32 anti-patterns with detection rules and remediation
- [x] Seed 8 model quirks database
- [x] Seed 15 domain elicitation scripts
- [x] Seed 8 quick-start templates

## Design System & Layout
- [x] Dark editorial theme (Inter + JetBrains Mono, OKLCH colors)
- [x] Global CSS variables and typography
- [x] App shell with sidebar navigation
- [x] Route structure in App.tsx

## Home Screen (Screen 1)
- [x] Large prompt input: "Describe what you want to build…"
- [x] Quick-start template grid (8 templates)
- [x] Target model selector (Claude 3.5 Sonnet, GPT-4o, etc.)
- [x] "Reverse Mode" toggle (exact label)
- [x] Recent sessions list
- [x] Navigation to Discovery or Reverse Mode on submit

## Discovery / Intake Screen (Screen 2)
- [x] Split-view layout: chat left, spec card right
- [x] LLM-powered conversational intake
- [x] Domain auto-detection and routing
- [x] Smart defaults shown inline
- [x] Live spec card with captured/assumed/missing status
- [x] Completion progress indicator
- [x] "Skip to scaffold" escape hatch (exact label)

## Scaffold Builder Screen (Screen 3)
- [x] Vertical stack of 8 labeled blocks: Role, Context, Task, Constraints, Examples, Format, Reasoning, Output Validation
- [x] Each block: collapsible card with label, content, token count
- [x] "Why is this here?" tooltip per block (exact label)
- [x] Drag-to-reorder blocks
- [x] Toggle any block on/off
- [x] Inline editing
- [x] Right sidebar: target model selector, total token count, cost estimate per run
- [x] Model-specific optimization hints surfaced contextually
- [x] Action bar: Copy prompt, Generate variants, Save session, Export (JSON + Markdown)
- [x] Anti-pattern detector: real-time flags on active blocks

## Variant Generation (Screen 3 extension)
- [x] Generate Terse variant (exact label)
- [x] Generate Detailed variant (exact label)
- [x] Generate Chain-of-Thought variant (exact label)
- [x] Side-by-side comparison view
- [x] Copy individual variants

## Reverse Mode Screen (Screen 5)
- [x] Large paste area for example output
- [x] LLM analysis: tone, structure, patterns, inferred audience, inferred purpose
- [x] Analysis results panel display
- [x] Auto-populate scaffold from analysis and navigate to scaffold builder

## Pattern Library
- [x] Browse all 22 patterns with name, description, when-to-use, example
- [x] Filter by category
- [x] Search by name/description/tags
- [x] Source references linked

## Anti-Pattern Detector
- [x] Real-time detection on scaffold content
- [x] Flag: vague verbs without specification
- [x] Flag: conflicting instructions
- [x] Flag: instruction overload
- [x] Flag: missing success criteria
- [x] Flag: unstated audience or format
- [x] Flag: excessive politeness/hedging
- [x] Inline remediation suggestions

## Token Counter & Cost Estimator
- [x] Real-time token count per block
- [x] Total token count for assembled prompt
- [x] Cost estimate per model (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, etc.)
- [x] Context window utilization indicator

## Session Persistence
- [x] Save session to database (authenticated users)
- [x] Session list with search
- [x] Load session back into scaffold builder
- [x] Export to JSON (exact format)
- [x] Export to Markdown (exact format)
- [x] Delete sessions

## Backend / API
- [x] tRPC router: sessions (CRUD)
- [x] tRPC router: knowledge (patterns, anti-patterns, model quirks, domain scripts, templates)
- [x] tRPC router: scaffold (generate from description, generate variants, get model hints)
- [x] tRPC router: analysis (discovery chat, reverse analyze, detect anti-patterns)
- [x] Token counting utility (word-based estimation)
- [x] Cost estimation utility

## Tests
- [x] Vitest: auth.logout (baseline)
- [x] Vitest: scaffold block definitions (8 blocks, exact labels)
- [x] Vitest: token estimation logic
- [x] Vitest: MODEL_PRICING shape
- [x] Vitest: anti-pattern detection rules (vague verbs, missing criteria, overload)
- [x] Vitest: knowledge router shape tests
- [x] Vitest: sessions router shape tests
- [x] All 25 tests passing

## Phase 2 — Current Sprint

### Task 1: SSE Streaming for LLM calls
- [x] Add SSE endpoint in Express server for streaming LLM responses
- [x] Stream Discovery chat responses token-by-token
- [x] Stream Reverse Mode analysis token-by-token
- [x] Frontend: useStream hook for consuming SSE streams
- [x] Frontend: Live token streaming in Discovery and Reverse Mode
- [x] Graceful fallback if streaming fails (error event type)

### Task 2: Pattern Library — Apply to Scaffold
- [x] "Apply to scaffold" button on each pattern card in Pattern Library
- [x] Session selector dialog: choose which session to apply pattern to
- [x] scaffold.applyPattern tRPC procedure: merge pattern blocks into session
- [x] Empty blocks replaced; non-empty blocks get pattern content appended
- [x] Success toast with link to scaffold builder
- [x] Conflict handling: non-empty blocks preserved with pattern as comment

### Task 3: 100+ Real Example Prompt Library
- [x] Schema: example_prompts table created and migrated
- [x] Seeded 108 real, domain-diverse prompts across 12 domains
  - [x] software-engineering: 12 examples
  - [x] data-analysis: 10 examples
  - [x] creative-writing: 10 examples
  - [x] marketing: 10 examples
  - [x] education: 10 examples
  - [x] research: 8 examples
  - [x] customer-support: 8 examples
  - [x] legal: 8 examples
  - [x] medical: 8 examples
  - [x] finance: 8 examples
  - [x] hr: 8 examples
  - [x] product-management: 8 examples
- [x] Each example: title, domain, taskType, patternSlug, difficulty, isFeatured, testedModels, tokenCount, promptText
- [x] Example Library page (/examples): search, filter by domain/pattern/difficulty, preview full prompt
- [x] getExamples and getExample tRPC procedures in knowledge router

### GitHub & Skill
- [x] Created private GitHub repository: https://github.com/Howie8erHole/prompitect
- [x] Pushed full codebase (216 objects, 371 KB)
- [x] Created prompitect-engineer skill with full workflow documentation

## Phase 3 — Current Sprint

### Naming
- [x] Evaluate "Prompitect" vs alternatives; renamed to Forgewright

### Scaffold Builder — Provenance Badges
- [x] Render source field on ScaffoldBlock as a small colored tag in block header
- [x] Badge shows pattern name or template name that originated the block (sourceName field)
- [x] Badge only visible when source field is non-empty

### Pattern Library — Auto-Navigate After Apply
- [x] After applyPattern succeeds, redirect directly to /scaffold/:sessionId
- [x] Remove toast-only feedback; replaced with navigation + rationale banner in scaffold builder

### Example Count Expansion
- [x] 108 examples confirmed seeded across 12 domains — spec met (was already complete from Phase 2)

### Swarm Prompt Generator
- [x] New page: /swarm — "Swarm Composer" in sidebar nav
- [x] Template browser: 8 real swarm templates with topology filter and search
- [x] Agent viewer: expandable agent cards with full system prompts
- [x] Topology diagrams: visual flow for sequential, parallel, hub-spoke, hierarchical, iterative
- [x] Export: copy individual agent prompts, copy full swarm, download .md briefing
- [x] How-to-use tab with 5-step deployment guide
- [x] swarm_templates table: schema + migration applied
- [x] 8 real swarm templates seeded (content pipeline, software dev, market research, customer support, prompt refinement, sales intel, legal review, business ops)
- [x] getSwarmTemplates tRPC procedure in knowledge router

### README
- [x] README.md written: feature overview, knowledge base inventory table, research foundation, tech stack, setup guide, project status table

### Tests
- [x] Vitest tests: rename verification, SwarmAgent type structure, swarm templates DB integrity, provenance badge logic, export document format
- [x] 77/77 tests passing

## Phase 4 — Completed

### Swarm Composer Audit & Fixes
- [x] Fix marketing_lead outputTo bug (was routing to finance_lead, now routes to orchestrator)
- [x] All 8 templates confirmed: fully written system prompts, no truncation in DB

### ASSESS LLC Branding
- [x] "by ASSESS LLC" added to app sidebar footer
- [x] "by ASSESS LLC" added to the home page hero
- [x] "by ASSESS LLC" added to README
- [x] "Forgewright — by ASSESS LLC" in all swarm export documents

### GitHub Repository Rename
- [x] GitHub repository renamed from prompitect to Forgewright
- [x] Git remote URL updated to Howie8erHole/Forgewright
- [x] README clone URL updated

### Custom Swarm Builder (Example-Picker)
- [x] Top-level mode switcher: Templates | Build Your Own | My Swarms
- [x] User defines swarm name and goal
- [x] Topology selector: sequential, parallel, hub-spoke, hierarchical, iterative (with descriptions)
- [x] User adds agents: each with name, role, system prompt, inputFrom, outputTo, handoffCondition
- [x] System prompt can be typed manually OR picked from Example Library
- [x] Example picker modal: browse 108 examples with search + domain filter
- [x] Source provenance badge on agent card when prompt came from example library
- [x] Add/remove agents, collapse/expand individual agent cards
- [x] Export custom swarm as .md briefing with ASSESS LLC attribution
- [x] Copy all agent prompts to clipboard
- [x] custom_swarms DB table: schema + migration applied
- [x] swarmsRouter: list, get, create, update, delete (all protectedProcedure)
- [x] My Swarms tab: list saved swarms, load into builder, delete
- [x] Token count display per agent system prompt

### Tests
- [x] Phase 4 vitest tests: 22 tests covering swarms router, agent structure, export format, ASSESS LLC branding, seed data correctness, SwarmBuilder component
- [x] 99/99 tests passing

## Phase 5 — Completed

### Feature 1: Anti-Pattern Library Page (/antipatterns)
- [x] New page: /antipatterns — "Anti-Patterns" in sidebar nav (AlertTriangle icon)
- [x] Browse all 32 anti-patterns with name, severity badge, description
- [x] Filter by severity (low / medium / high) and category (12 categories)
- [x] Search by name and description
- [x] Detail panel: full description, detection hint, detection rules, examples, remediation, fixedByPatterns
- [x] Severity color coding: low=blue, medium=amber, high=red
- [x] Link from anti-pattern to relevant patterns in Pattern Library
- [x] getAntiPatterns tRPC procedure verified and working

### Feature 2: Model Quirks Comparison Page (/models)
- [x] New page: /models — "Model Guide" in sidebar nav (Cpu icon)
- [x] Overview cards for all 8 models (Claude 3.5 Sonnet, Claude 3 Opus, GPT-4o, GPT-4o mini, o1, Gemini 1.5 Pro, Mistral Large, Llama 3 70B)
- [x] Side-by-side comparison table: pricing, context window, streaming, JSON mode, vision, system prompt support
- [x] Per-model detail view: strengths, weaknesses, optimization tips, pricing breakdown
- [x] "Best for" tags per model (reasoning, creative, code, speed, cost)
- [x] Cost calculator: enter token count, see cost across all models
- [x] getModelQuirks tRPC procedure verified and working

### Feature 3: ASSESS Business Swarm Template
- [x] 11-agent hub-spoke swarm named "ASSESS Business Operations Command" (1 orchestrator + 10 specialists)
- [x] Orchestrator: receives business goal, routes to appropriate specialist
- [x] Niche Finder: identifies underserved market segments and opportunities
- [x] Lead Generator: researches and qualifies prospects by ICP criteria
- [x] Analytics Lead: interprets data, surfaces KPIs, flags anomalies
- [x] Social Media Manager: drafts platform-specific content and update schedules
- [x] Finance Analyst: models revenue scenarios, tracks burn rate, cash flow
- [x] Accountant: reconciles transactions, flags discrepancies, prepares summaries
- [x] Competitive Intelligence: monitors competitors, summarizes positioning changes
- [x] Product Lead: translates requirements into actionable specs
- [x] Sales Lead: qualifies pipeline, drafts outreach, tracks conversion
- [x] Customer Success: handles escalations, drafts responses, logs resolutions
- [x] All 11 agents: fully written system prompts >200 chars, real handoff conditions, ASSESS LLC attribution
- [x] Seeded and verified in DB

### Tests & Delivery
- [x] Phase 5 vitest tests: 36 tests (anti-patterns, model guide, ASSESS swarm) — 137/137 total passing
- [x] webdev_save_checkpoint — version 57080e04
- [x] Push to GitHub — f841db7..57080e0 pushed to Howie8erHole/Forgewright
- [x] Update prompitect-engineer skill with Phase 5 additions

## Phase 6 — Feedback Loop & Personal Learning

### Feature 3: Version History
- [x] scaffold_versions table: sessionId, versionNumber, fullSnapshot (JSON), createdBy (enum), changeSummary, parentVersionId, createdAt
- [x] createScaffoldVersion() helper exported from sessions router — called on create, update (when createVersion=true), rollback
- [x] listVersions tRPC procedure: returns versions for a session, newest first
- [x] getVersion tRPC procedure: returns full snapshot for a specific version
- [x] diffVersions tRPC procedure: Myers diff (via `diff` package) per-block between any two versions
- [x] rollbackToVersion tRPC procedure: creates new version with createdBy="rollback" (non-destructive)
- [x] Version History panel in ScaffoldBuilder sidebar: show/hide toggle, list up to 10 versions, rollback button per version
- [x] Migration 0005 includes scaffold_versions table

### Feature 1: Output Diagnosis
- [x] 25 diagnosis patterns seeded (seed-diagnosis-patterns.mjs) — real failure modes grounded in published research
- [x] 10 categories: reasoning-drift, hallucination, format-drift, persona-drift, scope-drift, refusal-drift, instruction-drift, output-quality, structural-drift, task-specific
- [x] diagnosis_patterns table: slug, name, category, severity, description, detectionHeuristics (JSON), canonicalRemediation, primaryAffectedBlock, exampleOutputExcerpt, suggestedBlockEdits (JSON)
- [x] diagnoses table: sessionId, outputText, promptText, diagnosisJson (JSON), editAcceptance (JSON), createdAt
- [x] getDiagnosisPatterns, getDiagnosisPattern, getDiagnosisCategories, createDiagnosis, getDiagnoses, updateDiagnosisAcceptance tRPC procedures
- [x] /api/stream/diagnose SSE endpoint: streams LLM diagnosis with structured JSON output
- [x] Diagnose page (/diagnose): paste output text, select session, stream diagnosis, show matched patterns, suggested edits with accept/dismiss
- [x] Diagnosis Library tab: browse all 25 patterns by category and severity

### Feature 2: A/B Comparison
- [x] comparison_runs table: sessionId, inputText, variantALabel/Prompt/Output, variantBLabel/Prompt/Output, targetModel, createdAt
- [x] comparison_verdicts table: comparisonRunId (unique), preference (a/b/tie/both-bad), reasonTags (JSON), notes, createdAt
- [x] createComparisonRun, updateComparisonOutputs, recordVerdict, listComparisonRuns, getWinRates tRPC procedures
- [x] /api/stream/compare SSE endpoint: streams LLM output for a single variant
- [x] Compare page (/compare): enter input + two variant prompts, stream both outputs side-by-side, record verdict with reason tags, view win rate history

### Feature 4: Personal Pattern Learning
- [x] 12 insight rules: DOMINANT_FAILURE_MODE, PREFERRED_VARIANT, ACCEPTED_PATTERN, AVOIDED_ANTIPATTERN, MODEL_AFFINITY, DIAGNOSIS_ACCEPTANCE, VERSION_CHURN, ROLLBACK_FREQUENCY, DOMAIN_CONCENTRATION, REASONING_BLOCK_USAGE, FORMAT_BLOCK_USAGE, SESSION_COMPLETION_RATE
- [x] getInsights tRPC: aggregates across sessions/diagnoses/comparisons/versions, returns typed Insight[] with confidence and dataQuality
- [x] Insights page (/insights): cards per insight with confidence badge, evidence list, actionable recommendation, data quality indicator
- [x] Nav items added: Diagnose Output (Stethoscope), A/B Compare (BarChart2), Insights (Lightbulb)

### Tests & Delivery
- [x] Phase 6 vitest tests: 57 tests — all pass (DB tests skip gracefully without DATABASE_URL)
- [x] TypeScript strict mode: zero errors
- [x] Full test suite: 158 pass, 36 skip (phase5 DB tests skip without DB — pre-existing)

## Phase 6 — Current Sprint (The Iteration Loop)

### Cleanup
- [x] Fix phase5.test.ts: replace hard throw on missing DATABASE_URL with graceful skip pattern (done in Phase 6 completed)

### Feature 3 — Version History with Diff View
- [x] scaffold_versions table: sessionId, versionNumber, fullSnapshot (JSON), createdAt, createdBy, changeSummary, parentVersionId
- [x] sessions.listVersions, getVersion, diffVersions, rollbackToVersion tRPC procedures
- [x] History sidebar panel in ScaffoldBuilder
- [x] Diff page: /session/:id/diff/:a/:b — split-view, block-aligned, line-level +/- markers
- [x] Rollback button with confirmation modal

### Feature 1 — Output Diagnosis
- [x] diagnosis_patterns seed: 25 real entries with citations
- [x] diagnosis_patterns table + diagnoses table
- [x] SSE endpoint: /api/diagnose (streaming diagnosis)
- [x] /diagnose page + /diagnosis-library page

### Feature 2 — A/B Comparison with Win-Rate Tracking
- [x] comparison_runs + comparison_verdicts tables
- [x] SSE endpoint: /api/compare (parallel streaming)
- [x] analysis.recordVerdict + knowledge.getWinRates tRPC procedures
- [x] /compare page: side-by-side streaming, preference selector, win-rate display

### Feature 4 — Personal Pattern Learning
- [x] 12 insight rules as deterministic SQL aggregations
- [x] knowledge.getInsights tRPC procedure
- [x] /insights page with empty state for <5 sessions

### Tests & Delivery
- [x] 57 Phase 6 tests in server/phase6.test.ts
- [x] All tests passing (194 at Phase 6 delivery, now 298 after pre-launch sprint)
- [x] webdev_save_checkpoint — version 26fb5e87
- [x] Push to GitHub — 5c4e994 pushed to Howie8erHole/Forgewright
- [x] Update prompitect-engineer skill with Phase 6 additions

## Phase 6 — Completed

### Cleanup
- [x] Fixed phase5.test.ts graceful skipIfNoDb pattern (was hard-throw on missing DATABASE_URL)
- [x] Installed `diff` package (was missing, causing server crash on sessions.ts import)
- [x] Applied Phase 6 DB migration (5 new tables: scaffold_versions, diagnosis_patterns, diagnoses, comparison_runs, comparison_verdicts)
- [x] Seeded 25 diagnosis patterns across 10 categories

### Feature 3: Version History
- [x] scaffold_versions table: id, sessionId, versionNumber, fullSnapshot, createdBy, changeSummary, parentVersionId, createdAt
- [x] tRPC procedures: listVersions, diffVersions (block-level diff using diff package), rollbackToVersion
- [x] ScaffoldBuilder: History panel in sidebar showing version list with timestamps and change summaries
- [x] ScaffoldDiff page (/session/:sessionId/diff/:versionA/:versionB): split-view block-aligned diff with +/- line markers

### Feature 1: Output Diagnosis
- [x] diagnosis_patterns table: 25 real patterns across 10 categories (reasoning, hallucination, format, instruction-following, etc.)
- [x] diagnoses table: stores per-session diagnosis results
- [x] SSE endpoint: /api/diagnose (streaming diagnosis)
- [x] Diagnose page (/diagnose): paste output, select session, stream diagnosis results with pattern matches
- [x] DiagnosisLibrary page (/diagnosis-library): browse all 25 patterns with search, filter, detail view

### Feature 2: A/B Comparison
- [x] comparison_runs table: sessionId, inputText, variantA/B label+prompt, status
- [x] comparison_verdicts table: comparisonRunId, preference (a/b/tie), notes
- [x] SSE endpoint: /api/compare (parallel streaming for both variants)
- [x] Compare page (/compare): side-by-side streaming output, record preference verdict, win-rate display

### Feature 4: Personal Pattern Learning
- [x] insights router: 12 deterministic SQL insight rules (no generative AI)
- [x] Insights page (/insights): aggregated insights from user's session history
- [x] Empty state for users with fewer than 5 sessions

### Navigation
- [x] All Phase 6 pages in sidebar: Diagnose Output, A/B Compare, Insights, Diagnosis Library
- [x] ScaffoldDiff accessible via History panel in ScaffoldBuilder

### Tests
- [x] phase6.test.ts: 57 tests covering all 4 features (graceful skip pattern)
- [x] phase5.test.ts: fixed graceful-skip pattern
- [x] 194/194 tests passing

### Delivery
- [x] webdev_save_checkpoint — version 26fb5e87
- [x] Push to GitHub — 5c4e994 pushed to Howie8erHole/Forgewright
- [x] Update prompitect-engineer skill — Phase 6 features, 18 pages, 11 tables, graceful skip pattern

## Bug Fixes & Rename — Current Sprint

- [x] Fix navigation trap: DiagnosisLibrary page missing AppLayout sidebar wrapper
- [x] Fix navigation trap: SwarmComposer page missing AppLayout sidebar wrapper
- [x] Fix navigation trap: ScaffoldDiff page missing AppLayout sidebar wrapper
- [x] Audit all 18 pages for consistent AppLayout wrapping (3 pages fixed; ComponentShowcase and NotFound intentionally have no sidebar)
- [x] Rename app from Promptwright → Forgewright (chosen name, no conflicts found)
- [x] Update all user-visible references: 19 files updated, 0 TS errors, 194/194 tests pass
- [x] Update prompitect-engineer skill with new name (Forgewright) — renamed Promptwright → Forgewright, added pre-launch sprint section (onboarding, test-on-model, settings, Stripe)

## Pre-Launch Sprint — Four Features

### Feature 4: Onboarding Flow (BUILD FIRST)
- [x] First-run detection: check localStorage flag `forgewright_onboarded`; show tour only once
- [x] 5-step tooltip tour using driver.js: Home input → Discovery → Scaffold Builder → Pattern Library → Reverse Mode
- [x] Each tooltip: title, 1–2 sentence explanation, "Next" / "Skip tour" controls
- [x] Tour triggered automatically on first login; also accessible via "Take the tour" link in sidebar footer
- [x] Tour state persisted in localStorage so it never re-triggers unless user resets
- [x] "What's new" dismissible banner for returning users after major updates (version-keyed)
- [x] Empty state on Sessions page for new users: guided CTA to start first session
- [x] Vitest: onboarding state logic — 15 tests, all passing (onboarding.test.ts)

### Feature 2: "Test on Model" Inline (BUILD SECOND)
- [x] "Test on [model]" button in Scaffold Builder action bar (exact label, model name dynamic)
- [x] SSE endpoint: /api/stream/test-prompt — accepts assembled prompt + model, streams output
- [x] Output panel: slides up from bottom of Scaffold Builder (40vh, no page navigation)
- [x] Streaming output rendered with Streamdown markdown component
- [x] Token count + cost display for the actual run (from usage metadata in done event)
- [x] "Diagnose this output" shortcut button in the output panel → pre-fills /diagnose with output
- [x] Error handling: model timeout, rate limit, empty prompt
- [x] Optional user input field — blank = system-prompt-only run; Enter or Re-run button to re-execute
- [x] Vitest: test-prompt SSE endpoint shape, cost calculation for actual run — 26 tests, all passing (test-prompt.test.ts)

### Feature 1: Settings Page (BUILD THIRD)
- [x] New page: /settings — "Settings" in sidebar nav (Settings/Gear icon)
- [x] Section: Default model — dropdown of all 8 supported models, saved to DB, pre-populates Discovery + Scaffold Builder
- [x] Section: Personal defaults — tone (professional/casual/technical/creative), output format (markdown/plain/json), domain focus (12 domains)
- [x] Section: API keys — Anthropic/OpenAI/Gemini; encrypted at rest (AES-256-GCM), masked display, replace/remove actions
- [x] Section: Data export — JSON download (all sessions), Markdown ZIP (one .md per session using JSZip)
- [x] Section: Profile — display name (editable), email (read-only from OAuth), plan badge, member since
- [x] Section: Account — delete account with confirmation dialog (hard delete: diagnoses → sessions → user)
- [x] DB columns added to users table: formatHabit, encryptedApiKeys, displayName, plan, stripeCustomerId, stripeSubscriptionId
- [x] settingsRouter: getPreferences, updatePreferences, setApiKey, removeApiKey, exportSessionsJson, exportSessionsMarkdown, deleteAccount, getSupportedModels
- [x] Vitest: encryption round-trip, key masking, preference validation, export shape, model list shape — 30 tests, all passing (settings.test.ts)

### Feature 3: Stripe Usage-Based Monetization (BUILD LAST)
- [x] Stripe integration via webdev_add_feature stripe
- [x] Free tier: 10 sessions/month (Discovery sessions created), all features accessible
- [x] Pro tier: $15/month — unlimited sessions, all features
- [x] usage_tracking table: userId, month (YYYY-MM), sessionCount, lastUpdated (migrated via scripts/migrate-stripe.mjs)
- [x] Session creation gate: checkUsageGate procedure; UpgradePromptModal shown when free limit hit
- [x] Pricing page: /pricing — free vs Pro comparison table, Stripe checkout button, FAQ section, test card note
- [x] Upgrade prompt modal: shown when free user hits session limit, Stripe checkout CTA, links to /pricing
- [x] Billing portal: link in Settings page to Stripe customer portal for subscription management
- [x] Webhook handler: /api/stripe/webhook registered BEFORE express.json(); handles checkout.session.completed, customer.subscription.deleted, customer.subscription.updated
- [x] user table: plan (free/pro), stripeCustomerId, stripeSubscriptionId columns added via migration
- [x] Pricing link added to sidebar footer (Zap icon)
- [x] Vitest: plan definitions, usage gate logic, webhook test event detection, pricing page shape — 33 tests, all passing (stripe.test.ts)
