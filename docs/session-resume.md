# Promptwright — Session Resume Briefing

*Last updated: end of Phase 5 session*

---

## Project Identity

- **App name:** Promptwright
- **Brand:** by ASSESS LLC
- **GitHub:** https://github.com/Howie8erHole/Promptwright
- **Dev URL:** https://3000-ipc3gpo8trczcdwqtao98-6760a638.us1.manus.computer
- **Project path:** `/home/ubuntu/prompitect`
- **Latest checkpoint:** `57080e04` (Phase 5 complete)
- **Latest git commit:** `38bb7e2` (End-of-session: mark all Phase 5 todos complete)

---

## Current State

### Tests
- **137/137 passing** across 6 test files
- TypeScript: **0 errors**
- Dev server: **200 OK**

### Pages (11 total)
| Route | Page | Status |
|---|---|---|
| `/` | Home | Complete |
| `/discovery` | Discovery (SSE streaming) | Complete |
| `/scaffold/:id` | Scaffold Builder | Complete |
| `/variants/:id` | Variant Generation | Complete |
| `/reverse` | Reverse Mode (SSE streaming) | Complete |
| `/patterns` | Pattern Library | Complete |
| `/examples` | Example Library | Complete |
| `/sessions` | Sessions | Complete |
| `/swarm` | Swarm Composer (Templates + Build Your Own + My Swarms) | Complete |
| `/antipatterns` | Anti-Pattern Library | Complete |
| `/models` | Model Guide | Complete |

### Knowledge Base (seeded in DB)
| Content | Count | Notes |
|---|---|---|
| Prompt patterns | 22 | 6 categories |
| Anti-patterns | 32 | 12 categories, severity low/medium/high |
| Model quirks | 8 | Claude 3.5 Sonnet, Claude 3 Opus, GPT-4o, GPT-4o mini, o1, Gemini 1.5 Pro, Mistral Large, Llama 3 70B |
| Domain scripts | 15 | Used by Discovery flow |
| Quick-start templates | 8 | Used by Home screen |
| Example prompts | 108 | 12 domains |
| Swarm templates | 9 | 8 original + ASSESS Business Operations Command (11 agents) |

### Database Tables (10 total)
`users`, `sessions`, `prompt_patterns`, `anti_patterns`, `model_quirks`, `domain_scripts`, `quick_start_templates`, `example_prompts`, `prompt_sessions`, `swarm_templates`, `custom_swarms`

---

## What Was Built This Session (Phases 3–5)

### Phase 3
- Renamed app from Prompitect → **Promptwright** (all user-visible references)
- Provenance badges on ScaffoldBuilder blocks (`sourceName` field)
- Pattern Library auto-navigates to scaffold after apply (rationale banner in scaffold)
- Swarm Composer: 8 real templates, full agent viewer, topology diagrams, export
- GitHub README written

### Phase 4
- Fixed `marketing_lead` routing bug in Business Operations Swarm seed data
- ASSESS LLC branding: sidebar footer, home page, README, all swarm exports
- GitHub repository renamed from `prompitect` → `Promptwright`
- Custom Swarm Builder: "Build Your Own" tab with example-picker modal (108 examples)
- `custom_swarms` DB table + `swarmsRouter` (list/get/create/update/delete)
- My Swarms tab: save, load, delete custom swarms
- Saved-swarm load flow fully wired (`MySwarms` → `SwarmComposer` → `SwarmBuilder` via `initialSwarm` prop)

### Phase 5
- **Anti-Pattern Library** (`/antipatterns`): severity + category filters, full detail panel
- **Model Guide** (`/models`): overview cards, comparison table, detail view, cost calculator
- **ASSESS Business Operations Command**: 11-agent hub-spoke swarm (all system prompts >200 chars)

---

## Immediate Next Steps (Proposed Phase 6)

These three were proposed at the end of Phase 5 — user has not confirmed which to build next:

1. **Domain Elicitation Scripts page** (`/domains`) — Browse the 15 domain scripts that power the Discovery flow. Users can see what guided discovery looks like for each domain before starting a session.

2. **Sessions page enhancements** — Diff view (compare two sessions side-by-side), "fork session" button for branching prompt iterations.

3. **Onboarding flow** — 3-step modal for new users: what is a scaffold, how does Discovery work, what is Reverse Mode. Reduces learning curve for non-expert users.

---

## How to Resume

```bash
# The dev server is already running. If it has gone cold:
cd /home/ubuntu/prompitect
pnpm dev

# Run tests to confirm clean state:
pnpm test

# Check TypeScript:
npx tsc --noEmit

# Read the skill before planning:
# /home/ubuntu/skills/prompitect-engineer/SKILL.md
```

---

## Key Files to Know

| File | Purpose |
|---|---|
| `shared/prompitect-types.ts` | All shared types: `ScaffoldBlock`, `SwarmAgent`, `MODEL_PRICING` |
| `drizzle/schema.ts` | All DB table definitions |
| `server/routers/knowledge.ts` | All read-only knowledge base procedures |
| `server/routers/swarms.ts` | Custom swarms CRUD |
| `server/streaming.ts` | SSE endpoints (register BEFORE tRPC middleware) |
| `client/src/components/AppLayout.tsx` | Sidebar nav — add new routes here AND in `App.tsx` |
| `client/src/components/SwarmBuilder.tsx` | Custom swarm builder with example-picker |
| `scripts/seed-swarm-templates.mjs` | 9 swarm templates — re-run to reset |

---

## Quality Bar Reminder

A feature is **done** when:
- Happy path works end-to-end in browser
- Error states handled
- Any new knowledge base content is real, not placeholder
- `agentCount` in swarm templates matches actual `agents` array length
- Vitest tests written and passing (`pnpm test`)
- `webdev_save_checkpoint` called

A feature is **not done** when:
- Works "in theory" but untested
- UI has placeholder text
- Seed data is invented rather than researched
