/**
 * DiagnosisLibrary.tsx
 *
 * Browseable reference for all 25 diagnosis patterns.
 * Route: /diagnosis-library
 *
 * Layout mirrors AntiPatternLibrary: filter sidebar + list + detail panel.
 * Patterns are grouped by category (format-drift, hallucination, etc.)
 * with severity badges and full detail including detection heuristics,
 * example pairs, remediation, and linked patterns/anti-patterns.
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Stethoscope,
  Search,
  X,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Link2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type DiagnosisPattern = {
  id: number;
  slug: string;
  name: string;
  category: string;
  severity: "low" | "medium" | "high";
  description: string;
  detectionHeuristics: string[];
  examplePair: { prompt: string; output: string; analysis: string } | null;
  canonicalRemediation: string;
  primaryAffectedBlock: string | null;
  linkedPatternSlugs: string[];
  linkedAntiPatternSlugs: string[];
  sourceReference: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  "format-drift":      "Format Drift",
  "hallucination":     "Hallucination",
  "instruction-drift": "Instruction Drift",
  "output-quality":    "Output Quality",
  "persona-drift":     "Persona Drift",
  "reasoning-drift":   "Reasoning Drift",
  "refusal-drift":     "Refusal / Over-refusal",
  "scope-drift":       "Scope Drift",
  "structural-drift":  "Structural Drift",
  "task-specific":     "Task-Specific",
};

function severityConfig(severity: string) {
  switch (severity) {
    case "high":   return { label: "High",   className: "bg-red-600/20 text-red-400 border-red-600/30" };
    case "medium": return { label: "Medium", className: "bg-amber-600/20 text-amber-400 border-amber-600/30" };
    case "low":    return { label: "Low",    className: "bg-sky-600/20 text-sky-400 border-sky-600/30" };
    default:       return { label: severity, className: "" };
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = severityConfig(severity);
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ pattern }: { pattern: DiagnosisPattern }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b shrink-0">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-base leading-tight">{pattern.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <SeverityBadge severity={pattern.severity} />
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[pattern.category] ?? pattern.category}
              </Badge>
              {pattern.primaryAffectedBlock && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  Affects: {pattern.primaryAffectedBlock}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">{pattern.description}</p>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-6">

          {/* Detection Heuristics */}
          {pattern.detectionHeuristics.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detection Heuristics
              </h3>
              <ul className="space-y-2">
                {pattern.detectionHeuristics.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Canonical Remediation */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Canonical Remediation
            </h3>
            <div className="bg-emerald-950/20 border border-emerald-700/30 rounded-lg px-4 py-3 text-sm leading-relaxed">
              {pattern.canonicalRemediation}
            </div>
          </section>

          {/* Example Pair */}
          {pattern.examplePair && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Example
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Prompt that triggers this pattern:</p>
                  <pre className="bg-muted/30 rounded-lg px-3 py-2 text-xs font-mono whitespace-pre-wrap break-words border border-border/50">
                    {pattern.examplePair.prompt}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Problematic output:</p>
                  <pre className="bg-red-950/20 border border-red-700/30 rounded-lg px-3 py-2 text-xs font-mono whitespace-pre-wrap break-words">
                    {pattern.examplePair.output}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Analysis:</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pattern.examplePair.analysis}</p>
                </div>
              </div>
            </section>
          )}

          {/* Linked Patterns */}
          {pattern.linkedPatternSlugs.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Patterns That Address This
              </h3>
              <div className="flex flex-wrap gap-2">
                {pattern.linkedPatternSlugs.map((slug) => (
                  <Link key={slug} href="/patterns">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 transition-colors gap-1 text-xs"
                    >
                      {slug}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Linked Anti-Patterns */}
          {pattern.linkedAntiPatternSlugs.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Related Anti-Patterns
              </h3>
              <div className="flex flex-wrap gap-2">
                {pattern.linkedAntiPatternSlugs.map((slug) => (
                  <Link key={slug} href="/antipatterns">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-amber-500/10 transition-colors gap-1 text-xs border-amber-600/30 text-amber-400"
                    >
                      {slug}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Source Reference */}
          {pattern.sourceReference && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Source
              </h3>
              <p className="text-xs text-muted-foreground italic">{pattern.sourceReference}</p>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DiagnosisLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<DiagnosisPattern | null>(null);

  const { data, isLoading } = trpc.diagnosis.getDiagnosisPatterns.useQuery({});
  const patterns = (data as DiagnosisPattern[] | undefined) ?? [];

  // Derive unique categories from data
  const categories = useMemo(() => {
    const cats = new Set(patterns.map((p) => p.category));
    return Array.from(cats).sort();
  }, [patterns]);

  const filtered = useMemo(() => {
    return patterns.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSeverity && p.severity !== selectedSeverity) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.detectionHeuristics.some((h) => h.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [patterns, selectedCategory, selectedSeverity, search]);

  // Group by category for display
  const grouped = useMemo(() => {
    const map = new Map<string, DiagnosisPattern[]>();
    for (const p of filtered) {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    }
    return map;
  }, [filtered]);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    patterns.forEach((p) => counts[p.severity]++);
    return counts;
  }, [patterns]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar — filters + list */}
      <div className="w-80 shrink-0 border-r flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-4 h-4 text-primary" />
            <h1 className="font-semibold text-sm">Diagnosis Library</h1>
            <Badge variant="secondary" className="ml-auto text-xs">{patterns.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            25 output failure patterns grounded in published research on LLM evaluation and self-critique.
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patterns…"
              className="pl-8 h-8 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Severity filter */}
        <div className="px-4 py-3 border-b shrink-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">Severity</p>
          <div className="flex gap-1.5 flex-wrap">
            {(["high", "medium", "low"] as const).map((s) => {
              const cfg = severityConfig(s);
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSeverity(selectedSeverity === s ? null : s)}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border transition-colors",
                    selectedSeverity === s ? cfg.className : "border-border/50 text-muted-foreground hover:border-border"
                  )}
                >
                  {cfg.label} ({severityCounts[s]})
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter */}
        <div className="px-4 py-3 border-b shrink-0">
          <p className="text-xs font-medium text-muted-foreground mb-2">Category</p>
          <div className="flex flex-col gap-0.5">
            {categories.map((cat) => {
              const count = patterns.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={cn(
                    "flex items-center justify-between text-xs px-2 py-1 rounded transition-colors text-left",
                    selectedCategory === cat
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <span>{CATEGORY_LABELS[cat] ?? cat}</span>
                  <span className="text-muted-foreground/60">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pattern list */}
        <ScrollArea className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
              Loading…
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
              No patterns match your filters.
            </div>
          )}
          {!isLoading && Array.from(grouped.entries()).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 bg-muted/20 border-b">
                <p className="text-xs font-medium text-muted-foreground">
                  {CATEGORY_LABELS[category] ?? category}
                  <span className="ml-1 text-muted-foreground/50">({items.length})</span>
                </p>
              </div>
              {items.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border/30 hover:bg-muted/30 transition-colors",
                    selectedPattern?.id === pattern.id && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <SeverityBadge severity={pattern.severity} />
                      </div>
                      <p className="text-xs font-medium truncate">{pattern.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {pattern.description}
                      </p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Right — detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedPattern ? (
          <DetailPanel pattern={selectedPattern} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base mb-1">Diagnosis Pattern Reference</h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                25 output failure patterns grounded in research by Dhuliawala et al. (2023),
                Madaan et al. (2023), Shinn et al. (2023), and Wang et al. (2022).
                Select a pattern to see detection heuristics, example pairs, and remediation guidance.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <Badge variant="outline" className="text-xs">
                {severityCounts.high} High severity
              </Badge>
              <Badge variant="outline" className="text-xs">
                {severityCounts.medium} Medium severity
              </Badge>
              <Badge variant="outline" className="text-xs">
                {severityCounts.low} Low severity
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 mt-2"
              asChild
            >
              <Link href="/diagnose">
                <Stethoscope className="w-3.5 h-3.5" />
                Diagnose an Output
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
