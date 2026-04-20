import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Pattern {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  whenToUse: string;
  whenNotToUse: string | null;
  sourceReference: string | null;
  compatibleModels: string[];
  examples: Array<{ title: string; prompt: string; notes?: string }> | null;
  taskTypes: string[] | null;
  preventsAntiPatterns: string[] | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  "reasoning": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "few-shot": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "role": "bg-green-500/10 text-green-400 border-green-500/20",
  "output-control": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "decomposition": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "self-improvement": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "safety": "bg-red-500/10 text-red-400 border-red-500/20",
  "agentic": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "context": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "negative": "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function PatternCard({ pattern }: { pattern: Pattern }) {
  const [expanded, setExpanded] = useState(false);
  const categoryStyle = CATEGORY_COLORS[pattern.category] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden transition-all">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{pattern.name}</h3>
            <Badge
              variant="outline"
              className={cn("text-xs border px-1.5 py-0", categoryStyle)}
            >
              {pattern.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {pattern.description.slice(0, 160)}{pattern.description.length > 160 ? '…' : ''}
          </p>
          {!expanded && pattern.taskTypes && pattern.taskTypes.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {pattern.taskTypes.slice(0, 4).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground/60 bg-muted/40 rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/50 divide-y divide-border/30">
          {/* Full description */}
          <div className="px-5 py-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {pattern.description}
            </p>
          </div>

          {/* When to use / avoid */}
          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-400 uppercase tracking-wider">
                When to Use
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pattern.whenToUse}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-destructive uppercase tracking-wider">
                When to Avoid
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pattern.whenNotToUse ?? 'No specific guidance'}
              </p>
            </div>
          </div>

          {/* Examples */}
          {pattern.examples && pattern.examples.length > 0 && (
            <div className="px-5 py-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Example
              </p>
              {pattern.examples.slice(0, 1).map((ex, i) => (
                <div key={i} className="space-y-1">
                  {ex.title && <p className="text-xs font-medium text-foreground">{ex.title}</p>}
                  <pre className="text-xs text-foreground bg-muted/40 rounded-lg p-3 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto">
                    {ex.prompt}
                  </pre>
                  {ex.notes && <p className="text-xs text-muted-foreground">{ex.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Compatible models + source */}
          <div className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(pattern.compatibleModels ?? []).map((m: string) => (
                <Badge
                  key={m}
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {m}
                </Badge>
              ))}
            </div>
            {pattern.sourceReference && (
              <a
                href={pattern.sourceReference}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                Source
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatternLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: patterns, isLoading } = trpc.knowledge.getPatterns.useQuery(undefined);

  const categories = useMemo(() => {
    if (!patterns) return [];
    const catSet = new Set((patterns as unknown as Pattern[]).map((p) => p.category));
    const cats = Array.from(catSet).sort();
    return cats;
  }, [patterns]);

  const filtered = useMemo(() => {
    if (!patterns) return [];
    return (patterns as unknown as Pattern[]).filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
              (p.taskTypes ?? []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [patterns, search, selectedCategory]);

  return (
    <AppLayout title="Pattern Library">
      <div className="h-full overflow-y-auto" style={{ height: "calc(100vh - 3.5rem)" }}>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                Prompt Pattern Library
              </h1>
              {patterns && (
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {patterns.length} patterns
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Documented prompting techniques grounded in published research. Each pattern includes when-to-use guidance, examples, and model compatibility notes.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patterns…"
                className="pl-9 h-9 bg-card border-border text-sm"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-9 text-xs border-border"
              >
                All
              </Button>
              {categories.map((cat) => {
                const style = CATEGORY_COLORS[cat] ?? "";
                return (
                  <Button
                    key={cat}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat ? null : cat
                      )
                    }
                    className={cn(
                      "h-9 text-xs border capitalize",
                      selectedCategory === cat
                        ? style
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Pattern list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="text-sm text-muted-foreground">
                No patterns match your search
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(null);
                }}
                className="text-xs"
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {(filtered as unknown as Pattern[]).map((pattern) => (
                <PatternCard key={pattern.id} pattern={pattern} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
