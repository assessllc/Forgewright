/**
 * AntiPatternLibrary.tsx
 *
 * Browseable reference for all 32 seeded anti-patterns.
 * Two-panel layout: left = filterable list, right = detail view.
 *
 * Filters: severity (low / medium / high), category (12 categories), free-text search.
 * Detail panel: description, detection rules, bad-prompt examples, remediation,
 *   and links to the patterns that fix each anti-pattern.
 *
 * Data source: trpc.knowledge.getAntiPatterns (publicProcedure)
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AppLayout from "@/components/AppLayout";
import {
  AlertTriangle,
  Search,
  Shield,
  ChevronRight,
  Wrench,
  Eye,
  BookOpen,
  XCircle,
  CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "low" | "medium" | "high";

interface AntiPattern {
  id: number;
  slug: string;
  name: string;
  category: string;
  severity: Severity;
  description: string;
  detectionRules: unknown[];
  detectionHint: string | null;
  examples: unknown[];
  remediation: string;
  fixedByPatterns: string[];
  sortOrder: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; border: string; dot: string }> = {
  low: {
    label: "Low",
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  specification: "Specification",
  clarity: "Clarity",
  format: "Format",
  framing: "Framing",
  complexity: "Complexity",
  logic: "Logic",
  quality: "Quality",
  robustness: "Robustness",
  safety: "Safety",
  "model-specific": "Model-Specific",
  "signal-dilution": "Signal Dilution",
  efficiency: "Efficiency",
};

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Anti-Pattern List Item ───────────────────────────────────────────────────

function AntiPatternCard({
  ap,
  isSelected,
  onClick,
}: {
  ap: AntiPattern;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:border-border/80 hover:bg-muted/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={ap.severity} />
            <span className="text-xs text-muted-foreground capitalize">
              {CATEGORY_LABELS[ap.category] ?? ap.category}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground mt-1.5 leading-snug">{ap.name}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {ap.description}
          </p>
        </div>
        <ChevronRight
          className={`w-4 h-4 flex-shrink-0 mt-1 transition-colors ${
            isSelected ? "text-primary" : "text-muted-foreground/40"
          }`}
        />
      </div>
    </button>
  );
}

// ─── Detection Rule Display ───────────────────────────────────────────────────

function DetectionRule({ rule }: { rule: unknown }) {
  if (typeof rule === "string") {
    return (
      <div className="flex items-start gap-2 text-xs">
        <span className="font-mono text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded text-xs flex-shrink-0 mt-0.5">
          rule
        </span>
        <span className="text-muted-foreground leading-relaxed">{rule}</span>
      </div>
    );
  }
  if (typeof rule === "object" && rule !== null) {
    const r = rule as Record<string, unknown>;
    return (
      <div className="flex items-start gap-2 text-xs">
        <span className="font-mono text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded text-xs flex-shrink-0 mt-0.5">
          {String(r.type ?? "rule")}
        </span>
        <span className="text-muted-foreground leading-relaxed">
          {String(r.pattern ?? r.description ?? r.value ?? JSON.stringify(r))}
        </span>
      </div>
    );
  }
  return null;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ ap }: { ap: AntiPattern }) {
  const cfg = SEVERITY_CONFIG[ap.severity];

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="p-5 border-b space-y-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <SeverityBadge severity={ap.severity} />
              <Badge variant="outline" className="text-xs capitalize">
                {CATEGORY_LABELS[ap.category] ?? ap.category}
              </Badge>
            </div>
            <h2 className="text-lg font-semibold text-foreground leading-snug">{ap.name}</h2>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}
          >
            <AlertTriangle className={`w-5 h-5 ${cfg.color}`} />
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{ap.description}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5 space-y-6">

        {/* Detection hint */}
        {ap.detectionHint && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                How to spot it
              </p>
              <p className="text-sm text-foreground leading-relaxed">{ap.detectionHint}</p>
            </div>
          </div>
        )}

        {/* Detection rules */}
        {ap.detectionRules && ap.detectionRules.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Detection Rules
              </h3>
            </div>
            <div className="space-y-2 pl-1">
              {ap.detectionRules.map((rule, i) => (
                <DetectionRule key={i} rule={rule} />
              ))}
            </div>
          </section>
        )}

        {/* Bad-prompt examples */}
        {ap.examples && ap.examples.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Examples of This Anti-Pattern
              </h3>
            </div>
            <div className="space-y-2">
              {ap.examples.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap"
                >
                  {typeof ex === "string" ? ex : JSON.stringify(ex, null, 2)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Remediation */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Remediation
            </h3>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-relaxed">{ap.remediation}</p>
          </div>
        </section>

        {/* Fixing patterns */}
        {ap.fixedByPatterns && ap.fixedByPatterns.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary/70" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Patterns That Address This
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {ap.fixedByPatterns.map((slug) => (
                <Link key={slug} href="/patterns">
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer hover:border-primary/50 hover:text-primary transition-colors capitalize"
                  >
                    {slug.replace(/-/g, " ")}
                  </Badge>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click any pattern to open it in the Pattern Library.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-3">
      <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
      {hasFilters ? (
        <>
          <p className="text-sm font-medium text-muted-foreground">No anti-patterns match your filters</p>
          <p className="text-xs text-muted-foreground/70">Try clearing the search or adjusting the severity filter.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-muted-foreground">Anti-patterns loading…</p>
          <p className="text-xs text-muted-foreground/70">If this persists, the database may be unavailable.</p>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AntiPatternLibrary() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data: antiPatterns = [], isLoading } = trpc.knowledge.getAntiPatterns.useQuery(undefined);

  // Derive unique categories from data
  const categories = useMemo(() => {
    const seen = new Set<string>();
    antiPatterns.forEach((ap) => seen.add(ap.category));
    return Array.from(seen).sort();
  }, [antiPatterns]);

  // Filter
  const filtered = useMemo(() => {
    let results = antiPatterns as AntiPattern[];
    if (severityFilter !== "all") {
      results = results.filter((ap) => ap.severity === severityFilter);
    }
    if (categoryFilter !== "all") {
      results = results.filter((ap) => ap.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (ap) =>
          ap.name.toLowerCase().includes(q) ||
          ap.description.toLowerCase().includes(q) ||
          ap.category.toLowerCase().includes(q) ||
          (ap.detectionHint ?? "").toLowerCase().includes(q) ||
          ap.remediation.toLowerCase().includes(q)
      );
    }
    // Sort: high → medium → low, then by sortOrder
    const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
    return results.sort((a, b) => {
      const diff = order[a.severity] - order[b.severity];
      return diff !== 0 ? diff : a.sortOrder - b.sortOrder;
    });
  }, [antiPatterns, severityFilter, categoryFilter, search]);

  const selected = useMemo(
    () => filtered.find((ap) => ap.slug === selectedSlug) ?? filtered[0] ?? null,
    [filtered, selectedSlug]
  );

  const hasFilters = search.trim() !== "" || severityFilter !== "all" || categoryFilter !== "all";

  // Severity counts for filter badges
  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { all: antiPatterns.length, low: 0, medium: 0, high: 0 };
    antiPatterns.forEach((ap) => { counts[ap.severity] = (counts[ap.severity] ?? 0) + 1; });
    return counts;
  }, [antiPatterns]);

  return (
    <AppLayout title="Anti-Pattern Library">
      <div className="flex flex-col h-full overflow-hidden">

        {/* Page header */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Anti-Pattern Library</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {antiPatterns.length} documented failure modes with detection rules and remediation guidance.
                Each entry is grounded in real prompt engineering failures observed across Claude, GPT-4o, and Gemini.
              </p>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search anti-patterns…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Severity:</span>
            {(["all", "high", "medium", "low"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  severityFilter === s
                    ? s === "all"
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : `${SEVERITY_CONFIG[s as Severity].bg} ${SEVERITY_CONFIG[s as Severity].border} ${SEVERITY_CONFIG[s as Severity].color}`
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {s === "all" ? `All (${severityCounts.all})` : `${SEVERITY_CONFIG[s].label} (${severityCounts[s] ?? 0})`}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium">Category:</span>
            <button
              onClick={() => setCategoryFilter("all")}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                categoryFilter === "all"
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:border-border/80"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-2 py-0.5 rounded border transition-colors capitalize ${
                  categoryFilter === cat
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {/* Two-panel body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left: list */}
          <div className="w-80 flex-shrink-0 border-r flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-3 py-2 border-b">
              <span className="text-xs text-muted-foreground">
                {filtered.length} of {antiPatterns.length} anti-patterns
              </span>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
                ))
              ) : filtered.length === 0 ? (
                <EmptyState hasFilters={hasFilters} />
              ) : (
                filtered.map((ap) => (
                  <AntiPatternCard
                    key={ap.slug}
                    ap={ap}
                    isSelected={ap.slug === (selected?.slug ?? null)}
                    onClick={() => setSelectedSlug(ap.slug)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: detail */}
          <div className="flex-1 overflow-hidden">
            {selected ? (
              <DetailPanel ap={selected} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Select an anti-pattern to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="flex-shrink-0 px-5 py-2 border-t bg-muted/10">
          <p className="text-xs text-muted-foreground">
            Anti-patterns are drawn from the Anthropic Prompt Engineering Guide, OpenAI Cookbook, and practitioner
            research. The real-time detector in the{" "}
            <Link href="/scaffold" className="text-primary/80 hover:text-primary underline underline-offset-2">
              Scaffold Builder
            </Link>{" "}
            flags these patterns as you write.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
