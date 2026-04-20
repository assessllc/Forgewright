/**
 * ModelGuide.tsx
 *
 * Reference page for all 8 seeded LLM models.
 * Three views: Overview cards, Comparison table, and per-model Detail with cost calculator.
 *
 * Data source: trpc.knowledge.getModelQuirks (publicProcedure)
 *
 * Views:
 *   - Overview: card grid, "best for" tags, capability badges
 *   - Compare: side-by-side table of pricing, context window, capabilities
 *   - Detail: selected model — strengths, weaknesses, optimization tips, recommended/avoid patterns
 *
 * Cost calculator: enter token count → see cost across all models.
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  Cpu,
  ChevronRight,
  Check,
  X,
  Zap,
  DollarSign,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Eye,
  Code2,
  Brain,
  Layers,
  Calculator,
  LayoutGrid,
  Table2,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingTier {
  inputPer1k: number;
  outputPer1k: number;
  currency: string;
}

interface OptimizationTip {
  title: string;
  description: string;
  example?: string;
}

interface ModelQuirk {
  id: number;
  modelId: string;
  modelFamily: string;
  modelDisplayName: string;
  provider: string;
  strengths: string[];
  weaknesses: string[];
  optimizationTips: OptimizationTip[] | string[];
  recommendedPatterns: string[];
  avoidPatterns: string[];
  contextWindowTokens: number | null;
  pricing: PricingTier | null;
  knowledgeCutoff: string | null;
  supportsStreaming: boolean;
  supportsSystemPrompt: boolean;
  supportsJsonMode: boolean;
  supportsVision: boolean;
  sortOrder: number;
}

type ViewMode = "overview" | "compare" | "detail";

// ─── Provider color mapping ───────────────────────────────────────────────────

const PROVIDER_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Anthropic: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400" },
  OpenAI: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  Google: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-400" },
  "Meta (open-source)": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", dot: "bg-purple-400" },
  "Mistral AI": { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400", dot: "bg-sky-400" },
};

function providerColor(provider: string) {
  return PROVIDER_COLORS[provider] ?? { bg: "bg-muted/30", border: "border-border", text: "text-muted-foreground", dot: "bg-muted-foreground" };
}

// ─── "Best for" tags derived from model strengths ────────────────────────────

const BEST_FOR_MAP: Record<string, string[]> = {
  "claude-3-5-sonnet-20241022": ["Reasoning", "Code", "Long context", "Analysis"],
  "claude-3-opus-20240229": ["Complex reasoning", "Nuanced writing", "Research"],
  "gpt-4o": ["Multimodal", "Code", "Speed", "JSON output"],
  "o1": ["Deep reasoning", "Math", "Science", "Step-by-step"],
  "gemini-1.5-pro": ["Ultra-long context", "Multimodal", "Document analysis"],
  "llama-3-70b": ["Open-source", "Privacy", "Self-hosted", "Cost"],
  "mistral-large": ["European data", "Multilingual", "Instruction following"],
  "gpt-4o-mini": ["Speed", "Cost efficiency", "High volume", "Simple tasks"],
};

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatContext(tokens: number | null): string {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}k`;
  return String(tokens);
}

function formatPrice(price: number): string {
  if (price === 0) return "Free";
  if (price < 0.001) return `$${(price * 1000).toFixed(3)}/1M`;
  return `$${price.toFixed(4)}/1k`;
}

function formatCost(tokens: number, pricePerK: number): string {
  const cost = (tokens / 1000) * pricePerK;
  if (cost < 0.0001) return "<$0.0001";
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(3)}`;
}

// ─── Capability badge ─────────────────────────────────────────────────────────

function CapBadge({ supported, label }: { supported: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
        supported
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-muted/20 border-border text-muted-foreground/50 line-through"
      }`}
    >
      {supported ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ─── Overview Card ────────────────────────────────────────────────────────────

function ModelCard({
  model,
  isSelected,
  onClick,
}: {
  model: ModelQuirk;
  isSelected: boolean;
  onClick: () => void;
}) {
  const pc = providerColor(model.provider);
  const bestFor = BEST_FOR_MAP[model.modelId] ?? [];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
          : "border-border hover:border-border/80 hover:bg-muted/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border mb-2 ${pc.bg} ${pc.border} ${pc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pc.dot}`} />
            {model.provider}
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">{model.modelDisplayName}</h3>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-colors ${isSelected ? "text-primary" : "text-muted-foreground/30"}`} />
      </div>

      {/* Capability badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <CapBadge supported={model.supportsStreaming} label="Streaming" />
        <CapBadge supported={model.supportsJsonMode} label="JSON mode" />
        <CapBadge supported={model.supportsVision} label="Vision" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {formatContext(model.contextWindowTokens)} ctx
        </span>
        {model.pricing && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {formatPrice(model.pricing.inputPer1k)} in
          </span>
        )}
      </div>

      {/* Best for tags */}
      {bestFor.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {bestFor.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// ─── Comparison Table ─────────────────────────────────────────────────────────

function CompareTable({ models }: { models: ModelQuirk[] }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">
              Model
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Provider
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Context
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Input / 1k
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Output / 1k
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Stream
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              JSON
            </th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Vision
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Cutoff
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((m, i) => {
            const pc = providerColor(m.provider);
            return (
              <tr
                key={m.modelId}
                className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
              >
                <td className="py-3 px-4 font-medium text-foreground">{m.modelDisplayName}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${pc.bg} ${pc.border} ${pc.text}`}>
                    {m.provider}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground font-mono text-xs">
                  {formatContext(m.contextWindowTokens)}
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground font-mono text-xs">
                  {m.pricing ? `$${m.pricing.inputPer1k.toFixed(4)}` : "—"}
                </td>
                <td className="py-3 px-4 text-right text-muted-foreground font-mono text-xs">
                  {m.pricing ? `$${m.pricing.outputPer1k.toFixed(4)}` : "—"}
                </td>
                <td className="py-3 px-4 text-center">
                  {m.supportsStreaming ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {m.supportsJsonMode ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {m.supportsVision ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs font-mono">
                  {m.knowledgeCutoff ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Cost Calculator ──────────────────────────────────────────────────────────

function CostCalculator({ models }: { models: ModelQuirk[] }) {
  const [inputTokens, setInputTokens] = useState("1000");
  const [outputTokens, setOutputTokens] = useState("500");

  const inTok = Math.max(0, parseInt(inputTokens, 10) || 0);
  const outTok = Math.max(0, parseInt(outputTokens, 10) || 0);

  const rows = useMemo(
    () =>
      models
        .filter((m) => m.pricing)
        .map((m) => ({
          model: m,
          inputCost: (inTok / 1000) * m.pricing!.inputPer1k,
          outputCost: (outTok / 1000) * m.pricing!.outputPer1k,
          total: (inTok / 1000) * m.pricing!.inputPer1k + (outTok / 1000) * m.pricing!.outputPer1k,
        }))
        .sort((a, b) => a.total - b.total),
    [models, inTok, outTok]
  );

  const cheapest = rows[0];
  const mostExpensive = rows[rows.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Calculator className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Cost Calculator</h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Enter your expected token counts to compare costs across all models for a single request.
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Input tokens:</label>
          <Input
            type="number"
            min="0"
            value={inputTokens}
            onChange={(e) => setInputTokens(e.target.value)}
            className="w-24 h-7 text-xs font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Output tokens:</label>
          <Input
            type="number"
            min="0"
            value={outputTokens}
            onChange={(e) => setOutputTokens(e.target.value)}
            className="w-24 h-7 text-xs font-mono"
          />
        </div>
        <div className="flex gap-2">
          {[{ label: "1k/500", i: "1000", o: "500" }, { label: "10k/2k", i: "10000", o: "2000" }, { label: "100k/5k", i: "100000", o: "5000" }].map((preset) => (
            <button
              key={preset.label}
              onClick={() => { setInputTokens(preset.i); setOutputTokens(preset.o); }}
              className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {cheapest && mostExpensive && cheapest.model.modelId !== mostExpensive.model.modelId && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Cheapest: {cheapest.model.modelDisplayName} ({formatCost(inTok + outTok, (cheapest.total / ((inTok + outTok) / 1000)) || 0)})
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <DollarSign className="w-3.5 h-3.5" />
            Priciest: {mostExpensive.model.modelDisplayName}
          </div>
        </div>
      )}

      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-xs min-w-[400px]">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Model</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Input cost</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Output cost</th>
              <th className="text-right py-2 px-3 text-muted-foreground font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.model.modelId} className={`border-b border-border/50 ${i === 0 ? "bg-emerald-500/5" : ""}`}>
                <td className="py-2 px-3 font-medium text-foreground">{row.model.modelDisplayName}</td>
                <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                  {formatCost(inTok, row.model.pricing!.inputPer1k)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                  {formatCost(outTok, row.model.pricing!.outputPer1k)}
                </td>
                <td className={`py-2 px-3 text-right font-mono font-semibold ${i === 0 ? "text-emerald-400" : "text-foreground"}`}>
                  {formatCost(inTok + outTok, row.total / Math.max((inTok + outTok) / 1000, 0.001))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground/60">
        Prices are per 1,000 tokens as seeded. Verify current pricing at each provider's API pricing page before production use.
      </p>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ model }: { model: ModelQuirk }) {
  const pc = providerColor(model.provider);
  const bestFor = BEST_FOR_MAP[model.modelId] ?? [];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="p-5 border-b space-y-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border mb-2 ${pc.bg} ${pc.border} ${pc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
              {model.provider}
            </div>
            <h2 className="text-xl font-semibold text-foreground">{model.modelDisplayName}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {model.modelId} · {formatContext(model.contextWindowTokens)} context window
              {model.knowledgeCutoff ? ` · Knowledge cutoff ${model.knowledgeCutoff}` : ""}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${pc.bg} border ${pc.border}`}>
            <Cpu className={`w-6 h-6 ${pc.text}`} />
          </div>
        </div>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-2">
          <CapBadge supported={model.supportsStreaming} label="Streaming" />
          <CapBadge supported={model.supportsSystemPrompt} label="System prompt" />
          <CapBadge supported={model.supportsJsonMode} label="JSON mode" />
          <CapBadge supported={model.supportsVision} label="Vision" />
        </div>

        {/* Best for */}
        {bestFor.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Best for:</span>
            {bestFor.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Pricing summary */}
        {model.pricing && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Input: <span className="font-mono text-foreground ml-1">${model.pricing.inputPer1k.toFixed(4)}/1k tokens</span>
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Output: <span className="font-mono text-foreground ml-1">${model.pricing.outputPer1k.toFixed(4)}/1k tokens</span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5 space-y-6">

        {/* Strengths */}
        {model.strengths && model.strengths.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Strengths</h3>
            </div>
            <ul className="space-y-1.5">
              {model.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Weaknesses */}
        {model.weaknesses && model.weaknesses.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Known Limitations</h3>
            </div>
            <ul className="space-y-1.5">
              {model.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <X className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Optimization tips */}
        {model.optimizationTips && model.optimizationTips.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary/70" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Optimization Tips</h3>
            </div>
            <div className="space-y-3">
              {model.optimizationTips.map((tip, i) => {
                if (typeof tip === "string") {
                  return (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                      <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-mono">
                        {i + 1}
                      </span>
                      {tip}
                    </div>
                  );
                }
                const t = tip as OptimizationTip;
                return (
                  <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                    {t.example && (
                      <div className="mt-2 p-2 rounded bg-muted/30 font-mono text-xs text-foreground/70 whitespace-pre-wrap">
                        {t.example}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommended patterns */}
        {model.recommendedPatterns && model.recommendedPatterns.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary/70" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommended Patterns</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {model.recommendedPatterns.map((slug) => (
                <Link key={slug} href="/patterns">
                  <Badge variant="outline" className="text-xs cursor-pointer hover:border-primary/50 hover:text-primary transition-colors capitalize">
                    {slug.replace(/-/g, " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Patterns to avoid */}
        {model.avoidPatterns && model.avoidPatterns.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patterns to Avoid</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {model.avoidPatterns.map((slug) => (
                <Badge key={slug} variant="outline" className="text-xs border-red-500/30 text-red-400/70 capitalize">
                  {slug.replace(/-/g, " ")}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ModelGuide() {
  const [view, setView] = useState<ViewMode>("overview");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const { data: models = [], isLoading } = trpc.knowledge.getModelQuirks.useQuery(undefined);

  const selectedModel = useMemo(
    () => (models as unknown as ModelQuirk[]).find((m) => m.modelId === selectedModelId) ?? (models as unknown as ModelQuirk[])[0] ?? null,
    [models, selectedModelId]
  );

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setView("detail");
  };

  return (
    <AppLayout title="Model Guide">
      <div className="flex flex-col h-full overflow-hidden">

        {/* Page header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Model Guide</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Capability profiles, pricing, and prompt optimization notes for {models.length} LLMs.
                Use the comparison table to choose the right model before you build.
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border w-fit">
            {([
              { id: "overview", label: "Overview", icon: LayoutGrid },
              { id: "compare", label: "Compare", icon: Table2 },
              { id: "detail", label: "Detail", icon: Info },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
                  view === id
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : view === "overview" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {(models as unknown as ModelQuirk[]).map((m) => (
                  <ModelCard
                    key={m.modelId}
                    model={m}
                    isSelected={m.modelId === selectedModel?.modelId}
                    onClick={() => handleSelectModel(m.modelId)}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Click any card to view the full capability profile and optimization tips.
              </p>
            </div>
          ) : view === "compare" ? (
            <div className="space-y-8">
              <CompareTable models={models as unknown as ModelQuirk[]} />
              <div className="border-t border-border pt-6">
                <CostCalculator models={models as unknown as ModelQuirk[]} />
              </div>
            </div>
          ) : view === "detail" ? (
            <div className="flex gap-4 h-full">
              {/* Model selector sidebar */}
              <div className="w-48 flex-shrink-0 space-y-1">
                {(models as unknown as ModelQuirk[]).map((m) => {
                  const pc = providerColor(m.provider);
                  return (
                    <button
                      key={m.modelId}
                      onClick={() => setSelectedModelId(m.modelId)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                        m.modelId === selectedModel?.modelId
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                      }`}
                    >
                      <div className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${pc.dot}`} />
                      {m.modelDisplayName}
                    </button>
                  );
                })}
              </div>

              {/* Detail content */}
              <div className="flex-1 overflow-auto border border-border rounded-xl">
                {selectedModel ? (
                  <DetailPanel model={selectedModel} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Select a model to view its profile
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-2 border-t bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Model data sourced from official API documentation (Anthropic, OpenAI, Google, Meta, Mistral AI).
            Pricing is per 1,000 tokens and subject to change — verify at each provider's pricing page before production use.
            The{" "}
            <Link href="/scaffold" className="text-primary/80 hover:text-primary underline underline-offset-2">
              Scaffold Builder
            </Link>{" "}
            uses this data to surface model-specific optimization hints as you write.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
