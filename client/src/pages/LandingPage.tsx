/**
 * LandingPage.tsx — Public landing page at /
 * All sections from the pre-launch brief:
 *   1. Hero
 *   2. Problem section (3 paragraphs)
 *   3. How it works (3 columns)
 *   4. "Why craft matters" section
 *   5. Capabilities grid (8 cards)
 *   6. Who it's for (4 rows)
 *   7. Pricing (Free vs Pro)
 *   8. FAQ (7 questions)
 *   9. Footer (3 columns)
 *
 * No AppLayout — this is a public page, no sidebar.
 * Auth state: authenticated users see "Go to app" instead of "Start free".
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Zap,
  Layers,
  FlipHorizontal,
  BookOpen,
  AlertTriangle,
  GitCompare,
  Stethoscope,
  Network,
  Code2,
  BarChart2,
  PenLine,
  Users,
  ChevronDown,
  Check,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Discovery Engine",
    description:
      "An AI interview that extracts your domain, audience, and constraints before you write a single word.",
    href: "/discovery",
  },
  {
    icon: Layers,
    title: "Scaffold Builder",
    description:
      "Eight named blocks — Role, Context, Task, Constraints, Examples, Format, Reasoning, Output Validation — each independently editable with live token counts.",
    href: "/scaffold",
  },
  {
    icon: FlipHorizontal,
    title: "Reverse Mode",
    description:
      "Paste any output you admire. Forgewright decomposes it into scaffold blocks and reconstructs the prompt structure that would produce it.",
    href: "/reverse",
  },
  {
    icon: BookOpen,
    title: "Pattern Library",
    description:
      "22 research-backed prompt patterns — Chain-of-Thought, Few-Shot, ReAct, Self-Critique, and more — each with a one-click apply to any scaffold.",
    href: "/patterns",
  },
  {
    icon: AlertTriangle,
    title: "Anti-Pattern Detector",
    description:
      "32 documented failure modes run as live linting rules in the Scaffold Builder. Catch role confusion, constraint drift, and format ambiguity before they cost you.",
    href: "/antipatterns",
  },
  {
    icon: GitCompare,
    title: "A/B Compare",
    description:
      "Run two scaffold variants in parallel, record your preference, and track win rates across your session history.",
    href: "/compare",
  },
  {
    icon: Stethoscope,
    title: "Output Diagnosis",
    description:
      "Paste the output you got. 25 diagnosis patterns identify exactly where your prompt drifted from your intent and surface the surgical edits that would fix it.",
    href: "/diagnose",
  },
  {
    icon: Network,
    title: "Swarm Composer",
    description:
      "Design multi-agent prompt systems with named roles, five communication topologies, and exportable configurations.",
    href: "/swarm",
  },
];

const WHO_ITS_FOR = [
  {
    icon: Code2,
    type: "Developers building LLM features",
    sentence:
      "Ship prompts with the same rigor you ship code — versioned, tested, and documented.",
  },
  {
    icon: BarChart2,
    type: "Researchers and analysts",
    sentence:
      "Treat prompts as specifications, not incantations. Reproduce results. Cite your methodology.",
  },
  {
    icon: PenLine,
    type: "Content teams and marketers",
    sentence:
      "Repeatability without the re-prompting spiral. Build once, reuse across campaigns.",
  },
  {
    icon: Users,
    type: "Anyone tired of guessing",
    sentence:
      "If you've ever thought \"the AI isn't understanding what I mean,\" this is that tool.",
  },
];

const FAQ = [
  {
    q: "What is prompt engineering and why does it need a dedicated tool?",
    a: "Prompt engineering is the practice of writing, testing, and refining the instructions you give to a language model to get reliable, useful output. It needs a dedicated tool for the same reason code needs an IDE: the feedback loop is too slow without one. Without structure, you're rewriting prompts by feel — changing one thing, running it again, not knowing why it got better or worse. Forgewright gives you the structure (the scaffold), the knowledge base (patterns, anti-patterns, model guides), and the feedback loop (diagnosis, A/B compare, version history) to engineer prompts rather than guess at them.",
  },
  {
    q: "How is this different from using ChatGPT or Claude directly?",
    a: "ChatGPT and Claude are the engines. Forgewright is the workshop. You still run your prompts through those models — Forgewright doesn't replace them. What it adds is the structured process before and after: a disciplined way to build the prompt, a knowledge base of what works and what fails, and a diagnostic layer to understand why the output you got isn't the output you wanted. It's the difference between writing code in a text editor and writing code in an IDE with a linter.",
  },
  {
    q: "Does Forgewright send my prompts to AI providers?",
    a: "Yes, when you use the \"Test on model\" feature in the Scaffold Builder, your assembled prompt is sent to the configured LLM provider (Anthropic by default) for inference. Your prompts and session data are stored in Forgewright's database associated with your account. They are not used to train Forgewright's own models — Forgewright does not train models. If you use the Discovery, Pattern Library, Anti-Pattern Detector, or Reverse Mode features without clicking \"Test on model,\" no prompt content leaves Forgewright's servers.",
  },
  {
    q: "Can I bring my own API keys?",
    a: "Yes. In Settings → API Keys, you can provide your own Anthropic, OpenAI, or Google API keys. When a key is present, Forgewright uses it for inference instead of the built-in provider. Your keys are encrypted at rest using AES-256-GCM and are never returned from the server in plaintext.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains accessible until you choose to delete your account. Cancelling your Pro subscription downgrades you to the Free tier (10 sessions per month) but does not delete any of your existing sessions, scaffolds, or history. If you delete your account via Settings → Account, all your data is hard-deleted within 30 days. You can export everything as JSON or Markdown ZIP from Settings → Data Export at any time.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free tier is the trial. You get 10 Discovery sessions per month with access to every feature — Pattern Library, Anti-Pattern Detector, Reverse Mode, Swarm Composer, A/B Compare, Output Diagnosis, and all 8 model guides. No credit card required. If you hit the limit and want more, Pro is $15/month.",
  },
  {
    q: "Who is ASSESS LLC?",
    a: "ASSESS LLC is a limited liability company organized under the laws of the State of Hawai'i, United States. Forgewright is its first product. Built on Moloka'i, Hawai'i.",
  },
];

// ─── Scaffold Animation ────────────────────────────────────────────────────────

function ScaffoldDemo() {
  const [step, setStep] = useState(0);
  const blocks = [
    { label: "Role", value: "You are a senior product manager at a B2B SaaS company." },
    { label: "Context", value: "We are preparing for a quarterly business review with enterprise customers." },
    { label: "Task", value: "Write a concise executive summary of Q1 product milestones." },
    { label: "Constraints", value: "Maximum 200 words. No jargon. Focus on customer impact, not internal metrics." },
    { label: "Format", value: "Three short paragraphs: achievements, challenges, next quarter priorities." },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % (blocks.length + 2));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  const visibleBlocks = blocks.slice(0, Math.min(step, blocks.length));
  const tokens = visibleBlocks.reduce((acc, b) => acc + Math.ceil(b.value.length / 4), 0);

  return (
    <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden text-left">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/30">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-3 text-xs text-muted-foreground font-mono">Scaffold Builder</span>
        {tokens > 0 && (
          <span className="ml-auto text-xs text-muted-foreground font-mono">
            ~{tokens} tokens
          </span>
        )}
      </div>
      {/* Blocks */}
      <div className="p-4 space-y-2 min-h-[260px]">
        {visibleBlocks.map((block, i) => (
          <div
            key={block.label}
            className="rounded-md border border-border bg-background px-3 py-2"
            style={{
              opacity: i === visibleBlocks.length - 1 ? (step > blocks.length ? 1 : 0.85) : 1,
              transition: "opacity 0.3s",
            }}
          >
            <div className="text-xs font-semibold text-primary mb-0.5">{block.label}</div>
            <div className="text-xs text-foreground leading-relaxed">{block.value}</div>
          </div>
        ))}
        {visibleBlocks.length < blocks.length && (
          <div className="rounded-md border border-dashed border-border px-3 py-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {blocks[visibleBlocks.length]?.label}…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({
  tier,
  price,
  description,
  features,
  cta,
  highlighted,
  onCta,
}: {
  tier: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  onCta: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-8 flex flex-col gap-6 ${
        highlighted
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border bg-card"
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-foreground">{tier}</span>
          {highlighted && (
            <Badge variant="default" className="text-xs">Most popular</Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {price !== "Free" && (
            <span className="text-sm text-muted-foreground">/month</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
            <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={onCta}
        variant={highlighted ? "default" : "outline"}
        className="w-full"
        size="lg"
      >
        {cta}
      </Button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();

  const handleStartFree = () => {
    if (isAuthenticated) {
      window.location.href = "/app";
    } else {
      window.location.href = getLoginUrl();
    }
  };

  const handleSeeItInAction = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">Forgewright</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#capabilities" className="hover:text-foreground transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/help" className="hover:text-foreground transition-colors">Docs</Link>
          </nav>
          <div className="flex items-center gap-3">
            {!loading && (
              isAuthenticated ? (
                <Button size="sm" onClick={() => (window.location.href = "/app")}>
                  Go to app
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => (window.location.href = getLoginUrl())}
                  >
                    Sign in
                  </Button>
                  <Button size="sm" onClick={handleStartFree}>
                    Start free
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge variant="secondary" className="text-xs font-medium">
            By ASSESS LLC · Built on Moloka'i, Hawai'i
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-foreground">
            LLMs do what you ask.{" "}
            <span className="text-primary">Most of the time, what you asked wasn't what you wanted.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Forgewright is the structured workbench for prompt engineers who want to understand
            why a prompt works — not just copy one that does.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={handleStartFree} className="gap-2">
              {isAuthenticated ? "Go to app" : "Start free"}
              <Zap className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleSeeItInAction} className="gap-2">
              See it in action
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free tier: 10 sessions/month, all features. No credit card required.
          </p>
        </div>
        <div className="lg:pl-8">
          <ScaffoldDemo />
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────────────────── */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-3xl mx-auto px-6 py-20 space-y-6">
          <p className="text-base text-foreground leading-relaxed">
            Every LLM will give you an answer. Most of the time, the answer is wrong in small
            ways you don't notice until it matters — the wrong tone, the wrong length, a subtle
            logical drift, an assumption you never made.
          </p>
          <p className="text-base text-foreground leading-relaxed">
            You rewrite the prompt. You try again. You get something different — maybe better,
            maybe worse. You don't know why. You don't know what to change. You're doing prompt
            engineering by feel.
          </p>
          <p className="text-base text-foreground leading-relaxed font-medium">
            Forgewright is built for people who are tired of prompting by feel.
          </p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold text-foreground mb-12 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              heading: "Discover.",
              body: "Forgewright interviews you the way a senior consultant would — pulling the specification out of your head before you write a single word. Domain, audience, constraints, success criteria. All surfaced, all structured.",
            },
            {
              icon: Layers,
              heading: "Build.",
              body: "Every prompt is an eight-block scaffold: role, context, task, constraints, examples, format, reasoning, output validation. Edit any block independently. See token counts live. Catch anti-patterns before they cost you.",
            },
            {
              icon: Stethoscope,
              heading: "Refine.",
              body: "Paste the output you got. Forgewright diagnoses exactly where your prompt drifted from your intent and shows you the surgical edits that would fix it. The feedback loop closes.",
            },
          ].map(({ icon: Icon, heading, body }) => (
            <div key={heading} className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why craft matters ────────────────────────────────────────────────── */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-3xl mx-auto px-6 py-20 space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Why craft matters</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            A wright is a skilled maker of complex, structured things — a playwright, a
            wheelwright, a shipwright. The craft was never just the output. It was the
            discipline of making the output well. Forgewright applies that discipline to prompts.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            The tools are here. The research is here.{" "}
            <span className="text-foreground font-medium">22 documented patterns</span>,{" "}
            <span className="text-foreground font-medium">32 catalogued failure modes</span>,{" "}
            <span className="text-foreground font-medium">108 tested examples</span>,{" "}
            <span className="text-foreground font-medium">8 model guides</span>. Everything
            that separates guessing from engineering.
          </p>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────────────────── */}
      <section id="capabilities" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold text-foreground mb-12 text-center">
          Everything you need to engineer prompts
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map(({ icon: Icon, title, description, href }) => (
            <Link key={title} href={isAuthenticated ? href : "#"}>
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────────────────────────── */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-bold text-foreground mb-12">Who it's for</h2>
          <div className="space-y-6">
            {WHO_ITS_FOR.map(({ icon: Icon, type, sentence }) => (
              <div key={type} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">{type} — </span>
                  <span className="text-sm text-muted-foreground">{sentence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Simple pricing</h2>
        <p className="text-center text-muted-foreground mb-12">
          Start free. Upgrade when you need more.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <PricingCard
            tier="Free"
            price="Free"
            description="Everything you need to start engineering prompts seriously."
            features={[
              "10 Discovery sessions per month",
              "Full Scaffold Builder (8 blocks)",
              "Pattern Library — 22 patterns",
              "Anti-Pattern Detector — 32 failure modes",
              "Reverse Mode",
              "Output Diagnosis",
              "A/B Compare",
              "Swarm Composer",
              "8 model guides",
              "108 example prompts",
              "JSON + Markdown export",
            ]}
            cta="Start free — no card required"
            highlighted={false}
            onCta={handleStartFree}
          />
          <PricingCard
            tier="Pro"
            price="$15"
            description="Unlimited sessions for teams and power users."
            features={[
              "Unlimited Discovery sessions",
              "Everything in Free",
              "Priority support",
              "Early access to new features",
              "Cancel any time",
            ]}
            cta="Upgrade to Pro"
            highlighted={true}
            onCta={() => (window.location.href = "/pricing")}
          />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="bg-muted/20 border-y border-border">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-bold text-foreground mb-12">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-medium text-foreground text-left py-4 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm text-foreground">Forgewright</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The structured workbench for prompt engineers.
              </p>
              <p className="text-xs text-muted-foreground">
                By ASSESS LLC.<br />Built on Moloka'i, Hawai'i.
              </p>
            </div>
            {/* Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Product</h4>
              <nav className="space-y-2">
                <a href="#capabilities" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <Link href="/pricing" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                <Link href="/help" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
                <Link href="/app" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Launch app</Link>
              </nav>
            </div>
            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Company</h4>
              <nav className="space-y-2">
                <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
                <a href="mailto:hello@forgewright.app" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">hello@forgewright.app</a>
                <a href="mailto:support@forgewright.app" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">support@forgewright.app</a>
              </nav>
            </div>
            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Legal</h4>
              <nav className="space-y-2">
                <Link href="/terms" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/security" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Security</Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Forgewright — by ASSESS LLC. Built on Moloka'i, Hawai'i. © 2026.
            </p>
            <p className="text-xs text-muted-foreground">
              Terms of Service and Privacy Policy are first drafts pending attorney review.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
