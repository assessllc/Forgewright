# Help Page Glossary Audit
**Date:** April 22, 2026  
**Auditor:** Forgewright engineering  
**Scope:** 18-term glossary on `/help` page  
**Target:** Trim to 8–10 terms per pre-launch brief

---

## Audit Criteria (from brief)

For each term, four questions:
1. Does a user need this term to use the core workflow (Discovery → Scaffold → Test → Diagnose)?
2. Is this term used in the UI itself, or only in documentation?
3. Is the term self-explanatory in context (e.g., "Scaffold Builder" doesn't need a glossary entry if it's just the name of the page)?
4. Is this industry-standard (e.g., "prompt," "token") or Forgewright-specific (a named feature)?

---

## Term-by-Term Review

| # | Term | In UI? | Core workflow? | Self-explanatory? | Forgewright-specific? | Recommendation | Rationale |
|---|---|---|---|---|---|---|---|
| 1 | **Scaffold** | Yes — page name, block labels, nav | Yes | No — "scaffold" is not a standard prompt term | Yes | **KEEP** | Central concept; not obvious from name alone; appears in UI constantly |
| 2 | **Block** | Yes — "Add block," block labels in builder | Yes | Partially — "block" is generic | Yes | **KEEP** | Users need to understand that blocks are the 8 named sections, not arbitrary chunks |
| 3 | **Session** | Yes — Sessions page, nav | Yes | Mostly — "session" is broadly understood | Partially | **REMOVE** | Standard software term; definition adds little beyond what the Sessions page itself communicates |
| 4 | **Discovery** | Yes — page name, nav | Yes | No — "Discovery" as an AI interview mode is not obvious | Yes | **KEEP** | Users need to know this is an interview, not a search feature |
| 5 | **Elicitation script** | No — internal term only; not shown in UI | No | No | Yes | **REMOVE** | Never surfaces in the UI; users don't need to know this term to use Discovery |
| 6 | **Pattern** | Yes — Pattern Library page, "Apply pattern" button | Yes | Partially | Partially | **KEEP** | "Pattern" in the LLM context (Chain-of-Thought, Few-Shot) is not obvious to non-specialists; the definition earns its place |
| 7 | **Anti-pattern** | Yes — Anti-Pattern Library page, inline linting warnings | Yes | No | Partially | **KEEP** | "Anti-pattern" is a term users see in linting warnings; they need to know it means a documented failure mode, not just a bad pattern |
| 8 | **Diagnosis pattern** | Yes — Diagnosis Library page | No — secondary workflow | No | Yes | **MERGE into Anti-pattern** | Distinction between prompt anti-patterns and output diagnosis patterns is subtle; merge into Anti-pattern entry with a one-sentence note |
| 9 | **Drift** | Yes — appears in Diagnose Output results panel | No — secondary workflow | No | Yes | **REMOVE** | Only relevant to Diagnose Output; the page itself explains it in context. Adding it to a global glossary inflates scope |
| 10 | **Variant** | Yes — Variants page, "Generate variants" button | No — secondary workflow | Partially | Yes | **REMOVE** | The Variants page label is self-explanatory enough; the three variant types (Terse, Detailed, Chain-of-Thought) are labeled in the UI |
| 11 | **Reverse Mode** | Yes — page name, nav | No — secondary workflow | No — "Reverse Mode" is a Forgewright-specific concept | Yes | **KEEP** | Non-obvious concept; users need to know this means "start from output, work backwards to prompt" |
| 12 | **Swarm** | Yes — Swarm Composer page, nav | No — advanced feature | No | Yes | **KEEP** | "Swarm" in the multi-agent sense is not obvious; the definition is short and earns its place |
| 13 | **Topology** | Yes — appears in Swarm Composer dropdowns | No — advanced feature | No | Yes | **REMOVE** | Only relevant inside Swarm Composer; the dropdown labels (Sequential, Parallel, Hub-Spoke, etc.) are self-explanatory in context |
| 14 | **Token** | Yes — token count display in Scaffold Builder | Yes | No — "token" in the LLM sense is not obvious to non-specialists | No — industry standard | **KEEP** | Users see "~340 tokens / $0.0017" in the UI and need to know what a token is; short definition |
| 15 | **Win rate** | Yes — A/B Compare page, Insights page | No — secondary workflow | Partially | Partially | **REMOVE** | Self-explanatory in context ("you preferred variant A in 7 of 10 comparisons"); glossary entry adds nothing |
| 16 | **Version history** | Yes — "History" panel in Scaffold Builder | No — secondary workflow | Mostly | Partially | **REMOVE** | Standard software concept; the History panel label is self-explanatory |
| 17 | **Free tier** | Yes — Pricing page, upgrade modal | Yes | Mostly | No | **REMOVE** | Standard SaaS term; the Pricing page explains it completely |
| 18 | **Pro tier** | Yes — Pricing page, upgrade modal | Yes | Mostly | No | **REMOVE** | Standard SaaS term; the Pricing page explains it completely |

---

## Recommended Trimmed Glossary (9 terms)

| Term | Keep/Merge | Notes |
|---|---|---|
| Scaffold | Keep | |
| Block | Keep | |
| Discovery | Keep | |
| Pattern | Keep | |
| Anti-pattern | Keep + merge Diagnosis pattern | Add one sentence: "A related concept, the *diagnosis pattern*, describes failure modes in the model's *output* rather than the prompt itself. See the Diagnosis Library." |
| Reverse Mode | Keep | |
| Swarm | Keep | |
| Token | Keep | |
| Scaffold blocks (grouped) | New entry | Brief one-liner listing all 8 block names so users can orient themselves without reading the full Scaffold Builder. Replaces the need for individual block-name explanations. |

**Removed:** Session, Elicitation script, Drift, Variant, Topology, Win rate, Version history, Free tier, Pro tier (9 terms removed)

---

## Implementation Notes

- Update Help page `GLOSSARY_TERMS` array: 18 → 9 terms
- Update any text on the Help page that says "18-term glossary" → "9-term glossary"
- Update Settings page Help & Tour section if it references the glossary count
- Update onboarding tour if any step references the glossary count
- No test files reference the glossary term count directly; no test changes needed

---

## Open Action Item

**Attorney review:** Schedule within 30 days of launch. The Terms of Service and Privacy Policy at `/terms` and `/privacy` are first drafts. Do not treat them as final legally binding documents until reviewed.
