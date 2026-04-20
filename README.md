# Promptwright

> *A wright is a skilled maker of complex, structured things — a playwright, a wheelwright, a shipwright. Promptwright applies that same craft to the design of language model prompts.*

*by [ASSESS LLC](https://assessllc.com)*

**Promptwright** is a structured workbench for crafting, analyzing, and refining prompts for large language models. It is built on real prompt engineering research — not marketing copy — and designed for practitioners who want to understand *why* a prompt works, not just copy one that does.

---

## What It Is

Most prompt tools are generators: you describe what you want, they produce something plausible. Promptwright is a **discovery engine first and a generator second**. The distinction matters.

A discovery engine helps you understand the design space. It shows you patterns that have been documented in the research literature, examples drawn from real use cases across a dozen domains, and failure modes with detection rules so you can recognize them before they cost you. The generation is downstream of that understanding.

The result is a tool that makes you a better prompt engineer, not just a faster one.

---

## Features

### Discovery
Start with a natural language description of what you want to build. The Discovery engine interviews you — asking about your domain, your audience, the model you're targeting, and the constraints you're working within — and produces a structured prompt scaffold grounded in the patterns most relevant to your use case.

### Scaffold Builder
An eight-block structured editor covering every dimension of a well-formed prompt: **Role**, **Context**, **Task**, **Constraints**, **Examples**, **Format**, **Reasoning**, and **Output Validation**. Each block is independently editable, togglable, and annotated with guidance on when and how to use it. Token counts are live. Provenance badges show which patterns or templates influenced each block.

### Pattern Library
A catalog of **20+ documented prompt patterns** drawn from published research and practitioner knowledge. Each pattern includes a description, when to use it, when not to, a worked example, and a one-click "Apply to Scaffold" action that merges the pattern's structure into your current session with a rationale banner explaining what changed and why.

**Patterns include:** Chain-of-Thought, Few-Shot Learning, Zero-Shot CoT, Self-Critique, ReAct (Reasoning + Acting), Structured Output, Role Prompting, Decomposition, Constitutional Constraints, Persona Calibration, Contrastive Examples, Iterative Refinement, and more.

### Example Library
**108 high-quality example prompts** across 12 domains: software engineering, creative writing, data analysis, research, marketing, education, legal, finance, HR, product management, customer support, and operations. Every example is annotated with the patterns it demonstrates, the models it has been tested on, and a difficulty rating.

### Reverse Mode
Paste any existing prompt — one you wrote, one you found, one that's been running in production. The Reverse Mode analyzes it against the scaffold framework, identifies which blocks are present and which are missing, surfaces anti-patterns, and produces a structured critique with specific improvement suggestions.

### Swarm Composer
Design multi-agent prompt systems. A swarm is a coordinated set of AI agents, each with a specific role and system prompt, that work together on a task too complex for a single agent. The Swarm Composer provides **8 production-ready swarm templates** grounded in published research on orchestration patterns, with fully written system prompts for every agent and export functionality for Manus, AutoGen, CrewAI, and LangGraph.

**Templates include:**
- Content Production Pipeline (5-agent sequential)
- Software Development Swarm (4-agent sequential)
- Market Research Swarm (4-agent parallel + merge)
- Customer Support Escalation (5-agent hub-spoke routing)
- Prompt Refinement Loop (2-agent iterative evaluator-optimizer)
- Sales Intelligence Pipeline (3-agent sequential)
- Legal Document Review Swarm (4-agent parallel + merge)
- Business Operations Swarm (6-agent hierarchical)

### Sessions
Every discovery session, scaffold, and generated variant is saved. Sessions are named, searchable, and resumable. You can branch from any session to explore a different direction without losing your original work.

---

## Knowledge Base

The value of Promptwright rests entirely on the quality of its embedded expertise. The knowledge base is built from primary sources and is explicitly not placeholder content.

| Dataset | Count | Sources |
|---|---|---|
| Prompt patterns | 20+ | Wei et al. (2022), Anthropic prompting guide, OpenAI prompt engineering guide, ReAct paper (Yao et al. 2022) |
| Anti-patterns | 30+ | Practitioner knowledge, model behavior research |
| Model quirks | 8 models | Anthropic, OpenAI, Google model documentation |
| Domain elicitation scripts | 15+ | Domain-specific practitioner knowledge |
| Example prompts | 108 | Tested across 12 domains, 3 difficulty levels |
| Swarm templates | 8 | Anthropic "Building Effective Agents" (Dec 2024), OpenAI "Orchestrating Agents" (Oct 2024) |

---

## Research Foundation

Promptwright is built on a specific body of research. The patterns, anti-patterns, and model notes are grounded in these sources:

- **Wei et al. (2022)** — "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." The foundational paper establishing that step-by-step reasoning prompts improve performance on complex tasks.
- **Yao et al. (2022)** — "ReAct: Synergizing Reasoning and Acting in Language Models." The paper introducing the interleaved reasoning-and-action pattern used in agentic workflows.
- **Anthropic (2024)** — "Building Effective Agents." The definitive practitioner guide to multi-agent orchestration patterns: prompt chaining, routing, parallelization, orchestrator-workers, and evaluator-optimizer.
- **Anthropic Prompting Guide** — Model-specific guidance on Claude's behavior, including role prompting, XML structuring, and constitutional constraints.
- **OpenAI Prompt Engineering Guide** — Documented patterns for GPT-family models, including few-shot formatting, system prompt structure, and tool use.
- **OpenAI (2024)** — "Orchestrating Agents: Routines and Handoffs." The technical foundation for the Swarm framework and agent handoff patterns.

---

## Technology

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript (strict), Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 4, tRPC 11 |
| Database | MySQL (Drizzle ORM) |
| Auth | Manus OAuth |
| LLM | Anthropic Claude 3.5 Sonnet (default), configurable |
| State | React Query via tRPC |

---

## Design Principles

**Discovery engine first.** Every feature is evaluated against whether it helps users understand the design space, not just produce output faster.

**Real content, not placeholders.** The knowledge base contains real patterns, real examples, and real model notes. A half-real knowledge base is worse than none — it teaches the wrong things.

**Production-quality code.** TypeScript strict mode throughout. Every API call has a failure path. Token counts are accurate. Tests cover core logic.

**Provenance transparency.** Every scaffold block carries a source badge showing whether it came from a pattern, a template, a discovery session, or the user. You always know why a block says what it says.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Howie8erHole/Promptwright.git
cd promptwright

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and API keys

# Run database migrations
pnpm drizzle-kit generate
# Apply migrations via your database client

# Seed the knowledge base
node scripts/seed-patterns.mjs
node scripts/seed-examples.mjs
node scripts/seed-swarm-templates.mjs

# Start development server
pnpm dev
```

---

## Project Status

Promptwright is under active development. The current state:

| Feature | Status |
|---|---|
| Discovery engine | Complete |
| Scaffold Builder (8 blocks) | Complete |
| Pattern Library (20+ patterns) | Complete |
| Example Library (108 examples) | Complete |
| Reverse Mode | Complete |
| Swarm Composer (8 templates) | Complete |
| Variant generation | Complete |
| Session management | Complete |
| Anti-pattern detection | Seeded, UI in progress |
| Model quirks database | Seeded, UI in progress |

---

## License

MIT

---

*Built with the conviction that prompt engineering is a discipline, not a shortcut.*
