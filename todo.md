# Promptwright — Project TODO

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
- [x] Evaluate "Prompitect" vs alternatives; renamed to Promptwright

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
- [x] "Promptwright — by ASSESS LLC" in all swarm export documents

### GitHub Repository Rename
- [x] GitHub repository renamed from prompitect to Promptwright
- [x] Git remote URL updated to Howie8erHole/Promptwright
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
- [ ] webdev_save_checkpoint — pending
- [ ] Push to GitHub — pending
- [ ] Update prompitect-engineer skill with Phase 5 additions — pending
