/**
 * Compare.tsx — Phase 6 Feature 2: A/B Prompt Comparison
 *
 * Pairwise preference evaluation for prompt variants.
 * Methodology: Chatbot Arena-style side-by-side comparison (Chiang et al. 2024).
 *
 * Flow:
 * 1. User enters a shared input text
 * 2. User defines Variant A and Variant B (system prompts)
 * 3. Both variants run in parallel via /api/stream/compare (two SSE streams)
 * 4. User reads both outputs and picks a preference
 * 5. Verdict is saved with optional reason tags and notes
 * 6. Win rate leaderboard shows cumulative performance
 *
 * Source: Chiang et al. (2024) "Chatbot Arena: An Open Platform for Evaluating LLMs
 * by Human Preference"
 */
import { useState, useRef, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  GitCompare,
  Play,
  Loader2,
  Trophy,
  ThumbsUp,
  Minus,
  ThumbsDown,
  BarChart2,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Preference = "a" | "b" | "tie" | "both-bad";

type ReasonTag =
  | "accuracy"
  | "tone"
  | "format"
  | "concision"
  | "creativity"
  | "safety"
  | "completeness"
  | "specificity";

const REASON_TAG_LABELS: Record<ReasonTag, string> = {
  accuracy: "More accurate",
  tone: "Better tone",
  format: "Better format",
  concision: "More concise",
  creativity: "More creative",
  safety: "Safer",
  completeness: "More complete",
  specificity: "More specific",
};

// ─── Output Panel ─────────────────────────────────────────────────────────────

interface OutputPanelProps {
  label: string;
  output: string;
  isStreaming: boolean;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
}

function OutputPanel({ label, output, isStreaming, isSelected, onSelect, disabled }: OutputPanelProps) {
  return (
    <div
      className={cn(
        "flex-1 rounded-lg border transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card",
        !disabled && output && "cursor-pointer hover:border-primary/50"
      )}
      onClick={() => !disabled && output && onSelect()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{label}</span>
          {isStreaming && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Generating…</span>
            </div>
          )}
          {isSelected && (
            <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
              Selected
            </Badge>
          )}
        </div>
        {output && !isStreaming && (
          <span className="text-xs text-muted-foreground">{output.length} chars</span>
        )}
      </div>
      <div className="p-4 min-h-[200px]">
        {output ? (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{output}</p>
        ) : isStreaming ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Waiting for response…</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Output will appear here after running comparison.</p>
        )}
      </div>
    </div>
  );
}

// ─── Win Rate Bar ─────────────────────────────────────────────────────────────

interface WinRateEntry {
  label: string;
  wins: number;
  losses: number;
  ties: number;
  bothBad: number;
  total: number;
  winRate: number;
}

function WinRateBar({ entry }: { entry: WinRateEntry }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{entry.label}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="text-emerald-400 font-medium">{entry.wins}W</span>
          <span className="text-red-400">{entry.losses}L</span>
          <span>{entry.ties}T</span>
          <span className="font-semibold text-foreground">{entry.winRate}%</span>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${entry.winRate}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Compare() {
  const [activeTab, setActiveTab] = useState<"compare" | "history">("compare");

  // Session selection (simplified — uses session 0 for anonymous)
  const [sessionId] = useState<number>(0);

  // Variant configuration
  const [inputText, setInputText] = useState("");
  const [variantALabel, setVariantALabel] = useState("Variant A");
  const [variantAPrompt, setVariantAPrompt] = useState("");
  const [variantBLabel, setVariantBLabel] = useState("Variant B");
  const [variantBPrompt, setVariantBPrompt] = useState("");

  // Streaming state
  const [isRunning, setIsRunning] = useState(false);
  const [outputA, setOutputA] = useState("");
  const [outputB, setOutputB] = useState("");
  const [streamingA, setStreamingA] = useState(false);
  const [streamingB, setStreamingB] = useState(false);
  const abortRefA = useRef<AbortController | null>(null);
  const abortRefB = useRef<AbortController | null>(null);

  // Verdict state
  const [preference, setPreference] = useState<Preference | null>(null);
  const [reasonTags, setReasonTags] = useState<ReasonTag[]>([]);
  const [notes, setNotes] = useState("");
  const [verdictSaved, setVerdictSaved] = useState(false);

  // Persisted run
  const [runId, setRunId] = useState<number | null>(null);

  const createRun = trpc.comparison.createComparisonRun.useMutation();
  const updateOutputs = trpc.comparison.updateComparisonOutputs.useMutation();
  const recordVerdict = trpc.comparison.recordVerdict.useMutation();

  const { data: winRates = [], refetch: refetchWinRates } = trpc.comparison.getWinRates.useQuery(
    { sessionId },
    { enabled: activeTab === "history" }
  );

  const { data: runs = [], isLoading: runsLoading } = trpc.comparison.listComparisonRuns.useQuery(
    { sessionId, limit: 20 },
    { enabled: activeTab === "history" }
  );

  const streamVariant = useCallback(
    async (
      variantPrompt: string,
      abortRef: React.MutableRefObject<AbortController | null>,
      setOutput: (v: string) => void,
      setStreaming: (v: boolean) => void
    ) => {
      abortRef.current = new AbortController();
      setStreaming(true);
      let full = "";

      try {
        const response = await fetch("/api/stream/compare", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ inputText: inputText.trim(), variantPrompt }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;
            try {
              const evt = JSON.parse(jsonStr) as { type: string; text?: string; fullText?: string };
              if (evt.type === "token" && evt.text) {
                full += evt.text;
                setOutput(full);
              } else if (evt.type === "done" && evt.fullText) {
                full = evt.fullText;
                setOutput(full);
              }
            } catch { /* skip */ }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Stream error: " + String(err));
        }
      } finally {
        setStreaming(false);
      }

      return full;
    },
    [inputText]
  );

  const runComparison = useCallback(async () => {
    if (!inputText.trim()) { toast.error("Input text is required"); return; }
    if (!variantAPrompt.trim()) { toast.error("Variant A prompt is required"); return; }
    if (!variantBPrompt.trim()) { toast.error("Variant B prompt is required"); return; }

    setIsRunning(true);
    setOutputA("");
    setOutputB("");
    setPreference(null);
    setReasonTags([]);
    setNotes("");
    setVerdictSaved(false);
    setRunId(null);

    // Create DB record
    let newRunId: number | null = null;
    try {
      const run = await createRun.mutateAsync({
        sessionId,
        inputText: inputText.trim(),
        variantALabel,
        variantAPrompt: variantAPrompt.trim(),
        variantBLabel,
        variantBPrompt: variantBPrompt.trim(),
      });
      newRunId = run.id;
      setRunId(run.id);
    } catch {
      // Non-fatal — continue without DB record
    }

    // Run both streams in parallel
    const [fullA, fullB] = await Promise.all([
      streamVariant(variantAPrompt.trim(), abortRefA, setOutputA, setStreamingA),
      streamVariant(variantBPrompt.trim(), abortRefB, setOutputB, setStreamingB),
    ]);

    // Save outputs to DB
    if (newRunId) {
      try {
        await updateOutputs.mutateAsync({
          runId: newRunId,
          variantAOutput: fullA,
          variantBOutput: fullB,
        });
      } catch { /* Non-fatal */ }
    }

    setIsRunning(false);
  }, [inputText, variantALabel, variantAPrompt, variantBLabel, variantBPrompt, sessionId, createRun, updateOutputs, streamVariant]);

  const stopAll = useCallback(() => {
    abortRefA.current?.abort();
    abortRefB.current?.abort();
    setIsRunning(false);
    setStreamingA(false);
    setStreamingB(false);
  }, []);

  const saveVerdict = useCallback(async () => {
    if (!preference) { toast.error("Select a preference first"); return; }
    if (!runId) {
      toast.success("Preference noted (not saved — no active session)");
      setVerdictSaved(true);
      return;
    }
    try {
      await recordVerdict.mutateAsync({
        comparisonRunId: runId,
        preference,
        reasonTags: reasonTags.length > 0 ? reasonTags : undefined,
        notes: notes.trim() || undefined,
      });
      setVerdictSaved(true);
      toast.success("Verdict saved");
      void refetchWinRates();
    } catch (err) {
      toast.error("Failed to save verdict: " + String(err));
    }
  }, [preference, runId, reasonTags, notes, recordVerdict, refetchWinRates]);

  const toggleReasonTag = (tag: ReasonTag) => {
    setReasonTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasOutputs = outputA && outputB;

  return (
    <AppLayout title="A/B Compare">
      {/* Tab bar */}
      <div className="border-b border-border px-6">
        <div className="flex gap-1">
          {(["compare", "history"] as const).map((tab) => (
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
              {tab === "compare" ? (
                <span className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4" />
                  Compare Variants
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Win Rates
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Compare Tab ── */}
      {activeTab === "compare" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-primary" />
                A/B Prompt Comparison
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Run two prompt variants on the same input and pick the better output.
                Methodology: pairwise preference evaluation (Chatbot Arena, Chiang et al. 2024).
              </p>
            </div>

            {/* Input text */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Shared Input Text</label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="The user message / input that both variants will respond to…"
                className="min-h-[80px] text-sm resize-y"
                disabled={isRunning}
              />
            </div>

            {/* Variant configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { label: variantALabel, setLabel: setVariantALabel, prompt: variantAPrompt, setPrompt: setVariantAPrompt, id: "A" },
                { label: variantBLabel, setLabel: setVariantBLabel, prompt: variantBPrompt, setPrompt: setVariantBPrompt, id: "B" },
              ].map(({ label, setLabel, prompt, setPrompt, id }) => (
                <div key={id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {id}
                    </div>
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder={`Variant ${id} label`}
                      className="h-8 text-sm font-medium"
                      disabled={isRunning}
                    />
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`System prompt for Variant ${id}…`}
                    className="min-h-[120px] text-sm font-mono resize-y"
                    disabled={isRunning}
                  />
                </div>
              ))}
            </div>

            {/* Run controls */}
            <div className="flex items-center gap-3">
              {isRunning ? (
                <Button variant="destructive" size="sm" onClick={stopAll}>
                  <X className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={runComparison}
                  disabled={!inputText.trim() || !variantAPrompt.trim() || !variantBPrompt.trim()}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Comparison
                </Button>
              )}
            </div>

            {/* Output panels */}
            {(outputA || outputB || streamingA || streamingB) && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <OutputPanel
                    label={variantALabel}
                    output={outputA}
                    isStreaming={streamingA}
                    isSelected={preference === "a"}
                    onSelect={() => !verdictSaved && setPreference("a")}
                    disabled={verdictSaved || isRunning}
                  />
                  <OutputPanel
                    label={variantBLabel}
                    output={outputB}
                    isStreaming={streamingB}
                    isSelected={preference === "b"}
                    onSelect={() => !verdictSaved && setPreference("b")}
                    disabled={verdictSaved || isRunning}
                  />
                </div>

                {/* Verdict controls */}
                {hasOutputs && !isRunning && (
                  <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                    <p className="text-sm font-medium text-foreground">Which output is better?</p>

                    {/* Preference buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant={preference === "a" ? "default" : "outline"}
                        size="sm"
                        onClick={() => !verdictSaved && setPreference("a")}
                        disabled={verdictSaved}
                        className="gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {variantALabel}
                      </Button>
                      <Button
                        variant={preference === "b" ? "default" : "outline"}
                        size="sm"
                        onClick={() => !verdictSaved && setPreference("b")}
                        disabled={verdictSaved}
                        className="gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {variantBLabel}
                      </Button>
                      <Button
                        variant={preference === "tie" ? "default" : "outline"}
                        size="sm"
                        onClick={() => !verdictSaved && setPreference("tie")}
                        disabled={verdictSaved}
                        className="gap-2"
                      >
                        <Minus className="w-4 h-4" />
                        Tie
                      </Button>
                      <Button
                        variant={preference === "both-bad" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => !verdictSaved && setPreference("both-bad")}
                        disabled={verdictSaved}
                        className="gap-2"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Both Bad
                      </Button>
                    </div>

                    {/* Reason tags */}
                    {preference && preference !== "both-bad" && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Why? (optional)</p>
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(REASON_TAG_LABELS) as ReasonTag[]).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => !verdictSaved && toggleReasonTag(tag)}
                              disabled={verdictSaved}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs border transition-colors",
                                reasonTags.includes(tag)
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                              )}
                            >
                              {REASON_TAG_LABELS[tag]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {preference && !verdictSaved && (
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Notes (optional)</label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="What made the difference?"
                          className="min-h-[60px] text-sm resize-none"
                          maxLength={1000}
                        />
                      </div>
                    )}

                    {/* Save button */}
                    {!verdictSaved ? (
                      <Button
                        size="sm"
                        onClick={saveVerdict}
                        disabled={!preference || recordVerdict.isPending}
                      >
                        {recordVerdict.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trophy className="w-4 h-4 mr-2" />
                        )}
                        Save Verdict
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <Trophy className="w-4 h-4" />
                        Verdict saved
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── History / Win Rates Tab ── */}
      {activeTab === "history" && (
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" />
                Win Rate Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Cumulative win/loss/tie statistics per variant label across all comparison runs.
              </p>
            </div>

            {winRates.length > 0 ? (
              <div className="rounded-lg border border-border bg-card p-4 space-y-4">
                {winRates.map((entry) => (
                  <WinRateBar key={entry.label} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <BarChart2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No comparison verdicts yet. Run a comparison and save a verdict to see win rates.
                </p>
              </div>
            )}

            {/* Recent runs */}
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Recent Comparisons</h2>
              {runsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : runs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No comparisons yet.</p>
              ) : (
                <div className="space-y-2">
                  {runs.map((run) => (
                    <div key={run.id} className="rounded-lg border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {run.variantALabel} vs {run.variantBLabel}
                          </span>
                          {run.verdict && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                run.verdict.preference === "a"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : run.verdict.preference === "b"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : run.verdict.preference === "tie"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              )}
                            >
                              {run.verdict.preference === "a"
                                ? `${run.variantALabel} won`
                                : run.verdict.preference === "b"
                                ? `${run.variantBLabel} won`
                                : run.verdict.preference === "tie"
                                ? "Tie"
                                : "Both bad"}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(run.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {run.inputText && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Input: {run.inputText.slice(0, 100)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
