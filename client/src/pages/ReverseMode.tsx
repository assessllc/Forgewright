import { useState, useRef } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useStream } from "@/hooks/useStream";
import {
  Loader2,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
} from "lucide-react";
import type { ScaffoldBlock } from "../../../shared/prompitect-types";
import { toast } from "sonner";

interface AnalysisResult {
  analysis: {
    tone: string;
    structure: string;
    impliedRole: string;
    impliedAudience: string;
    domain: string;
    taskType: string;
    keyPatterns: string[];
  };
  blocks: ScaffoldBlock[];
  title: string;
  confidence: string;
  confidenceNote: string;
}

const CONFIDENCE_STYLES = {
  high: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  medium: { icon: Info, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  low: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

const EXAMPLE_OUTPUT = `The deployment pipeline failed at the Docker build stage. Here's what I found:

**Root Cause**
The base image \`node:18-alpine\` was updated yesterday and now includes a breaking change in the npm version that conflicts with your lockfile format.

**Immediate Fix**
Pin your base image to a specific digest:
\`\`\`dockerfile
FROM node:18.19.0-alpine3.19
\`\`\`

**Why This Happened**
Using \`node:18-alpine\` without a version pin means your builds are non-deterministic. The image tag resolves to whatever is current at build time.

**Prevention**
1. Always pin base images to specific digests in production Dockerfiles
2. Use Dependabot or Renovate to get automated PRs when base images update
3. Add a CI check that fails if unpinned base images are detected

This should unblock your deployment immediately. Let me know if you need help setting up the automated update workflow.`;

export default function ReverseMode() {
  const [, navigate] = useLocation();
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const inputTextRef = useRef("");
  inputTextRef.current = inputText;

  const createSession = trpc.sessions.create.useMutation();

  const { stream, isStreaming } = useStream("/api/stream/reverse", {
    onToken: (_token, accumulated) => {
      setStreamingText(accumulated);
    },
    onDone: (fullText) => {
      setStreamingText("");
      try {
        // The reverse stream endpoint returns a JSON object
        const parsed = JSON.parse(fullText) as {
          tone: string;
          structure: string;
          impliedRole: string;
          impliedAudience: string;
          domain: string;
          taskType: string;
          keyPatterns: string[];
          suggestedBlocks: Record<string, string>;
        };

        const blocks: ScaffoldBlock[] = [
          { id: "role", label: "Role", content: parsed.suggestedBlocks.role ?? "", enabled: !!(parsed.suggestedBlocks.role), source: "reverse" },
          { id: "context", label: "Context", content: parsed.suggestedBlocks.context ?? "", enabled: !!(parsed.suggestedBlocks.context), source: "reverse" },
          { id: "task", label: "Task", content: parsed.suggestedBlocks.task ?? "", enabled: !!(parsed.suggestedBlocks.task), source: "reverse" },
          { id: "constraints", label: "Constraints", content: parsed.suggestedBlocks.constraints ?? "", enabled: !!(parsed.suggestedBlocks.constraints), source: "reverse" },
          { id: "examples", label: "Examples", content: "", enabled: false, source: "reverse" },
          { id: "format", label: "Format", content: parsed.suggestedBlocks.format ?? "", enabled: !!(parsed.suggestedBlocks.format), source: "reverse" },
          { id: "reasoning", label: "Reasoning", content: parsed.suggestedBlocks.reasoning ?? "", enabled: !!(parsed.suggestedBlocks.reasoning), source: "reverse" },
          { id: "output_validation", label: "Output Validation", content: parsed.suggestedBlocks.output_validation ?? "", enabled: !!(parsed.suggestedBlocks.output_validation), source: "reverse" },
        ];

        const enabledCount = blocks.filter((b) => b.enabled).length;
        const confidence = enabledCount >= 5 ? "high" : enabledCount >= 3 ? "medium" : "low";

        setResult({
          analysis: {
            tone: parsed.tone,
            structure: parsed.structure,
            impliedRole: parsed.impliedRole,
            impliedAudience: parsed.impliedAudience,
            domain: parsed.domain,
            taskType: parsed.taskType,
            keyPatterns: parsed.keyPatterns,
          },
          blocks,
          title: `Reverse: ${parsed.taskType} (${parsed.domain})`,
          confidence,
          confidenceNote:
            confidence === "high"
              ? "Strong signal — most scaffold blocks reconstructed with high confidence."
              : confidence === "medium"
              ? "Moderate signal — some blocks inferred from context."
              : "Weak signal — limited information to reconstruct the prompt.",
        });
      } catch {
        toast.error("Failed to parse analysis result. The model may have returned unexpected output.");
      }
    },
    onError: () => {
      toast.error("Analysis failed. Please try again.");
      setStreamingText("");
    },
  });

  const isAnalyzing = isStreaming;

  async function handleAnalyze() {
    if (!inputTextRef.current.trim() || isStreaming) return;
    setResult(null);
    try {
      await stream({ text: inputTextRef.current.trim() });
    } catch {
      // onError callback handles UI state
    }
  }

  async function handleBuildScaffold() {
    if (!result) return;
    try {
      const sessionResult = await createSession.mutateAsync({
        title: result.title,
        targetModel: "gpt-4o",
        blocks: result.blocks as Parameters<typeof createSession.mutateAsync>[0]["blocks"],
        mode: "reverse",
        domain: result.analysis.domain,
      });
      navigate(`/scaffold/${sessionResult.id}`);
    } catch {
      toast.error("Failed to create session");
    }
  }

  function handleReset() {
    setResult(null);
    setInputText("");
  }

  const confidenceKey = (result?.confidence ?? "low") as keyof typeof CONFIDENCE_STYLES;
  const confidenceStyle = CONFIDENCE_STYLES[confidenceKey] ?? CONFIDENCE_STYLES.low;
  const ConfidenceIcon = confidenceStyle.icon;

  return (
    <AppLayout title="Reverse Mode">
      <div className="h-full overflow-y-auto" style={{ height: "calc(100vh - 3.5rem)" }}>
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">Reverse Mode</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Paste an example output from a language model. The tool analyzes tone, structure, patterns, and audience — then auto-populates a scaffold with the prompt that most likely produced it.
            </p>
          </div>

          {/* Input area */}
          {!result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Example Output
                </label>
                <button
                  onClick={() => setInputText(EXAMPLE_OUTPUT)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Load example
                </button>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a model output here — a code review, a technical explanation, a creative piece, a structured report, anything…"
                className="min-h-[280px] resize-y bg-card border-border text-sm text-foreground placeholder:text-muted-foreground/50 font-mono"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {inputText.length} characters · ~{Math.ceil(inputText.length / 4)} tokens
                </span>
                <Button
                  onClick={() => void handleAnalyze()}
                  disabled={!inputText.trim() || isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {isAnalyzing ? "Analyzing…" : "Analyze Output"}
                </Button>
              </div>

              {/* Streaming progress */}
              {isStreaming && streamingText && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-xs font-medium text-primary">Analyzing output…</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono leading-relaxed max-h-24 overflow-hidden">
                    {streamingText.slice(0, 300)}
                    {streamingText.length > 300 && "…"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-5">
              {/* Confidence banner */}
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3",
                  confidenceStyle.bg,
                  confidenceStyle.border
                )}
              >
                <ConfidenceIcon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", confidenceStyle.color)} />
                <div className="space-y-0.5">
                  <p className={cn("text-sm font-medium", confidenceStyle.color)}>
                    {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} confidence reconstruction
                  </p>
                  <p className="text-xs text-muted-foreground">{result.confidenceNote}</p>
                </div>
              </div>

              {/* Analysis card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Tone", value: result.analysis.tone },
                    { label: "Structure", value: result.analysis.structure },
                    { label: "Implied Role", value: result.analysis.impliedRole },
                    { label: "Implied Audience", value: result.analysis.impliedAudience },
                    { label: "Domain", value: result.analysis.domain },
                    { label: "Task Type", value: result.analysis.taskType },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="text-sm text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                {result.analysis.keyPatterns.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Key Patterns Detected
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.analysis.keyPatterns.map((p, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-xs border-primary/30 text-primary bg-primary/5"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reconstructed scaffold preview */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Reconstructed Scaffold
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/5"
                  >
                    reverse-engineered
                  </Badge>
                </div>
                <div className="divide-y divide-border/50">
                  {result.blocks
                    .filter((b) => b.enabled && b.content)
                    .map((block) => (
                      <div key={block.id} className="px-5 py-3 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {block.label}
                        </p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {block.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button onClick={() => void handleBuildScaffold()} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Open in Scaffold Builder
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2 border-border"
                >
                  <RotateCcw className="w-4 h-4" />
                  Analyze Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
