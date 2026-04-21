/**
 * Help & Glossary page — /help
 *
 * A persistent, always-accessible reference covering:
 *   1. Quick-start guide (5-step workflow)
 *   2. Page-by-page how-to guide for all 13 meaningful pages
 *   3. Full glossary of Forgewright terms
 *   4. Tour replay button
 *
 * No auth required — public page.
 */

import AppLayout from "@/components/AppLayout";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  MessageSquare,
  Layers,
  GitBranch,
  FlipHorizontal,
  BookOpen,
  Network,
  AlertTriangle,
  Cpu,
  Stethoscope,
  BarChart2,
  Lightbulb,
  Library,
  Zap,
  PlayCircle,
} from "lucide-react";

// ─── Page guide data ──────────────────────────────────────────────────────────

const PAGE_GUIDES = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    badge: "Start here",
    badgeVariant: "default" as const,
    summary:
      "The entry point. Type what you want the AI to do in plain language, or leave it blank to start a guided Discovery conversation. Quick-start tiles let you jump directly into common use cases.",
    steps: [
      "Type a plain-language description of your goal in the text area — for example, \"I need a prompt that reviews pull requests for security issues.\"",
      "Select your target model from the dropdown. This pre-populates the cost estimate and informs Discovery's elicitation questions.",
      "Click 'Start Discovery' to begin the AI interview, or 'Reverse Mode' to work backwards from existing output.",
      "Use the Quick Start tiles to jump directly into a domain-specific scaffold without going through Discovery.",
    ],
  },
  {
    href: "/discovery",
    label: "Discovery",
    icon: MessageSquare,
    badge: "Core workflow",
    badgeVariant: "secondary" as const,
    summary:
      "An AI interview that extracts your domain, audience, constraints, and success criteria through targeted questions. Auto-detects your domain and applies the right elicitation script. Produces a structured spec that seeds your scaffold.",
    steps: [
      "Answer each question as specifically as you can — vague answers produce vague scaffolds.",
      "You can skip any question by clicking 'Skip' — Discovery will infer from context.",
      "When the interview is complete, click 'Build scaffold' to generate your 8-block prompt structure.",
      "The generated scaffold is saved as a session you can return to at any time from the Sessions page.",
    ],
  },
  {
    href: "/scaffold",
    label: "Scaffold Builder",
    icon: Layers,
    badge: "Core workflow",
    badgeVariant: "secondary" as const,
    summary:
      "The structured prompt editor. Your prompt is divided into 8 labeled blocks — Role, Context, Task, Constraints, Examples, Format, Reasoning, and Output Validation. Each block is independently editable, togglable, and annotated with token counts.",
    steps: [
      "Edit any block by clicking its text area. Changes auto-save to your session.",
      "Toggle blocks on/off with the checkbox — disabled blocks are excluded from the assembled prompt and token count.",
      "Click 'Test on [model]' to stream a live response directly inside this page without navigating away.",
      "Use 'Generate variants' to produce Terse, Detailed, and Chain-of-Thought rewrites for comparison.",
      "The 'Apply pattern' button opens a pattern selector — choose a pattern to merge its example blocks into your scaffold.",
      "Version history is tracked automatically. Click the clock icon to view past versions and roll back if needed.",
    ],
  },
  {
    href: "/reverse",
    label: "Reverse Mode",
    icon: FlipHorizontal,
    badge: "Core workflow",
    badgeVariant: "secondary" as const,
    summary:
      "Work backwards from output you admire. Paste any LLM output — an article, a code review, an analysis — and Forgewright reverse-engineers the prompt structure that would produce something like it, then populates your scaffold automatically.",
    steps: [
      "Paste the output you want to reverse-engineer into the text area.",
      "Optionally add context about what model produced it or what task it was for.",
      "Click 'Analyse output' — Forgewright streams a structured decomposition.",
      "Review the inferred blocks, then click 'Apply to scaffold' to create a new session pre-populated with the reverse-engineered structure.",
    ],
  },
  {
    href: "/patterns",
    label: "Pattern Library",
    icon: BookOpen,
    badge: "Reference",
    badgeVariant: "outline" as const,
    summary:
      "22 prompt patterns drawn from published research — Chain-of-Thought, Few-Shot, ReAct, Self-Critique, Constitutional, Decomposition, and more. Each has a description, when-to-use guidance, source citations, and a one-click 'Apply to Scaffold' action.",
    steps: [
      "Browse patterns by category using the filter tabs at the top.",
      "Click any pattern card to expand its full description, example, and source citation.",
      "Click 'Apply to scaffold' to open a session selector — choose which session to merge the pattern into.",
      "After applying, navigate to the Scaffold Builder to review the merged blocks.",
    ],
  },
  {
    href: "/examples",
    label: "Example Library",
    icon: GitBranch,
    badge: "Reference",
    badgeVariant: "outline" as const,
    summary:
      "108 real, tested example prompts across 12 domains: software engineering, data analysis, creative writing, marketing, education, research, legal, medical, finance, HR, customer support, and product management.",
    steps: [
      "Filter by domain, pattern type, or difficulty using the controls at the top.",
      "Click any example to expand its full prompt text and see which patterns it demonstrates.",
      "Click 'Use as starting point' to create a new session pre-populated with the example's scaffold blocks.",
    ],
  },
  {
    href: "/antipatterns",
    label: "Anti-Patterns",
    icon: AlertTriangle,
    badge: "Reference",
    badgeVariant: "outline" as const,
    summary:
      "32 documented prompt failure modes with detection rules, severity ratings (low/medium/high/critical), and remediation guidance. The Scaffold Builder runs these rules in real time and flags issues as you type.",
    steps: [
      "Browse by category (clarity, specificity, structure, context, format, scope, role, examples, reasoning, constraints, output, meta).",
      "Each entry shows: what the failure looks like, why it happens, how to detect it, and how to fix it.",
      "The Scaffold Builder's live linting uses these same rules — a yellow or red badge on a block means one of these patterns was detected.",
    ],
  },
  {
    href: "/models",
    label: "Model Guide",
    icon: Cpu,
    badge: "Reference",
    badgeVariant: "outline" as const,
    summary:
      "Behavior notes, pricing, context windows, and optimization tips for 8 models: Claude 3.5 Sonnet, Claude 3 Opus, GPT-4o, GPT-4o mini, o1, Gemini 1.5 Pro, Mistral Large, and Llama 3 70B.",
    steps: [
      "Use the cost calculator at the top to compare per-run costs across models before committing.",
      "Each model card shows: context window, input/output pricing, known quirks, and prompt optimization tips specific to that model.",
      "The 'Quirks' section is especially useful — it documents model-specific behaviors that aren't in official documentation.",
    ],
  },
  {
    href: "/swarm",
    label: "Swarm Composer",
    icon: Network,
    badge: "Advanced",
    badgeVariant: "secondary" as const,
    summary:
      "Multi-agent prompt system templates. Browse 9 production-ready templates or build your own: define agents, assign roles and system prompts, choose a topology (sequential, parallel, hub-spoke, hierarchical, iterative), and export a deployment briefing.",
    steps: [
      "Browse the Templates tab to see pre-built swarms for content pipelines, software dev teams, market research, and more.",
      "Click 'Load template' to open a template in the Builder tab for customization.",
      "In the Builder tab, add agents with the '+ Add agent' button. Each agent needs a name, role, and system prompt.",
      "Choose a topology from the dropdown — this determines how agents communicate.",
      "Click 'Export briefing' to download a Markdown document suitable for sharing with a developer or pasting into a system that supports multi-agent orchestration.",
      "Save your custom swarm with 'Save swarm' — it appears in the 'My Swarms' tab.",
    ],
  },
  {
    href: "/diagnose",
    label: "Diagnose Output",
    icon: Stethoscope,
    badge: "Analysis",
    badgeVariant: "secondary" as const,
    summary:
      "Paste any LLM output and stream a structured diagnosis: drift from your intended prompt, root causes, pattern matches against 25 diagnosis patterns, and suggested block-level edits.",
    steps: [
      "Paste the LLM output you want to analyze into the left panel.",
      "Optionally paste the original prompt in the 'Original prompt' field for drift analysis.",
      "Click 'Diagnose' — the analysis streams in real time.",
      "Review the drift map, root causes, and suggested edits in the right panel.",
      "Click 'Apply edit' on any suggestion to create a new scaffold version with that change applied.",
      "The 'Test on model' button in the Scaffold Builder sends you here automatically after a test run.",
    ],
  },
  {
    href: "/compare",
    label: "A/B Compare",
    icon: BarChart2,
    badge: "Analysis",
    badgeVariant: "secondary" as const,
    summary:
      "Run two prompt variants against the same input simultaneously and watch both responses stream side-by-side. Record your preference with optional reason tags. Win rates accumulate across sessions.",
    steps: [
      "Enter or paste Variant A and Variant B prompts in the respective panels.",
      "Enter a shared user input (the message both prompts will receive).",
      "Click 'Run comparison' — both responses stream simultaneously.",
      "After both complete, use the preference selector to record which won (A / B / Tie / Both bad).",
      "Add optional reason tags to explain why — these feed into your Insights data.",
      "Win rates are shown in the Insights page after enough comparisons accumulate.",
    ],
  },
  {
    href: "/insights",
    label: "Insights",
    icon: Lightbulb,
    badge: "Analytics",
    badgeVariant: "outline" as const,
    summary:
      "12 deterministic rules run against your session history to surface actionable insights: which blocks you use most, which patterns you apply, your average prompt length, anti-pattern hit rate, and more. Unlocks after 5 sessions.",
    steps: [
      "Insights appear automatically after you have at least 5 sessions.",
      "Each insight card shows a rule name, your current value, the threshold, and a plain-language conclusion.",
      "Filter by category (usage, patterns, quality, comparison) using the tabs.",
      "Click 'Export as Markdown' to download your insights as a reference document.",
    ],
  },
  {
    href: "/diagnosis-library",
    label: "Diagnosis Library",
    icon: Library,
    badge: "Reference",
    badgeVariant: "outline" as const,
    summary:
      "The full catalog of 25 diagnosis patterns used by the Diagnose Output page. Each entry documents a specific output failure mode with detection heuristics, example pairs, and canonical remediation steps.",
    steps: [
      "Browse by category or severity using the filter controls.",
      "Each entry links to the anti-patterns and prompt patterns most relevant to fixing it.",
      "Use this page to understand why the Diagnose Output page flagged a particular issue.",
    ],
  },
];

// ─── Glossary data ────────────────────────────────────────────────────────────

const GLOSSARY_TERMS = [
  {
    term: "Scaffold",
    definition:
      "A prompt broken into 8 labeled blocks (Role, Context, Task, Constraints, Examples, Format, Reasoning, Output Validation). The scaffold is the core unit of work in Forgewright — every session produces one.",
  },
  {
    term: "Block",
    definition:
      "One of the 8 sections of a scaffold. Each block is independently editable, togglable, and contributes to the total token count. Disabled blocks are excluded from the assembled prompt.",
  },
  {
    term: "Session",
    definition:
      "A saved unit of work containing a scaffold, its version history, associated discovery answers, and any diagnoses or comparisons run against it. Sessions persist indefinitely in your account.",
  },
  {
    term: "Discovery",
    definition:
      "The AI interview mode that extracts your domain, audience, constraints, and success criteria through targeted questions. Discovery auto-detects your domain and applies the appropriate elicitation script.",
  },
  {
    term: "Elicitation script",
    definition:
      "A domain-specific set of questions used during Discovery to surface the information most relevant to that domain. Forgewright ships with 15 elicitation scripts covering software engineering, data analysis, creative writing, and more.",
  },
  {
    term: "Pattern",
    definition:
      "A documented, reusable prompt technique drawn from published research. Examples: Chain-of-Thought, Few-Shot, ReAct, Self-Critique. Patterns can be applied to any scaffold with one click.",
  },
  {
    term: "Anti-pattern",
    definition:
      "A documented prompt failure mode — a structural or content choice that reliably degrades model output. Forgewright ships with 32 anti-patterns and runs them as live linting rules in the Scaffold Builder.",
  },
  {
    term: "Diagnosis pattern",
    definition:
      "A documented output failure mode used by the Diagnose Output page. Distinct from prompt anti-patterns: diagnosis patterns describe problems in the model's response, not the prompt itself.",
  },
  {
    term: "Drift",
    definition:
      "The degree to which a model's output diverges from what the prompt intended. The Diagnose Output page measures drift by comparing the output against the original prompt's stated task, constraints, and format.",
  },
  {
    term: "Variant",
    definition:
      "A rewritten version of a scaffold produced by the Variants feature. Three variants are generated: Terse (stripped to essentials), Detailed (fully elaborated), and Chain-of-Thought (reasoning steps made explicit).",
  },
  {
    term: "Reverse Mode",
    definition:
      "A workflow where you start from output you admire and work backwards to reconstruct the prompt structure that would produce it. Forgewright decomposes the output into scaffold blocks automatically.",
  },
  {
    term: "Swarm",
    definition:
      "A multi-agent prompt system where multiple AI agents with distinct roles collaborate on a task. Forgewright's Swarm Composer lets you design, save, and export swarm configurations.",
  },
  {
    term: "Topology",
    definition:
      "The communication pattern between agents in a swarm. Forgewright supports five topologies: Sequential (A→B→C), Parallel (all agents run simultaneously), Hub-Spoke (one coordinator routes to specialists), Hierarchical (manager delegates to sub-agents), and Iterative (agents refine each other's output in cycles).",
  },
  {
    term: "Token",
    definition:
      "The unit of text that language models process. Approximately 4 characters per token for English text. Forgewright estimates token counts for every scaffold and displays the cost estimate for each supported model.",
  },
  {
    term: "Win rate",
    definition:
      "The percentage of A/B comparisons in which a particular variant or pattern was preferred. Tracked in the A/B Compare page and surfaced in Insights.",
  },
  {
    term: "Version history",
    definition:
      "A complete audit trail of every change made to a scaffold, automatically captured at each edit, pattern application, or reverse-mode import. You can view any past version and roll back to it at any time.",
  },
  {
    term: "Free tier",
    definition:
      "The default plan: 10 Discovery sessions per month, all features accessible. No credit card required.",
  },
  {
    term: "Pro tier",
    definition:
      "The paid plan at $15/month: unlimited Discovery sessions, all features. Upgrade from the Pricing page.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Help() {
  const { restartTour } = useOnboarding();

  return (
    <AppLayout title="Help & Glossary">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Help & Glossary</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            A complete reference for every page and term in Forgewright. Use the guided tour for
            an interactive walkthrough, or browse the sections below to find what you need.
          </p>
          <Button
            onClick={restartTour}
            variant="outline"
            size="sm"
            className="gap-2 mt-2"
          >
            <PlayCircle className="w-4 h-4" />
            Replay the guided tour (13 steps)
          </Button>
        </div>

        {/* Quick-start */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Quick-start: the core workflow
          </h2>
          <ol className="space-y-3">
            {[
              {
                step: "1",
                title: "Describe your goal",
                body: "On the Home page, type what you want the AI to do — or leave it blank to start a guided Discovery conversation.",
              },
              {
                step: "2",
                title: "Run Discovery",
                body: "Answer the AI's targeted questions. Discovery auto-detects your domain and extracts the spec you need.",
              },
              {
                step: "3",
                title: "Refine your scaffold",
                body: "Edit the 8 blocks in the Scaffold Builder. Apply patterns, toggle blocks, and watch the token count update in real time.",
              },
              {
                step: "4",
                title: "Test on model",
                body: "Click 'Test on [model]' to stream a live response without leaving the Scaffold Builder. Diagnose the output if needed.",
              },
              {
                step: "5",
                title: "Iterate",
                body: "Use A/B Compare to test variants, check Insights to see patterns in your work, and revisit Sessions to pick up where you left off.",
              },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Page-by-page guide */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Page-by-page guide
          </h2>
          <Accordion type="multiple" className="space-y-2">
            {PAGE_GUIDES.map(({ href, label, icon: Icon, badge, badgeVariant, summary, steps }) => (
              <AccordionItem
                key={href}
                value={href}
                className="border border-border rounded-lg px-4 bg-card"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                      <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                        {badge}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      How to use it
                    </p>
                    <ol className="space-y-2">
                      {steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <span className="text-primary font-medium flex-shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Glossary */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
            Glossary
          </h2>
          <div className="grid gap-3">
            {GLOSSARY_TERMS.map(({ term, definition }) => (
              <div
                key={term}
                className="rounded-lg border border-border bg-card px-4 py-3 space-y-1"
              >
                <p className="text-sm font-semibold text-foreground">{term}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{definition}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom tour CTA */}
        <section className="rounded-lg border border-primary/20 bg-primary/5 px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Prefer an interactive walkthrough?</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              The guided tour walks you through all 13 pages with contextual tooltips.
            </p>
          </div>
          <Button onClick={restartTour} size="sm" className="gap-2 flex-shrink-0">
            <Zap className="w-4 h-4" />
            Start tour
          </Button>
        </section>

      </div>
    </AppLayout>
  );
}
