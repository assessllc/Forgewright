# Swarm Composer — Research Notes

## Sources
- Anthropic "Building Effective Agents" (Dec 2024): https://www.anthropic.com/research/building-effective-agents
- OpenAI "Orchestrating Agents: Routines and Handoffs" (Oct 2024): https://developers.openai.com/cookbook/examples/orchestrating_agents
- Azure Architecture Center "AI Agent Orchestration Patterns" (Feb 2026)

## Core Patterns (from Anthropic)

### 1. Prompt Chaining (Pipeline)
- Task decomposed into sequential steps; each LLM call processes the output of the previous one
- Use when: task can be cleanly decomposed into fixed subtasks; trade latency for accuracy
- Key design: each agent has a narrow, well-defined role; output format of agent N must match input expectations of agent N+1

### 2. Routing
- Classifier agent directs input to specialized downstream agents
- Use when: distinct categories exist that benefit from specialized prompts
- Key design: router agent needs explicit routing criteria and output format

### 3. Parallelization (Sectioning / Voting)
- Multiple agents work simultaneously on independent subtasks
- Use when: subtasks are independent; or multiple perspectives needed for confidence
- Key design: aggregator agent must know how to synthesize parallel outputs

### 4. Orchestrator-Workers
- Central orchestrator dynamically breaks down tasks and delegates to worker agents
- Use when: tasks require dynamic decomposition; workers are specialized
- Key design: orchestrator needs clear delegation protocol; workers need narrow scope

### 5. Evaluator-Optimizer (Self-Critique Loop)
- One agent generates; another evaluates and provides feedback; loop until quality threshold
- Use when: clear quality criteria exist; iteration improves output
- Key design: evaluator needs explicit rubric; loop needs termination condition

## System Prompt Design Principles for Agents (from Anthropic)

1. **Role clarity**: Each agent must have a single, unambiguous role. Avoid "do X and also Y."
2. **Handoff conditions**: Explicitly state when the agent should stop and pass to the next agent
3. **Output format**: Specify exact output format so downstream agents can parse reliably
4. **Scope constraints**: Tell each agent what it should NOT do (as important as what it should do)
5. **Context inheritance**: Decide what context each agent needs from previous agents — don't pass everything

## What the Swarm Composer Should Generate

The output is NOT runnable code — it is a **structured set of system prompts** that the user can paste into any multi-agent platform (Manus, AutoGen, CrewAI, LangGraph, OpenAI Swarm, etc.).

Each agent prompt in the swarm should include:
- Role definition (who this agent is)
- Task scope (what this specific agent does)
- Input specification (what it receives from previous agents or the user)
- Output specification (what it must produce, in what format)
- Handoff condition (when/how to pass to next agent)
- Constraints (what it must NOT do)

## Real Business Swarm Templates to Build

1. **Content Production Pipeline**: Researcher → Outliner → Writer → Editor → SEO Optimizer
2. **Software Development Swarm**: Product Manager → Architect → Developer → Code Reviewer → QA Tester
3. **Market Research Swarm**: Data Collector → Analyst → Synthesizer → Report Writer
4. **Customer Support Escalation**: Triage Agent → Specialist Router → Resolution Agent → Quality Checker
5. **Legal Document Review**: Intake Agent → Risk Identifier → Clause Analyzer → Summary Writer
6. **Sales Intelligence Pipeline**: Prospect Researcher → ICP Scorer → Outreach Drafter → Personalization Agent
7. **Product Launch Swarm**: Market Analyst → Positioning Strategist → Copy Writer → Launch Planner
8. **Academic Research Assistant**: Literature Searcher → Source Evaluator → Synthesizer → Citation Formatter

## Topology Types

- **Sequential (Pipeline)**: A → B → C → D (each agent feeds the next)
- **Parallel + Merge**: A → [B, C, D] → E (A spawns parallel agents, E merges)
- **Hub-and-Spoke**: Orchestrator ↔ [Agent1, Agent2, Agent3] (orchestrator coordinates)
- **Hierarchical**: Manager → [Team Lead A → [Worker1, Worker2], Team Lead B → [Worker3]]
- **Iterative Loop**: Generator → Evaluator → (loop back to Generator until pass)
