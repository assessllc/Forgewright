/**
 * Diagnose.tsx — Phase 6 Feature 1: Output Diagnosis
 *
 * Allows users to paste any LLM output (and optionally the prompt that produced it)
 * and receive a structured diagnosis of output quality failures.
 *
 * The diagnosis runs as an SSE stream (/api/stream/diagnose) and returns a JSON
 * analysis identifying failure modes from the 25-entry diagnosis_patterns catalog.
 *
 * Two modes:
 * 1. Diagnose tab — paste output, run diagnosis, see issues with remediations
 * 2. Library tab — browse the 25 diagnosis patterns catalog
 */
import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Stethoscope,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  BookOpen,
  Clipboard,
  X,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiagnosisIssue {
  id: string;
  failureMode: string;
  category: string;
  severity: "low" | "medium" | "high";
  title: string;
  explanation: string;
  affectedBlock: string;
  remediation: string;
  matchedText: string;
}

interface DiagnosisResult {
  overallQuality: "good" | "acceptable" | "poor";
  summary: string;
  driftMap: Record<string, number>;
  issues: DiagnosisIssue[];
  positives: string[];
}

interface DiagnosisPattern {
  id: number;
  slug: string;
  name: string;
  category: string;
  severity: string;
  description: string;
  detectionHeuristics: string[];
  examplePair: { prompt: string; output: string; analysis: string } | null;
  canonicalRemediation: string;
  primaryAffectedBlock: string;
  linkedPatternSlugs: string[];
  linkedAntiPatternSlugs: string[];
  sourceReference: string | null;
  sortOrder: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  high: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: AlertTriangle,
  },
  medium: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: AlertCircle,
  },
  low: {
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Info,
  },
};

const QUALITY_CONFIG = {
  good: { color: "text-emerald-400", label: "Good", icon: CheckCircle2 },
  acceptable: { color: "text-amber-400", label: "Acceptable", icon: AlertCircle },
  poor: { color: "text-red-400", label: "Poor", icon: AlertTriangle },
};

const CATEGORY_LABELS: Record<string, string> = {
  "reasoning-drift": "Reasoning Drift",
  "hallucination": "Hallucination",
  "format-drift": "Format Drift",
  "persona-drift": "Persona Drift",
  "scope-drift": "Scope Drift",
  "refusal-drift": "Refusal Drift",
  "instruction-drift": "Instruction Drift",
  "output-quality": "Output Quality",
  "structural-drift": "Structural Drift",
  "task-specific": "Task-Specific",
};

// ─── Issue Card ───────────────────────────────────────────────────────────────

function IssueCard({ issue }: { issue: DiagnosisIssue }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.medium;
  const SeverityIcon = config.icon;

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", config.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <SeverityIcon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">{issue.title}</span>
              <Badge variant="outline" className={cn("text-xs font-mono", config.badge)}>
                {issue.severity}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[issue.category] ?? issue.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{issue.explanation}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-7 w-7 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-border/50">
          {issue.matchedText && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Triggered by:</p>
              <blockquote className="text-xs text-foreground/80 bg-background/50 rounded px-3 py-2 border-l-2 border-amber-500/50 italic">
                "{issue.matchedText.slice(0, 200)}{issue.matchedText.length > 200 ? "…" : ""}"
              </blockquote>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Affected scaffold block: <span className="font-mono text-primary">{issue.affectedBlock}</span>
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-xs font-medium text-emerald-400">Remediation</p>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">{issue.remediation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Library Pattern Card ─────────────────────────────────────────────────────

function PatternCard({ pattern }: { pattern: DiagnosisPattern }) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[pattern.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.medium;
  const SeverityIcon = config.icon;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <SeverityIcon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">{pattern.name}</span>
              <Badge variant="outline" className={cn("text-xs", config.badge)}>
                {pattern.severity}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
                {pattern.slug}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {CATEGORY_LABELS[pattern.category] ?? pattern.category} · Block: {pattern.primaryAffectedBlock}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-7 w-7 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{pattern.description}</p>

      {expanded && (
        <div className="space-y-4 pt-2 border-t border-border/50">
          {pattern.detectionHeuristics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground mb-2">Detection Heuristics</p>
              <ul className="space-y-1">
                {pattern.detectionHeuristics.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pattern.examplePair && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Example</p>
              <div className="bg-muted/30 rounded-md p-3 space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Prompt:</p>
                  <p className="text-xs text-foreground/80 italic">"{pattern.examplePair.prompt}"</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Output:</p>
                  <p className="text-xs text-foreground/80 italic">"{pattern.examplePair.output}"</p>
                </div>
                <div className="border-t border-border/50 pt-2">
                  <p className="text-xs font-medium text-amber-400 mb-1">Analysis:</p>
                  <p className="text-xs text-foreground/80">{pattern.examplePair.analysis}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-xs font-medium text-emerald-400">Canonical Remediation</p>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed">{pattern.canonicalRemediation}</p>
          </div>

          {pattern.sourceReference && (
            <p className="text-xs text-muted-foreground/60 italic">{pattern.sourceReference}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Diagnose() {
  const [activeTab, setActiveTab] = useState<"diagnose" | "library">("diagnose");
  const [outputText, setOutputText] = useState("");
  const [promptText, setPromptText] = useState("");
  const [showPromptField, setShowPromptField] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Library state
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryCategory, setLibraryCategory] = useState<string>("all");
  const [librarySeverity, setLibrarySeverity] = useState<string>("all");

  const { data: patterns = [], isLoading: patternsLoading } = trpc.diagnosis.getDiagnosisPatterns.useQuery(
    undefined,
    { enabled: activeTab === "library" }
  );
  const { data: categories = [] } = trpc.diagnosis.getDiagnosisCategories.useQuery(
    undefined,
    { enabled: activeTab === "library" }
  );

  const filteredPatterns = patterns.filter((p) => {
    const matchesCategory = libraryCategory === "all" || p.category === libraryCategory;
    const matchesSeverity = librarySeverity === "all" || p.severity === librarySeverity;
    const matchesSearch =
      !librarySearch ||
      p.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      p.description.toLowerCase().includes(librarySearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesCategory && matchesSeverity && matchesSearch;
  });

  const runDiagnosis = useCallback(async () => {
    if (!outputText.trim() || outputText.trim().length < 20) {
      toast.error("Output must be at least 20 characters");
      return;
    }

    setIsStreaming(true);
    setStreamBuffer("");
    setResult(null);
    setParseError(null);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/stream/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          outputText: outputText.trim(),
          promptText: showPromptField && promptText.trim() ? promptText.trim() : undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6);
          if (jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr) as { type: string; text?: string; fullText?: string; message?: string };
            if (event.type === "token" && event.text) {
              fullText += event.text;
              setStreamBuffer(fullText);
            } else if (event.type === "done" && event.fullText) {
              fullText = event.fullText;
            } else if (event.type === "error") {
              throw new Error(event.message ?? "Stream error");
            }
          } catch {
            // Malformed chunk — skip
          }
        }
      }

      // Parse the final JSON result
      try {
        // Extract JSON from the full text (may have markdown fences)
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");
        const parsed = JSON.parse(jsonMatch[0]) as DiagnosisResult;
        setResult(parsed);
      } catch (err) {
        setParseError(`Could not parse diagnosis result: ${String(err)}`);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Diagnosis failed: " + String(err));
      }
    } finally {
      setIsStreaming(false);
      setStreamBuffer("");
    }
  }, [outputText, promptText, showPromptField]);

  const stopDiagnosis = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearAll = useCallback(() => {
    setOutputText("");
    setPromptText("");
    setResult(null);
    setParseError(null);
    setStreamBuffer("");
  }, []);

  const qualityConfig = result ? QUALITY_CONFIG[result.overallQuality] : null;
  const QualityIcon = qualityConfig?.icon;

  const highCount = result?.issues.filter((i) => i.severity === "high").length ?? 0;
  const medCount = result?.issues.filter((i) => i.severity === "medium").length ?? 0;
  const lowCount = result?.issues.filter((i) => i.severity === "low").length ?? 0;

  return (
    <AppLayout title="Output Diagnosis">
      {/* Tab bar */}
      <div className="border-b border-border px-6">
        <div className="flex gap-1">
          {(["diagnose", "library"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "diagnose" ? (
                <span className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Diagnose Output
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Failure Mode Library ({patterns.length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Diagnose Tab ── */}
      {activeTab === "diagnose" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary" />
                Output Diagnosis
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Paste any LLM output to identify quality failures and get scaffold-level remediations.
                Grounded in 25 documented failure modes from published research.
              </p>
            </div>

            {/* Input area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">LLM Output to Diagnose</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowPromptField(!showPromptField)}
                  >
                    {showPromptField ? "Hide prompt" : "+ Add prompt (optional)"}
                  </Button>
                  {outputText && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={clearAll}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <Textarea
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder="Paste the LLM output you want to diagnose here…"
                className="min-h-[160px] font-mono text-sm resize-y"
                disabled={isStreaming}
              />

              {showPromptField && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Prompt that produced this output (optional — improves diagnosis accuracy)
                  </label>
                  <Textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Paste the prompt here…"
                    className="min-h-[100px] font-mono text-sm resize-y"
                    disabled={isStreaming}
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                {isStreaming ? (
                  <Button variant="destructive" size="sm" onClick={stopDiagnosis}>
                    <X className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={runDiagnosis}
                    disabled={!outputText.trim() || outputText.trim().length < 20}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Run Diagnosis
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">
                  {outputText.length} characters
                </span>
              </div>
            </div>

            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Analyzing output…</span>
                {streamBuffer.length > 0 && (
                  <span className="text-xs font-mono text-muted-foreground/60">
                    {streamBuffer.length} chars received
                  </span>
                )}
              </div>
            )}

            {/* Parse error */}
            {parseError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                {parseError}
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-5">
                {/* Overall quality banner */}
                <div
                  className={cn(
                    "rounded-lg border p-4 flex items-start gap-3",
                    result.overallQuality === "good"
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : result.overallQuality === "acceptable"
                      ? "bg-amber-500/10 border-amber-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  )}
                >
                  {QualityIcon && (
                    <QualityIcon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", qualityConfig?.color)} />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold text-sm", qualityConfig?.color)}>
                        Overall Quality: {qualityConfig?.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {highCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                            {highCount} high
                          </Badge>
                        )}
                        {medCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                            {medCount} medium
                          </Badge>
                        )}
                        {lowCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {lowCount} low
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">{result.summary}</p>
                  </div>
                </div>

                {/* Positives */}
                {result.positives.length > 0 && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      What the output does well
                    </p>
                    <ul className="space-y-1">
                      {result.positives.map((p, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Issues */}
                {result.issues.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Detected Issues ({result.issues.length})
                    </h3>
                    {result.issues
                      .sort((a, b) => {
                        const order = { high: 0, medium: 1, low: 2 };
                        return order[a.severity] - order[b.severity];
                      })
                      .map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    No significant quality issues detected.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Library Tab ── */}
      {activeTab === "library" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Output Failure Mode Library
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                25 documented output failure modes with detection heuristics, annotated examples,
                and scaffold-level remediations. Sources: Dhuliawala et al. (2023), Madaan et al. (2023),
                Anthropic and OpenAI prompt engineering guides.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search failure modes…"
                  className="pl-9 h-9"
                />
              </div>
              <select
                value={libraryCategory}
                onChange={(e) => setLibraryCategory(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c] ?? c}
                  </option>
                ))}
              </select>
              <select
                value={librarySeverity}
                onChange={(e) => setLibrarySeverity(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="all">All severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filteredPatterns.length} of {patterns.length}
              </span>
            </div>

            {/* Pattern list */}
            {patternsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredPatterns.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No failure modes match your filters.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatterns.map((p) => (
                  <PatternCard key={p.slug} pattern={p as DiagnosisPattern} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
