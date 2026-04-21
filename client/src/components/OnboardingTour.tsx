/**
 * OnboardingTour — 13-step guided tooltip tour using driver.js.
 *
 * Steps walk through every meaningful page in Forgewright:
 *   1.  Home input — describe what you want to build
 *   2.  Discovery — the AI interview that extracts your spec
 *   3.  Scaffold Builder — the 8-block structured editor
 *   4.  Variants — generate terse / detailed / chain-of-thought variants
 *   5.  Reverse Mode — work backwards from output you admire
 *   6.  Pattern Library — 22 documented prompt patterns
 *   7.  Example Library — 108 real, domain-diverse example prompts
 *   8.  Anti-Patterns — 32 failure modes with detection rules
 *   9.  Model Guide — quirks, pricing, and optimization tips for 8 models
 *  10.  Swarm Composer — multi-agent prompt system templates
 *  11.  Diagnose Output — stream-analyze any LLM output for drift and issues
 *  12.  A/B Compare — side-by-side variant comparison with win-rate tracking
 *  13.  Insights — personal pattern learning from your session history
 *
 * The tour is triggered by the parent via `active` prop.
 * On complete or skip, `onFinish` is called so the parent can persist state.
 *
 * All steps target sidebar nav links so the tour works from any page —
 * no navigation is required between steps.
 */

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface OnboardingTourProps {
  active: boolean;
  onFinish: () => void;
}

export default function OnboardingTour({ active, onFinish }: OnboardingTourProps) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    if (!active) return;

    // Small delay so the DOM is fully painted before driver.js measures elements
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 8,
        allowClose: true,
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Start building",
        onDestroyStarted: () => {
          driverObj.destroy();
          onFinish();
        },
        steps: [
          {
            // Step 1: Home input — the starting point
            element: "textarea",
            popover: {
              title: "Start here (1 of 13)",
              description:
                "Describe what you want the AI to do — in plain language. Forgewright extracts the specification you didn't know you needed. Leave it blank to start a guided discovery conversation.",
              side: "bottom",
              align: "center",
            },
          },
          {
            // Step 2: Discovery nav item
            element: 'a[href="/discovery"]',
            popover: {
              title: "Discovery — the AI interview (2 of 13)",
              description:
                "Discovery interviews you with targeted questions to surface domain, audience, constraints, and success criteria. It auto-detects your domain and applies the right elicitation script. Most users produce a better prompt in 3 minutes here than in 30 minutes writing freehand.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 3: Scaffold Builder nav item
            element: 'a[href="/scaffold"]',
            popover: {
              title: "Scaffold Builder — the structured editor (3 of 13)",
              description:
                "Your prompt is built as 8 labeled blocks: Role, Context, Task, Constraints, Examples, Format, Reasoning, and Output Validation. Each block is independently editable, togglable, and annotated with token counts. The 'Test on model' button streams a live response directly inside this page.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 4: Variants — accessible from Scaffold Builder action bar
            element: 'a[href="/scaffold"]',
            popover: {
              title: "Variants — terse, detailed, chain-of-thought (4 of 13)",
              description:
                "From the Scaffold Builder, use 'Generate variants' to produce three rewritten versions of your prompt: Terse (stripped to essentials), Detailed (fully elaborated), and Chain-of-Thought (reasoning steps made explicit). Compare them side-by-side before choosing one.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 5: Reverse Mode nav item
            element: 'a[href="/reverse"]',
            popover: {
              title: "Reverse Mode — work backwards from output (5 of 13)",
              description:
                "Paste any output you admire — an article, a code snippet, an analysis. Forgewright reverse-engineers the prompt structure that would produce something like it, and populates your scaffold automatically. The fastest way to learn what good prompts look like.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 6: Pattern Library nav item
            element: 'a[href="/patterns"]',
            popover: {
              title: "Pattern Library — 22 documented techniques (6 of 13)",
              description:
                "22 prompt patterns drawn from published research — Chain-of-Thought, Few-Shot, ReAct, Self-Critique, Constitutional, Decomposition, and more. Each has a description, when-to-use guidance, source citations, and a one-click 'Apply to Scaffold' action.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 7: Example Library nav item
            element: 'a[href="/examples"]',
            popover: {
              title: "Example Library — 108 real prompts (7 of 13)",
              description:
                "108 real, tested example prompts across 12 domains: software engineering, data analysis, creative writing, marketing, education, research, legal, medical, finance, HR, customer support, and product management. Filter by domain, pattern, or difficulty. Use any example as a starting point for your scaffold.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 8: Anti-Patterns nav item
            element: 'a[href="/antipatterns"]',
            popover: {
              title: "Anti-Patterns — 32 failure modes (8 of 13)",
              description:
                "32 documented prompt failure modes with detection rules, severity ratings, and remediation guidance. The Scaffold Builder runs these rules in real time and flags issues as you type. This page lets you browse the full catalog and understand why certain prompt structures fail.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 9: Model Guide nav item
            element: 'a[href="/models"]',
            popover: {
              title: "Model Guide — quirks for 8 models (9 of 13)",
              description:
                "Behavior notes, pricing, context windows, and optimization tips for Claude 3.5 Sonnet, Claude 3 Opus, GPT-4o, GPT-4o mini, o1, Gemini 1.5 Pro, Mistral Large, and Llama 3 70B. Includes a cost calculator so you can compare per-run costs before committing to a model.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 10: Swarm Composer nav item
            element: 'a[href="/swarm"]',
            popover: {
              title: "Swarm Composer — multi-agent systems (10 of 13)",
              description:
                "Browse 9 production-ready multi-agent prompt templates — content pipelines, software dev teams, market research swarms, and more. Or build your own: define agents, assign roles and system prompts, choose a topology (sequential, parallel, hub-spoke, hierarchical, iterative), and export a deployment briefing.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 11: Diagnose Output nav item
            element: 'a[href="/diagnose"]',
            popover: {
              title: "Diagnose Output — analyze any LLM response (11 of 13)",
              description:
                "Paste any LLM output and Forgewright streams a structured diagnosis: drift from your intended prompt, root causes, pattern matches against 25 diagnosis patterns, and suggested block-level edits. The 'Diagnose this output' button in the Test on Model panel sends you here automatically.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 12: A/B Compare nav item
            element: 'a[href="/compare"]',
            popover: {
              title: "A/B Compare — side-by-side with win-rate tracking (12 of 13)",
              description:
                "Run two prompt variants against the same input simultaneously and watch both responses stream side-by-side. Record your preference (A wins / B wins / tie / both bad) with optional reason tags. Win rates accumulate across sessions so you can see which patterns consistently outperform others.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 13: Insights nav item
            element: 'a[href="/insights"]',
            popover: {
              title: "Insights — your personal pattern data (13 of 13)",
              description:
                "12 deterministic rules run against your session history to surface actionable insights: which blocks you use most, which patterns you apply, your average prompt length, anti-pattern hit rate, and more. No generative AI — just honest aggregations from your own data. Unlocks after 5 sessions.",
              side: "right",
              align: "start",
            },
          },
        ],
      });

      driverRef.current = driverObj;
      driverObj.drive();
    }, 400);

    return () => {
      clearTimeout(timer);
      driverRef.current?.destroy();
    };
  }, [active, onFinish]);

  return null; // driver.js manages its own DOM
}
