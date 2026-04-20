import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Search,
  Clock,
  Trash2,
  Download,
  ArrowRight,
  Loader2,
  FileText,
  RotateCcw,
} from "lucide-react";
import { formatTokens } from "@/lib/tokens";
import { MODEL_DISPLAY_NAMES, type SupportedModel } from "../../../shared/prompitect-types";
import { toast } from "sonner";

interface Session {
  id: number;
  title: string;
  targetModel: string;
  domain: string | null;
  totalTokens: number;
  isReverseModeSession: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Sessions() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: sessions, isLoading, refetch } = trpc.sessions.list.useQuery({
    limit: 50,
    offset: 0,
  });

  const deleteMutation = trpc.sessions.delete.useMutation();

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync({ id });
      await refetch();
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  }

  function handleExport(session: Session, format: "json" | "markdown") {
    const content =
      format === "json"
        ? JSON.stringify(session, null, 2)
        : `# ${session.title}\n\n**Model:** ${session.targetModel}\n**Created:** ${new Date(session.createdAt).toISOString()}`;
    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompitect-${session.id}.${format === "json" ? "json" : "md"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = (sessions ?? []).filter((s) =>
    !search ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.domain ?? "").toLowerCase().includes(search.toLowerCase())
  ) as Session[];

  return (
    <AppLayout title="Sessions">
      <div className="h-full overflow-y-auto" style={{ height: "calc(100vh - 3.5rem)" }}>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-foreground">Saved Sessions</h1>
              <p className="text-sm text-muted-foreground">
                {sessions?.length ?? 0} sessions saved
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="gap-2 text-sm"
            >
              New Session
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions by title or domain…"
              className="pl-9 h-9 bg-card border-border text-sm"
            />
          </div>

          {/* Sessions list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {search ? "No sessions match your search" : "No sessions yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {search
                    ? "Try a different search term"
                    : "Create your first prompt session from the home screen"}
                </p>
              </div>
              {!search && (
                <Button onClick={() => navigate("/")} variant="outline" className="gap-2 border-border">
                  Start Building
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-border bg-card hover:border-border/80 transition-colors group"
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
                      {session.isReverseModeSession ? (
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {session.title}
                        </p>
                        {session.isReverseModeSession && (
                          <Badge
                            variant="outline"
                            className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/5 flex-shrink-0"
                          >
                            reverse
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {MODEL_DISPLAY_NAMES[session.targetModel as SupportedModel] ?? session.targetModel}
                        </span>
                        {session.domain && (
                          <>
                            <span>·</span>
                            <span>{session.domain}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatTokens(session.totalTokens)}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(session.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExport(session, "markdown")}
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title="Export as Markdown"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session.id)}
                        disabled={deletingId === session.id}
                        className="w-7 h-7 text-muted-foreground hover:text-destructive"
                        title="Delete session"
                      >
                        {deletingId === session.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/scaffold/${session.id}`)}
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title="Open session"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
