/**
 * ScaffoldDiff.tsx
 *
 * Side-by-side diff view for two scaffold versions.
 * Route: /session/:sessionId/diff/:versionA/:versionB
 *
 * Shows block-aligned changes with line-level +/- markers.
 * Allows rolling back to either version from this view.
 */
import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  GitCompare,
  Plus,
  Minus,
  Equal,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type LineChange = {
  type: "add" | "remove" | "context";
  lineNumber: number;
  text: string;
};

type BlockDiff = {
  blockId: string;
  label: string;
  changeType: "added" | "removed" | "modified" | "unchanged";
  enabledChanged: boolean;
  enabledA: boolean;
  enabledB: boolean;
  lineChanges: LineChange[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function changeTypeBadge(changeType: BlockDiff["changeType"]) {
  switch (changeType) {
    case "added":
      return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-xs">Added</Badge>;
    case "removed":
      return <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs">Removed</Badge>;
    case "modified":
      return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 text-xs">Modified</Badge>;
    case "unchanged":
      return <Badge variant="outline" className="text-muted-foreground text-xs">Unchanged</Badge>;
  }
}

function lineClass(type: LineChange["type"]) {
  switch (type) {
    case "add":    return "bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500";
    case "remove": return "bg-red-950/40 text-red-300 border-l-2 border-red-500 line-through opacity-70";
    case "context": return "text-muted-foreground";
  }
}

function linePrefix(type: LineChange["type"]) {
  switch (type) {
    case "add":    return <span className="text-emerald-500 select-none w-4 inline-block">+</span>;
    case "remove": return <span className="text-red-500 select-none w-4 inline-block">−</span>;
    case "context": return <span className="text-muted-foreground/40 select-none w-4 inline-block"> </span>;
  }
}

// ─── Block Diff Card ─────────────────────────────────────────────────────────

function BlockDiffCard({ block }: { block: BlockDiff }) {
  const [expanded, setExpanded] = useState(block.changeType !== "unchanged");
  const changedLines = block.lineChanges.filter((l) => l.type !== "context").length;

  return (
    <Card
      className={cn(
        "border transition-colors",
        block.changeType === "added" && "border-emerald-700/40",
        block.changeType === "removed" && "border-red-700/40",
        block.changeType === "modified" && "border-amber-700/40",
        block.changeType === "unchanged" && "border-border/40 opacity-60"
      )}
    >
      <CardHeader
        className="py-2 px-4 cursor-pointer flex flex-row items-center justify-between gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {changeTypeBadge(block.changeType)}
          <span className="font-mono text-sm font-medium truncate">{block.label}</span>
          {block.enabledChanged && (
            <Badge variant="outline" className="text-xs text-amber-400 border-amber-600/40">
              {block.enabledB ? "Enabled" : "Disabled"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {changedLines > 0 && (
            <span className="text-xs text-muted-foreground">{changedLines} line{changedLines !== 1 ? "s" : ""} changed</span>
          )}
          <span className="text-xs text-muted-foreground">{expanded ? "▲" : "▼"}</span>
        </div>
      </CardHeader>

      {expanded && block.lineChanges.length > 0 && (
        <CardContent className="p-0">
          <Separator />
          <div className="font-mono text-xs overflow-x-auto">
            {block.lineChanges.map((line, i) => (
              <div
                key={i}
                className={cn("px-4 py-0.5 flex items-start gap-1 whitespace-pre-wrap break-all", lineClass(line.type))}
              >
                <span className="shrink-0 text-muted-foreground/50 w-8 text-right select-none">
                  {line.type !== "remove" ? line.lineNumber : ""}
                </span>
                {linePrefix(line.type)}
                <span className="flex-1">{line.text || " "}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {expanded && block.lineChanges.length === 0 && block.changeType !== "unchanged" && (
        <CardContent className="px-4 py-2 text-xs text-muted-foreground">
          {block.changeType === "added" ? "Block was added (empty content)." : "Block was removed."}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScaffoldDiff() {
  const [match, params] = useRoute("/session/:sessionId/diff/:versionA/:versionB");
  const [, navigate] = useLocation();

  const sessionId = match ? parseInt(params!.sessionId, 10) : null;
  const versionA = match ? parseInt(params!.versionA, 10) : null;
  const versionB = match ? parseInt(params!.versionB, 10) : null;

  const { data: diffData, isLoading, error } = trpc.sessions.diffVersions.useQuery(
    { sessionId: sessionId!, versionA: versionA!, versionB: versionB! },
    { enabled: !!sessionId && !!versionA && !!versionB }
  );

  const { data: versionListData } = trpc.sessions.listVersions.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );

  const rollbackMutation = trpc.sessions.rollbackToVersion.useMutation({
    onSuccess: (result) => {
      toast.success(`Rolled back to version ${result.newVersionNumber}`);
      navigate(`/scaffold/${sessionId}`);
    },
    onError: (err) => {
      toast.error(`Rollback failed: ${err.message}`);
    },
  });

  const versionAMeta = versionListData?.find((v) => v.versionNumber === versionA);
  const versionBMeta = versionListData?.find((v) => v.versionNumber === versionB);

  if (!match || !sessionId || !versionA || !versionB) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Invalid diff URL. Expected /session/:id/diff/:versionA/:versionB
      </div>
    );
  }

  const blocks = (diffData as BlockDiff[] | undefined) ?? [];
  const addedCount = blocks.filter((b) => b.changeType === "added").length;
  const removedCount = blocks.filter((b) => b.changeType === "removed").length;
  const modifiedCount = blocks.filter((b) => b.changeType === "modified").length;
  const unchangedCount = blocks.filter((b) => b.changeType === "unchanged").length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/scaffold/${sessionId}`)}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Scaffold
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Version Diff</span>
          </div>
        </div>

        {/* Version comparison header */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-red-950/20 border border-red-700/30 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-red-400">v{versionA}</span>
              <span className="text-xs text-muted-foreground">(before)</span>
            </div>
            {versionAMeta && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{versionAMeta.changeSummary}</p>
            )}
          </div>
          <div className="bg-emerald-950/20 border border-emerald-700/30 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-emerald-400">v{versionB}</span>
              <span className="text-xs text-muted-foreground">(after)</span>
            </div>
            {versionBMeta && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{versionBMeta.changeSummary}</p>
            )}
          </div>
        </div>

        {/* Summary stats */}
        {!isLoading && blocks.length > 0 && (
          <div className="flex items-center gap-4 text-xs">
            {addedCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-400">
                <Plus className="w-3 h-3" /> {addedCount} added
              </span>
            )}
            {removedCount > 0 && (
              <span className="flex items-center gap-1 text-red-400">
                <Minus className="w-3 h-3" /> {removedCount} removed
              </span>
            )}
            {modifiedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <GitCompare className="w-3 h-3" /> {modifiedCount} modified
              </span>
            )}
            {unchangedCount > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Equal className="w-3 h-3" /> {unchangedCount} unchanged
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm gap-2">
            <span className="animate-spin">⟳</span> Computing diff…
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm p-4 bg-red-950/20 border border-red-700/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error.message}
          </div>
        )}

        {!isLoading && !error && blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            <span>No differences found — these two versions are identical.</span>
          </div>
        )}

        {!isLoading && !error && blocks.length > 0 && (
          <div className="space-y-3">
            {/* Changed blocks first, then unchanged */}
            {[
              ...blocks.filter((b) => b.changeType !== "unchanged"),
              ...blocks.filter((b) => b.changeType === "unchanged"),
            ].map((block) => (
              <BlockDiffCard key={block.blockId} block={block} />
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {!isLoading && !error && blocks.length > 0 && (
        <div className="border-t bg-card px-6 py-3 shrink-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Rollback creates a new version — history is never rewritten.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => rollbackMutation.mutate({ sessionId: sessionId!, versionNumber: versionA! })}
              disabled={rollbackMutation.isPending}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore v{versionA}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => rollbackMutation.mutate({ sessionId: sessionId!, versionNumber: versionB! })}
              disabled={rollbackMutation.isPending}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore v{versionB}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
