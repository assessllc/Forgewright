#!/usr/bin/env python3
"""Replace the 18-term GLOSSARY_TERMS array in Help.tsx with the audited 9-term version."""

path = "client/src/pages/Help.tsx"
content = open(path).read()

# Find the GLOSSARY_TERMS array: starts at "const GLOSSARY_TERMS = ["
# and ends at the "];" that closes it (line 338 in the original)
# We use the second "];" occurrence after the start marker
start_marker = "const GLOSSARY_TERMS = ["
start_idx = content.index(start_marker)

# Find the closing "];" after the start
# The array ends with "}," then "];" on its own line
close_marker = "\n];"
close_idx = content.index(close_marker, start_idx) + len(close_marker)

new_glossary = """const GLOSSARY_TERMS = [
  {
    term: "Scaffold",
    definition:
      "A prompt broken into 8 labeled blocks: Role, Context, Task, Constraints, Examples, Format, Reasoning, and Output Validation. The scaffold is the core unit of work in Forgewright — every session produces one.",
  },
  {
    term: "Scaffold blocks",
    definition:
      "The 8 named sections of a scaffold: Role (who the model is), Context (background information), Task (what to do), Constraints (what not to do), Examples (few-shot demonstrations), Format (output structure), Reasoning (chain-of-thought instructions), and Output Validation (self-check criteria). Each block is independently editable and togglable.",
  },
  {
    term: "Discovery",
    definition:
      "The AI interview mode that extracts your domain, audience, constraints, and success criteria through targeted questions before you write a single prompt word. Discovery auto-detects your domain and applies the appropriate elicitation script.",
  },
  {
    term: "Pattern",
    definition:
      "A documented, reusable prompt technique drawn from published research — for example, Chain-of-Thought (Wei et al. 2022), Few-Shot, ReAct, Self-Critique, or Structured Output. Patterns can be applied to any scaffold with one click from the Pattern Library.",
  },
  {
    term: "Anti-pattern",
    definition:
      "A documented prompt failure mode — a structural or content choice that reliably degrades model output. Forgewright ships with 32 anti-patterns and runs them as live linting rules in the Scaffold Builder. A related concept, the diagnosis pattern, describes failure modes in the model's output rather than the prompt itself — see the Diagnosis Library.",
  },
  {
    term: "Reverse Mode",
    definition:
      "A workflow where you start from output you admire and work backwards to reconstruct the prompt structure that would produce it. Paste any model output and Forgewright decomposes it into scaffold blocks automatically.",
  },
  {
    term: "Swarm",
    definition:
      "A multi-agent prompt system where multiple AI agents with distinct roles collaborate on a task. Forgewright's Swarm Composer lets you design, configure, and export swarm systems using five communication topologies: Sequential, Parallel, Hub-Spoke, Hierarchical, and Iterative.",
  },
  {
    term: "Token",
    definition:
      "The unit of text that language models process. Approximately 4 characters per token for English text. Forgewright estimates token counts for every scaffold and displays the cost estimate for each supported model in real time.",
  },
  {
    term: "Session",
    definition:
      "A saved unit of work containing a scaffold, its full version history, associated discovery answers, and any diagnoses or comparison runs. Sessions persist indefinitely in your account and can be exported as JSON or Markdown.",
  },
];"""

new_content = content[:start_idx] + new_glossary + content[close_idx:]
open(path, "w").write(new_content)

# Verify
import re
terms = re.findall(r'term: "([^"]+)"', new_content[new_content.index("const GLOSSARY_TERMS"):new_content.index("export default function Help")])
print(f"✓ Replaced GLOSSARY_TERMS: {len(terms)} terms: {terms}")
