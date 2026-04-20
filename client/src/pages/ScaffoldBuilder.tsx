import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  HelpCircle,
  GitBranch,
  Save,
  Download,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  SCAFFOLD_BLOCK_IDS,
  SCAFFOLD_BLOCK_LABELS,
  SCAFFOLD_BLOCK_DESCRIPTIONS,
  SUPPORTED_MODELS,
  MODEL_DISPLAY_NAMES,
  MODEL_PROVIDERS,
  MODEL_PRICING,
  MODEL_CONTEXT_WINDOWS,
  type ScaffoldBlockId,
  type ScaffoldBlock,
  type SupportedModel,
} from "../../../shared/prompitect-types";
import {
  estimateTokens,
  formatTokens,
  estimateCost,
  formatCost,
  getContextUtilization,
  getUtilizationColor,
} from "@/lib/tokens";
import { detectAntiPatterns, getSeverityClass } from "@/lib/antipattern-detector";
import { toast } from "sonner";

function makeDefaultBlocks(): ScaffoldBlock[] {
  return SCAFFOLD_BLOCK_IDS.map((id) => ({
    id,
    label: SCAFFOLD_BLOCK_LABELS[id],
    content: "",
    enabled: id !== "examples" && id !== "output_validation",
    source: "user" as const,
  }));
}

interface ScaffoldBlockCardProps {
  block: ScaffoldBlock;
  index: number;
  totalBlocks: number;
  onChange: (id: ScaffoldBlockId, content: string) => void;
  onToggle: (id: ScaffoldBlockId) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function ScaffoldBlockCard({
  block,
  index,
  totalBlocks,
  onChange,
  onToggle,
  onMoveUp,
  onMoveDown,
}: ScaffoldBlockCardProps) {
  const tokenCount = useMemo(() => estimateTokens(block.content), [block.content]);
  const description = SCAFFOLD_BLOCK_DESCRIPTIONS[block.id as ScaffoldBlockId];

  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        block.enabled
          ? "bg-card border-border"
          : "bg-muted/30 border-border/50 opacity-60"
      )}
    >
      {/* Block header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/50">
        {/* Drag handle / move buttons */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Move block up"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalBlocks - 1}
            className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
            aria-label="Move block down"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />

        {/* Label */}
        <span className="text-sm font-medium text-foreground flex-1">
          {block.label}
        </span>

        {/* Source badge */}
        {block.source !== "user" && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs border-0 px-1.5",
              block.source === "discovery" && "bg-primary/10 text-primary",
              block.source === "template" && "bg-green-500/10 text-green-400",
              block.source === "reverse" && "bg-amber-500/10 text-amber-400"
            )}
          >
            {block.source}
          </Badge>
        )}

        {/* Token count */}
        {block.enabled && block.content && (
          <span className="token-badge">{formatTokens(tokenCount)}</span>
        )}

        {/* Why is this here? tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Why is this here?"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="max-w-xs text-xs bg-popover border-border text-popover-foreground"
          >
            <p className="font-medium mb-1">Why is this here?</p>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </TooltipContent>
        </Tooltip>

        {/* Toggle */}
        <Switch
          checked={block.enabled}
          onCheckedChange={() => onToggle(block.id as ScaffoldBlockId)}
          aria-label={`Toggle ${block.label} block`}
        />
      </div>

      {/* Block content */}
      {block.enabled && (
        <div className="p-3">
          <Textarea
            value={block.content}
            onChange={(e) => onChange(block.id as ScaffoldBlockId, e.target.value)}
            placeholder={getPlaceholder(block.id as ScaffoldBlockId)}
            className="min-h-[80px] resize-y bg-transparent border-0 border-b border-border/30 rounded-none px-0 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-primary/50 transition-colors"
          />
        </div>
      )}
    </div>
  );
}

function getPlaceholder(id: ScaffoldBlockId): string {
  const placeholders: Record<ScaffoldBlockId, string> = {
    role: "e.g., You are a senior software engineer with 10 years of experience in distributed systems…",
    context: "e.g., The user is building a real-time chat application using Node.js and Redis…",
    task: "e.g., Review the following code for potential race conditions and suggest specific fixes…",
    constraints: "e.g., Focus only on concurrency issues. Do not rewrite the entire function. Keep suggestions under 200 words…",
    examples: "e.g., Input: [code snippet]\nOutput: [expected review format]",
    format: "e.g., Respond with a numbered list. Each item: issue description, severity (high/medium/low), and specific fix…",
    reasoning: "e.g., First identify all shared state. Then trace each concurrent access path. Finally assess lock contention…",
    output_validation: "e.g., Before responding, verify: (1) each issue has a concrete fix, (2) no false positives, (3) severity ratings are justified…",
  };
  return placeholders[id];
}

export default function ScaffoldBuilder() {
  const params = useParams<{ sessionId?: string }>();
  const [, navigate] = useLocation();

  const [blocks, setBlocks] = useState<ScaffoldBlock[]>(makeDefaultBlocks());
  const [targetModel, setTargetModel] = useState<SupportedModel>("claude-3-5-sonnet-20241022");
  const [sessionId, setSessionId] = useState<number | null>(
    params.sessionId ? parseInt(params.sessionId) : null
  );
  const [title, setTitle] = useState("Untitled Prompt");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<Array<{ title: string; description: string; blockId: string; priority: string }>>([]);

  // Load session if ID provided
  const { data: sessionData } = trpc.sessions.get.useQuery(
    { id: sessionId! },
    { enabled: !!sessionId }
  );

  // Load template if query param provided
  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const templateSlug = urlParams.get("template");
  const { data: templateData } = trpc.knowledge.getTemplate.useQuery(
    { slug: templateSlug! },
    { enabled: !!templateSlug }
  );

  useEffect(() => {
    if (sessionData) {
      setBlocks(sessionData.blocks as ScaffoldBlock[]);
      setTargetModel((sessionData.targetModel as SupportedModel) ?? "gpt-4o");
      setTitle(sessionData.title);
    }
  }, [sessionData]);

  useEffect(() => {
    if (templateData) {
      setBlocks(templateData.scaffoldBlocks as ScaffoldBlock[]);
      setTitle(templateData.title);
    }
  }, [templateData]);

  // Load initial prompt from sessionStorage (from Home page)
  useEffect(() => {
    if (!sessionId && !templateSlug) {
      const initialPrompt = sessionStorage.getItem("prompitect_initial_prompt");
      const initialModel = sessionStorage.getItem("prompitect_target_model");
      if (initialPrompt) {
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === "task" ? { ...b, content: initialPrompt, enabled: true } : b
          )
        );
        sessionStorage.removeItem("prompitect_initial_prompt");
      }
      if (initialModel) {
        setTargetModel(initialModel as SupportedModel);
        sessionStorage.removeItem("prompitect_target_model");
      }
    }
  }, [sessionId, templateSlug]);

  const scaffoldMutation = trpc.scaffold.generateFromDescription.useMutation();
  const hintsMutation = trpc.scaffold.getModelHints.useMutation();
  const createSession = trpc.sessions.create.useMutation();
  const updateSession = trpc.sessions.update.useMutation();

  // Token calculations
  const totalTokens = useMemo(() => {
    return blocks
      .filter((b) => b.enabled)
      .reduce((sum, b) => sum + estimateTokens(b.content), 0);
  }, [blocks]);

  const estimatedCost = useMemo(
    () => estimateCost(totalTokens, Math.ceil(totalTokens * 0.5), targetModel),
    [totalTokens, targetModel]
  );

  const contextUtilization = useMemo(
    () => getContextUtilization(totalTokens, targetModel),
    [totalTokens, targetModel]
  );

  // Anti-pattern detection
  const fullPromptText = useMemo(() => {
    return blocks
      .filter((b) => b.enabled && b.content)
      .map((b) => b.content)
      .join("\n\n");
  }, [blocks]);

  const detectedIssues = useMemo(
    () => detectAntiPatterns(fullPromptText),
    [fullPromptText]
  );

  function handleBlockChange(id: ScaffoldBlockId, content: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
  }

  function handleToggle(id: ScaffoldBlockId) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function handleMoveDown(index: number) {
    setBlocks((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      if (sessionId) {
        await updateSession.mutateAsync({
          id: sessionId,
          title,
          targetModel,
          blocks,
          totalTokens,
        });
        toast.success("Session saved");
      } else {
        const result = await createSession.mutateAsync({
          title,
          targetModel,
          blocks,
          mode: "direct",
          totalTokens,
        });
        setSessionId(result.id);
        navigate(`/scaffold/${result.id}`, { replace: true });
        toast.success("Session created");
      }
    } catch {
      toast.error("Failed to save session");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExport(format: "json" | "markdown") {
    if (!sessionId) {
      await handleSave();
      return;
    }
    const content =
      format === "json"
        ? JSON.stringify({ title, targetModel, blocks }, null, 2)
        : blocks
            .filter((b) => b.enabled && b.content)
            .map((b) => `## ${b.label}\n\n${b.content}`)
            .join("\n\n---\n\n");
    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompitect-${Date.now()}.${format === "json" ? "json" : "md"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGetHints() {
    setShowHints(true);
    try {
      const result = await hintsMutation.mutateAsync({ blocks, targetModel });
      setHints(result.hints);
    } catch {
      toast.error("Failed to get model hints");
    }
  }

  async function handleGenerateVariants() {
    if (!sessionId) {
      await handleSave();
    }
    navigate(`/variants/${sessionId ?? "new"}`);
  }

  return (
    <AppLayout
      title={title}
      actions={
        <div className="flex items-center gap-2">
          <Select
            value={targetModel}
            onValueChange={(v) => setTargetModel(v as SupportedModel)}
          >
            <SelectTrigger className="w-44 h-8 text-xs bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {SUPPORTED_MODELS.map((m) => (
                <SelectItem key={m} value={m} className="text-xs">
                  {MODEL_DISPLAY_NAMES[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("markdown")}
            className="gap-1.5 text-xs h-8 border-border"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs h-8 border-border"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </Button>
          <Button
            size="sm"
            onClick={handleGenerateVariants}
            className="gap-1.5 text-xs h-8"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Variants
          </Button>
        </div>
      }
    >
      <div className="flex h-full overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
        {/* Main scaffold area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {blocks.map((block, index) => (
            <ScaffoldBlockCard
              key={block.id}
              block={block}
              index={index}
              totalBlocks={blocks.length}
              onChange={handleBlockChange}
              onToggle={handleToggle}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>

        {/* Right sidebar */}
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-border bg-sidebar overflow-y-auto flex flex-col">
          {/* Token counter */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-sidebar-foreground uppercase tracking-wider">
                Token Count
              </span>
              <span
                className={cn(
                  "text-xs font-mono",
                  getUtilizationColor(contextUtilization)
                )}
              >
                {formatTokens(totalTokens)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  contextUtilization > 80
                    ? "bg-destructive"
                    : contextUtilization > 60
                    ? "bg-amber-500"
                    : "bg-primary"
                )}
                style={{ width: `${Math.min(100, contextUtilization)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Est. cost: {formatCost(estimatedCost)}</span>
              <span>
                {contextUtilization.toFixed(1)}% of{" "}
                {formatTokens(MODEL_CONTEXT_WINDOWS[targetModel])}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-mono">
                ${MODEL_PRICING[targetModel].input}/1K in ·{" "}
                ${MODEL_PRICING[targetModel].output}/1K out
              </span>
            </div>
          </div>

          {/* Anti-pattern detector */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-sidebar-foreground uppercase tracking-wider">
                Issues Detected
              </span>
              {detectedIssues.length > 0 && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    detectedIssues.some((i) => i.severity === "high")
                      ? "border-destructive/30 text-destructive"
                      : "border-amber-500/30 text-amber-400"
                  )}
                >
                  {detectedIssues.length}
                </Badge>
              )}
            </div>
            {detectedIssues.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {fullPromptText.length > 20
                  ? "No issues detected"
                  : "Start writing to check for issues"}
              </p>
            ) : (
              <div className="space-y-2">
                {detectedIssues.slice(0, 5).map((issue) => (
                  <div
                    key={issue.slug}
                    className="rounded-md p-2 space-y-1"
                    style={{
                      background:
                        issue.severity === "high"
                          ? "oklch(0.60 0.22 25 / 0.08)"
                          : issue.severity === "medium"
                          ? "oklch(0.78 0.16 75 / 0.08)"
                          : "oklch(0.17 0.007 260)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle
                        className={cn(
                          "w-3 h-3 flex-shrink-0",
                          issue.severity === "high"
                            ? "text-destructive"
                            : issue.severity === "medium"
                            ? "text-amber-400"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {issue.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-4.5">
                      {issue.detectionHint}
                    </p>
                  </div>
                ))}
                {detectedIssues.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{detectedIssues.length - 5} more issues
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Model hints */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-sidebar-foreground uppercase tracking-wider">
                Model Hints
              </span>
              <button
                onClick={handleGetHints}
                disabled={hintsMutation.isPending}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                {hintsMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                Analyze
              </button>
            </div>
            {!showHints ? (
              <p className="text-xs text-muted-foreground">
                Click Analyze to get {MODEL_DISPLAY_NAMES[targetModel]}-specific optimization hints.
              </p>
            ) : hints.length === 0 && !hintsMutation.isPending ? (
              <p className="text-xs text-muted-foreground">No hints available</p>
            ) : (
              <div className="space-y-2">
                {hints.map((hint, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb
                        className={cn(
                          "w-3 h-3 flex-shrink-0",
                          hint.priority === "high"
                            ? "text-amber-400"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {hint.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-4.5">
                      {hint.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export options */}
          <div className="p-4 mt-auto">
            <p className="text-xs font-medium text-sidebar-foreground uppercase tracking-wider mb-2">
              Export
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                className="flex-1 text-xs h-8 border-border"
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("markdown")}
                className="flex-1 text-xs h-8 border-border"
              >
                Markdown
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
