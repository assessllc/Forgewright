# Prompitect — Project TODO

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
- [ ] Add SSE endpoint in Express server for streaming LLM responses
- [ ] Stream Discovery chat responses token-by-token
- [ ] Stream Reverse Mode analysis token-by-token
- [ ] Frontend: EventSource client hook for consuming SSE streams
- [ ] Frontend: Animated typing indicator replaced by live token stream
- [ ] Graceful fallback if streaming fails

### Task 2: Pattern Library — Apply to Scaffold
- [ ] "Apply Pattern" button on each pattern card in Pattern Library
- [ ] Pattern application modal: preview what blocks will be injected/modified
- [ ] Inject pattern's example blocks into the scaffold builder state
- [ ] Navigate to scaffold builder with pattern pre-applied
- [ ] Visual indicator on blocks showing which pattern they came from
- [ ] Handle conflict: warn if existing block content will be overwritten

### Task 3: 100+ Real Example Prompt Library
- [ ] Schema: example_prompts table (already exists) — verify fields
- [ ] Seed 100+ real, domain-diverse prompts with full metadata
  - [ ] Code domain: 15+ examples (review, debug, refactor, test, document, architect)
  - [ ] Writing domain: 15+ examples (email, report, blog, creative, technical, legal)
  - [ ] Data analysis domain: 12+ examples (SQL, pandas, visualization, insight extraction)
  - [ ] Research domain: 10+ examples (literature review, synthesis, fact-check, summarize)
  - [ ] Marketing domain: 10+ examples (copy, SEO, social, campaign brief, persona)
  - [ ] Education domain: 8+ examples (lesson plan, quiz, explanation, feedback)
  - [ ] Medical/Health domain: 8+ examples (patient education, clinical summary, triage)
  - [ ] Legal domain: 8+ examples (contract review, brief, compliance check, plain-language)
  - [ ] Translation domain: 6+ examples (technical, literary, localization, register-aware)
  - [ ] Product/UX domain: 8+ examples (PRD, user story, spec, critique, persona)
- [ ] Each example includes: title, domain, pattern_used, target_model_family, quality_notes, full_prompt_text, expected_output_description, tags
- [ ] Example Library browser page: search, filter by domain/pattern/model, preview full prompt
- [ ] Link examples to patterns in the Pattern Library

### GitHub & Skill
- [ ] Create new private GitHub repository: prompitect
- [ ] Push full codebase to repository
- [ ] Create prompitect-engineer skill with full workflow documentation
