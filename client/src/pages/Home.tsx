import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code2,
  Mail,
  BarChart2,
  PenLine,
  BookOpen,
  Database,
  FileText,
  Megaphone,
  ArrowRight,
  FlipHorizontal,
  Clock,
  Layers,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  SUPPORTED_MODELS,
  MODEL_DISPLAY_NAMES,
  MODEL_PROVIDERS,
  type SupportedModel,
} from "../../../shared/prompitect-types";
import { estimateTokens, formatTokens, estimateCost, formatCost } from "@/lib/tokens";
import { cn } from "@/lib/utils";

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  Code2,
  Mail,
  BarChart2,
  PenLine,
  BookOpen,
  Database,
  FileText,
  Megaphone,
};

export default function Home() {
  const [, navigate] = useLocation();
  const [promptText, setPromptText] = useState("");
  const [selectedModel, setSelectedModel] = useState<SupportedModel>("claude-3-5-sonnet-20241022");
  const [reverseMode, setReverseMode] = useState(false);

  const { data: templates } = trpc.knowledge.getTemplates.useQuery();
  const { data: sessions } = trpc.sessions.list.useQuery({ limit: 5 });

  const tokenCount = useMemo(() => estimateTokens(promptText), [promptText]);
  const estimatedCost = useMemo(
    () => estimateCost(tokenCount, Math.ceil(tokenCount * 0.5), selectedModel),
    [tokenCount, selectedModel]
  );

  function handleStart() {
    if (reverseMode) {
      navigate("/reverse");
    } else if (promptText.trim()) {
      // Store in sessionStorage for the next page to pick up
      sessionStorage.setItem("promptwright_initial_prompt", promptText);
      sessionStorage.setItem("promptwright_target_model", selectedModel);
      navigate("/scaffold");
    } else {
      navigate("/discovery");
    }
  }

  function handleTemplateClick(slug: string) {
    navigate(`/scaffold?template=${slug}&model=${selectedModel}`);
  }

  return (
    <AppLayout>
      <div className="min-h-full flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 lg:py-24">
          <div className="w-full max-w-3xl space-y-8">
            {/* Wordmark */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-semibold tracking-tight">Promptwright</span>
              </div>
              <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                A structured workbench for crafting, analyzing, and refining LLM prompts.
                Built on real prompt engineering research.
              </p>
            </div>

            {/* Main input */}
            <div className="space-y-3">
              <div className="relative">
                <Textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={
                    reverseMode
                      ? "Paste example output here — the tool will reverse-engineer the prompt that produced it..."
                      : "Describe what you want to build, or paste an existing prompt to improve it..."
                  }
                  className="min-h-[140px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground text-sm leading-relaxed pr-4 pb-10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleStart();
                    }
                  }}
                />
                {/* Token counter */}
                {promptText && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{formatTokens(tokenCount)} tokens</span>
                    <span>·</span>
                    <span>{formatCost(estimatedCost)}</span>
                  </div>
                )}
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Model selector */}
                <Select
                  value={selectedModel}
                  onValueChange={(v) => setSelectedModel(v as SupportedModel)}
                >
                  <SelectTrigger className="w-52 bg-card border-border text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {SUPPORTED_MODELS.map((model) => (
                      <SelectItem key={model} value={model} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span>{MODEL_DISPLAY_NAMES[model]}</span>
                          <span className="text-muted-foreground text-xs">
                            {MODEL_PROVIDERS[model]}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reverse Mode toggle */}
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    id="reverse-mode"
                    checked={reverseMode}
                    onCheckedChange={setReverseMode}
                  />
                  <Label
                    htmlFor="reverse-mode"
                    className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    Reverse Mode
                  </Label>
                </div>

                {/* CTA */}
                <Button
                  onClick={handleStart}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {reverseMode ? (
                    <>
                      <FlipHorizontal className="w-4 h-4" />
                      Analyze Output
                    </>
                  ) : promptText.trim() ? (
                    <>
                      <Layers className="w-4 h-4" />
                      Build Scaffold
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Start Discovery
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ⌘ + Enter to start · Leave blank to start guided discovery
              </p>
            </div>

            {/* Quick-start templates */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Start
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(templates ?? FALLBACK_TEMPLATES).map((t) => {
                  const Icon = (t.icon ? TEMPLATE_ICONS[t.icon] : null) ?? FileText;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => handleTemplateClick(t.slug)}
                      className="flex flex-col items-start gap-1.5 p-3 rounded-lg bg-card border border-border hover:border-primary/40 hover:bg-card/80 transition-colors text-left group"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-xs font-medium text-foreground leading-tight">
                        {t.title}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight line-clamp-2">
                        {t.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        {sessions && sessions.length > 0 && (
          <div className="border-t border-border px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recent Sessions
                  </span>
                </div>
                <button
                  onClick={() => navigate("/sessions")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all →
                </button>
              </div>
              <div className="space-y-1">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => navigate(`/scaffold/${session.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-card transition-colors text-left group"
                  >
                    <Layers className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 text-sm text-foreground truncate">
                      {session.title}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {MODEL_DISPLAY_NAMES[session.targetModel as SupportedModel] ?? session.targetModel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Fallback templates shown before data loads
const FALLBACK_TEMPLATES = [
  { slug: "code-review", title: "Code Review", description: "Review code for bugs, security issues, and style", icon: "Code2" },
  { slug: "email-draft", title: "Professional Email", description: "Draft a professional email for any purpose", icon: "Mail" },
  { slug: "data-analysis", title: "Data Analysis", description: "Analyze data and surface insights", icon: "BarChart2" },
  { slug: "creative-writing", title: "Creative Writing", description: "Generate fiction, poetry, or creative content", icon: "PenLine" },
  { slug: "research-summary", title: "Research Summary", description: "Summarize and synthesize research or documents", icon: "BookOpen" },
  { slug: "sql-query", title: "SQL Query", description: "Write or debug SQL queries", icon: "Database" },
  { slug: "product-spec", title: "Product Spec", description: "Write a product requirements document or user story", icon: "FileText" },
  { slug: "marketing-copy", title: "Marketing Copy", description: "Write compelling marketing and advertising copy", icon: "Megaphone" },
];
