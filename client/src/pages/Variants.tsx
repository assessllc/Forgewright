import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  Zap,
  AlignLeft,
  List,
  GitBranch,
} from "lucide-react";
import { estimateTokens, formatTokens, estimateCost, formatCost } from "@/lib/tokens";
import type { ScaffoldBlock, SupportedModel } from "../../../shared/prompitect-types";
import { MODEL_DISPLAY_NAMES } from "../../../shared/prompitect-types";
import { toast } from "sonner";

const VARIANT_META = {
  Terse: {
    icon: AlignLeft,
    description: "Minimum viable prompt. Best for simple tasks, high-volume use, cost optimization.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  Detailed: {
    icon: List,
    description: "Expanded with richer context, more constraints, and edge case handling.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  "Chain-of-Thought": {
    icon: GitBranch,
    description: "Restructured to guide step-by-step reasoning. Best for analysis and multi-step tasks.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
} as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export default function Variants() {
  const params = useParams<{ sessionId: string }>();
  const [, navigate] = useLocation();
  const sessionId = parseInt(params.sessionId ?? "0");

  const [variants, setVariants] = useState<
    Array<{ type: string; content: string; rationale: string }> | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: sessionData } = trpc.sessions.get.useQuery(
    { id: sessionId },
    { enabled: !!sessionId }
  );

  const variantsMutation = trpc.scaffold.generateVariants.useMutation();
  const updateSession = trpc.sessions.update.useMutation();

  useEffect(() => {
    if (sessionData?.variants) {
      setVariants(sessionData.variants as Array<{ type: string; content: string; rationale: string }>);
    }
  }, [sessionData]);

  async function generateVariants() {
    if (!sessionData) return;
    setIsGenerating(true);
    try {
      const result = await variantsMutation.mutateAsync({
        blocks: sessionData.blocks as ScaffoldBlock[],
        targetModel: sessionData.targetModel as SupportedModel,
      });
      setVariants(result.variants);
      // Save variants to session
      await updateSession.mutateAsync({
        id: sessionId,
        variants: result.variants,
      });
      toast.success("Variants generated");
    } catch {
      toast.error("Failed to generate variants");
    } finally {
      setIsGenerating(false);
    }
  }

  const targetModel = (sessionData?.targetModel ?? "gpt-4o") as SupportedModel;

  return (
    <AppLayout
      title={sessionData ? `Variants: ${sessionData.title}` : "Variants"}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/scaffold/${sessionId}`)}
            className="gap-1.5 text-xs h-8 text-muted-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Scaffold
          </Button>
          <Button
            size="sm"
            onClick={generateVariants}
            disabled={isGenerating || !sessionData}
            className="gap-1.5 text-xs h-8"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            {variants ? "Regenerate" : "Generate Variants"}
          </Button>
        </div>
      }
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header info */}
        <div className="mb-6 flex items-center gap-3">
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            {MODEL_DISPLAY_NAMES[targetModel] ?? targetModel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Three variants of the same prompt, optimized for different use cases
          </span>
        </div>

        {/* Empty state */}
        {!variants && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-base font-medium text-foreground">
                Generate Variants
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Automatically produce three versions of your prompt — Terse, Detailed, and Chain-of-Thought — for side-by-side comparison.
              </p>
            </div>
            <Button onClick={generateVariants} disabled={!sessionData} className="gap-2">
              <Zap className="w-4 h-4" />
              Generate Variants
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Generating three variants…
            </p>
          </div>
        )}

        {/* Variants grid */}
        {variants && !isGenerating && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {(["Terse", "Detailed", "Chain-of-Thought"] as const).map((variantType) => {
              const variant = variants.find((v) => v.type === variantType);
              const meta = VARIANT_META[variantType];
              const Icon = meta.icon;
              const tokenCount = variant ? estimateTokens(variant.content) : 0;
              const cost = variant
                ? estimateCost(tokenCount, Math.ceil(tokenCount * 0.5), targetModel)
                : 0;

              return (
                <div
                  key={variantType}
                  className="flex flex-col rounded-xl border border-border bg-card overflow-hidden"
                >
                  {/* Card header */}
                  <div className={cn("px-4 py-3 border-b border-border flex items-center gap-2", meta.bg)}>
                    <Icon className={cn("w-4 h-4", meta.color)} />
                    <span className={cn("text-sm font-semibold", meta.color)}>
                      {variantType}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      {variant && (
                        <>
                          <span className="token-badge">{formatTokens(tokenCount)}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatCost(cost)}
                          </span>
                          <CopyButton text={variant.content} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="px-4 py-2 border-b border-border/50">
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {variant ? (
                      <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                        {variant.content}
                      </pre>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Variant not generated
                      </p>
                    )}
                  </div>

                  {/* Rationale */}
                  {variant?.rationale && (
                    <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground">Rationale: </span>
                        {variant.rationale}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
