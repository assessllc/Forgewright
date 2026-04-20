/**
 * Insights.tsx — Phase 6 Feature 4: Personal Pattern Learning
 *
 * Surfaces personalized behavioral insights derived from the user's session
 * history, comparison verdicts, diagnosis acceptance patterns, and version
 * history. Each insight is backed by real observable data.
 *
 * 12 insight rules implemented server-side in insights.ts.
 * This page renders the results with confidence indicators and action links.
 */
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import {
  Lightbulb,
  TrendingUp,
  RefreshCw,
  Loader2,
  BarChart2,
  Target,
  Zap,
  BookOpen,
  GitBranch,
  Stethoscope,
  GitCompare,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import type { InsightType } from "../../../server/routers/insights";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Insight {
  type: InsightType;
  title: string;
  description: string;
  value: string | number;
  unit?: string;
  recommendation: string;
  confidence: "low" | "medium" | "high";
  dataPoints: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INSIGHT_ICONS: Partial<Record<InsightType, React.ElementType>> = {
  DOMINANT_FAILURE_MODE: Stethoscope,
  PREFERRED_VARIANT: GitCompare,
  ACCEPTED_PATTERN: BookOpen,
  AVOIDED_ANTIPATTERN: AlertCircle,
  MODEL_AFFINITY: Zap,
  DIAGNOSIS_ACCEPTANCE: Target,
  VERSION_CHURN: GitBranch,
  ROLLBACK_FREQUENCY: RefreshCw,
  DOMAIN_CONCENTRATION: BarChart2,
  REASONING_BLOCK_USAGE: TrendingUp,
  FORMAT_BLOCK_USAGE: TrendingUp,
  SESSION_COMPLETION_RATE: BarChart2,
};

const CONFIDENCE_CONFIG = {
  high: { label: "High confidence", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  medium: { label: "Medium confidence", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  low: { label: "Low confidence", color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
};

const DATA_QUALITY_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  high: { label: "High quality data", color: "text-emerald-400", description: "Insights are well-supported by your usage history." },
  medium: { label: "Medium quality data", color: "text-amber-400", description: "Some insights have limited data — continue using the app to improve accuracy." },
  low: { label: "Limited data", color: "text-muted-foreground", description: "More sessions needed for reliable insights." },
  insufficient: { label: "Insufficient data", color: "text-muted-foreground", description: "More sessions needed to generate insights." },
};

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const [, navigate] = useLocation();
  const Icon = INSIGHT_ICONS[insight.type] ?? Lightbulb;
  const conf = CONFIDENCE_CONFIG[insight.confidence];

  const actionLinks: Partial<Record<InsightType, { label: string; href: string }>> = {
    DOMINANT_FAILURE_MODE: { label: "Open Diagnosis Library", href: "/diagnose" },
    PREFERRED_VARIANT: { label: "Run A/B Comparison", href: "/compare" },
    ACCEPTED_PATTERN: { label: "Browse Pattern Library", href: "/patterns" },
    MODEL_AFFINITY: { label: "View Model Guide", href: "/models" },
    VERSION_CHURN: { label: "View Sessions", href: "/sessions" },
    ROLLBACK_FREQUENCY: { label: "View Sessions", href: "/sessions" },
    DOMAIN_CONCENTRATION: { label: "Browse Examples", href: "/examples" },
    REASONING_BLOCK_USAGE: { label: "Open Scaffold Builder", href: "/scaffold" },
    FORMAT_BLOCK_USAGE: { label: "Open Scaffold Builder", href: "/scaffold" },
    SESSION_COMPLETION_RATE: { label: "Start New Session", href: "/discovery" },
    DIAGNOSIS_ACCEPTANCE: { label: "Run Diagnosis", href: "/diagnose" },
  };

  const action = actionLinks[insight.type];

  return (
    <div className={cn("rounded-lg border p-5 space-y-3", conf.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{insight.title}</span>
              <Badge
                variant="outline"
                className={cn("text-xs", conf.color)}
              >
                {conf.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{insight.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xl font-bold text-foreground">
            {typeof insight.value === "number" && insight.unit === "%"
              ? `${insight.value}%`
              : insight.value}
          </div>
          {insight.unit && insight.unit !== "%" && (
            <div className="text-xs text-muted-foreground">{insight.unit}</div>
          )}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-background/50 rounded-md p-3 border border-border/50">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground/80 leading-relaxed">{insight.recommendation}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Based on {insight.dataPoints} data point{insight.dataPoints !== 1 ? "s" : ""}
        </span>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => navigate(action.href)}
          >
            {action.label}
            <ArrowRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Insights() {
  const [, navigate] = useLocation();
  const { data, isLoading, refetch, isFetching } = trpc.insights.getInsights.useQuery(
    { limit: 12 },
    { staleTime: 5 * 60 * 1000 }
  );

  const insights = data?.insights ?? [];
  const dataQuality = data?.dataQuality ?? "low";
  const totalSessions = data?.totalSessions ?? 0;
  const qualityConfig = DATA_QUALITY_CONFIG[dataQuality];

  return (
    <AppLayout title="Insights">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Personal Pattern Learning
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Personalized insights derived from your session history, comparison verdicts,
                and diagnosis patterns. Each insight is backed by real behavioral data.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="flex-shrink-0"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Analyzing your usage patterns…</p>
              </div>
            </div>
          )}

          {/* Insufficient data state */}
          {!isLoading && insights.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
              <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-base font-semibold text-foreground">Not enough data yet</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Insights require at least 2 sessions. You have {totalSessions} session
                  {totalSessions !== 1 ? "s" : ""}. Use the app more to unlock personalized insights.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button size="sm" onClick={() => navigate("/discovery")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Start a Session
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/diagnose")}>
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Diagnose an Output
                </Button>
              </div>
            </div>
          )}

          {/* Data quality banner */}
          {!isLoading && insights.length > 0 && (
            <div className={cn("rounded-lg border p-3 flex items-center gap-3", qualityConfig.color === "text-emerald-400" ? "bg-emerald-500/5 border-emerald-500/20" : qualityConfig.color === "text-amber-400" ? "bg-amber-500/5 border-amber-500/20" : "bg-muted/20 border-border")}>
              <BarChart2 className={cn("w-4 h-4 flex-shrink-0", qualityConfig.color)} />
              <div>
                <span className={cn("text-xs font-medium", qualityConfig.color)}>
                  {qualityConfig.label}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {qualityConfig.description}
                </span>
              </div>
              <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
                {totalSessions} session{totalSessions !== 1 ? "s" : ""} analyzed
              </span>
            </div>
          )}

          {/* Insights grid */}
          {!isLoading && insights.length > 0 && (
            <div className="space-y-4">
              {/* High confidence first */}
              {insights.filter((i) => i.confidence === "high").length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    High Confidence
                  </h2>
                  {insights
                    .filter((i) => i.confidence === "high")
                    .map((insight, idx) => (
                      <InsightCard key={`${insight.type}-${idx}`} insight={insight} />
                    ))}
                </div>
              )}

              {insights.filter((i) => i.confidence === "medium").length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Medium Confidence
                  </h2>
                  {insights
                    .filter((i) => i.confidence === "medium")
                    .map((insight, idx) => (
                      <InsightCard key={`${insight.type}-${idx}`} insight={insight} />
                    ))}
                </div>
              )}

              {insights.filter((i) => i.confidence === "low").length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Early Signals (Low Confidence)
                  </h2>
                  {insights
                    .filter((i) => i.confidence === "low")
                    .map((insight, idx) => (
                      <InsightCard key={`${insight.type}-${idx}`} insight={insight} />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
