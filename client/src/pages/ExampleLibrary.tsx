import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  BookOpen,
  Copy,
  ExternalLink,
  Star,
  Zap,
  ChevronRight,
  Filter,
  Code2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExamplePrompt {
  id: number;
  slug: string;
  title: string;
  domain: string;
  taskType: string;
  patternSlug: string | null;
  promptText: string;
  exampleOutput: string | null;
  secondaryPatterns: string[];
  testedModels: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  tokenCount: number | null;
  sourceNote: string | null;
  isFeatured: boolean;
  createdAt: Date;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOMAIN_LABELS: Record<string, string> = {
  "software-engineering": "Software Engineering",
  "data-analysis": "Data Analysis",
  "creative-writing": "Creative Writing",
  "legal": "Legal",
  "medical": "Medical",
  "marketing": "Marketing",
  "education": "Education",
  "research": "Research",
  "customer-support": "Customer Support",
  "finance": "Finance",
  "hr": "HR",
  "product-management": "Product Management",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const DOMAIN_COLORS: Record<string, string> = {
  "software-engineering": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "data-analysis": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "creative-writing": "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "legal": "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "medical": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "marketing": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "education": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "research": "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  "customer-support": "bg-green-500/10 text-green-400 border-green-500/20",
  "finance": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "hr": "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "product-management": "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

// ── ExampleCard ───────────────────────────────────────────────────────────────

function ExampleCard({
  example,
  onView,
}: {
  example: ExamplePrompt;
  onView: (ex: ExamplePrompt) => void;
}) {
  const domainColor = DOMAIN_COLORS[example.domain] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const diffColor = DIFFICULTY_COLORS[example.difficulty] ?? "";

  // Show a short preview of the prompt text
  const preview = example.promptText.slice(0, 160).replace(/\n/g, " ") + "…";

  return (
    <div
      className="group relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer"
      onClick={() => onView(example)}
    >
      {/* Featured star */}
      {example.isFeatured && (
        <Star className="absolute top-4 right-4 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug mb-2 pr-5 group-hover:text-white transition-colors">
            {example.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${domainColor}`}>
              {DOMAIN_LABELS[example.domain] ?? example.domain}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${diffColor}`}>
              {example.difficulty}
            </span>
            {example.patternSlug && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border bg-zinc-800 text-zinc-400 border-zinc-700">
                <Layers className="w-2.5 h-2.5 mr-1" />
                {example.patternSlug}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-3 font-mono">
        {preview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          {example.tokenCount && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {example.tokenCount} tokens
            </span>
          )}
          {example.testedModels.length > 0 && (
            <span className="flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              {example.testedModels.slice(0, 2).join(", ")}
              {example.testedModels.length > 2 && ` +${example.testedModels.length - 2}`}
            </span>
          )}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
    </div>
  );
}

// ── ExampleDetailDialog ───────────────────────────────────────────────────────

function ExampleDetailDialog({
  example,
  open,
  onClose,
}: {
  example: ExamplePrompt | null;
  open: boolean;
  onClose: () => void;
}) {
  const [, navigate] = useLocation();

  if (!example) return null;

  const domainColor = DOMAIN_COLORS[example.domain] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  const diffColor = DIFFICULTY_COLORS[example.difficulty] ?? "";

  function copyPrompt() {
    navigator.clipboard.writeText(example!.promptText);
    toast.success("Prompt copied to clipboard");
  }

  function useInScaffold() {
    // Store the example prompt text in sessionStorage so ScaffoldBuilder can pick it up
    sessionStorage.setItem(
      "promptwright_prefill",
      JSON.stringify({
        source: "example",
        title: example!.title,
        domain: example!.domain,
        promptText: example!.promptText,
        patternSlug: example!.patternSlug,
      })
    );
    navigate("/scaffold");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${domainColor}`}>
              {DOMAIN_LABELS[example.domain] ?? example.domain}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${diffColor}`}>
              {example.difficulty}
            </span>
            {example.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border bg-amber-400/10 text-amber-400 border-amber-400/20">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                Featured
              </span>
            )}
          </div>
          <DialogTitle className="text-lg font-semibold text-zinc-100 leading-snug">
            {example.title}
          </DialogTitle>
          {example.patternSlug && (
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              Primary pattern: <span className="text-zinc-400 font-medium">{example.patternSlug}</span>
              {example.secondaryPatterns.length > 0 && (
                <> · Also uses: {example.secondaryPatterns.join(", ")}</>
              )}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[50vh]">
          <div className="px-6 py-4">
            {/* Metadata row */}
            <div className="flex flex-wrap gap-4 mb-4 text-xs text-zinc-500">
              {example.tokenCount && (
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-400">{example.tokenCount}</span> tokens
                </span>
              )}
              {example.testedModels.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  Tested on: <span className="text-zinc-400">{example.testedModels.join(", ")}</span>
                </span>
              )}
              {example.taskType && (
                <span className="flex items-center gap-1.5">
                  Task type: <span className="text-zinc-400">{example.taskType}</span>
                </span>
              )}
            </div>

            {/* Prompt text */}
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
              <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                {example.promptText}
              </pre>
            </div>

            {/* Source note */}
            {example.sourceNote && (
              <p className="mt-3 text-xs text-zinc-600 italic">
                Source: {example.sourceNote}
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-zinc-800 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyPrompt}
            className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 bg-transparent"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy prompt
          </Button>
          <Button
            size="sm"
            onClick={useInScaffold}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Use in scaffold builder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ExampleLibrary() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [patternFilter, setPatternFilter] = useState<string>("all");
  const [selectedExample, setSelectedExample] = useState<ExamplePrompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: examples = [], isLoading } = trpc.knowledge.getExamples.useQuery(undefined);
  const { data: patterns = [] } = trpc.knowledge.getPatterns.useQuery(undefined);

  // Derive unique domains from the data
  const domains = useMemo(() => {
    const set = new Set<string>();
    (examples as ExamplePrompt[]).forEach((e) => set.add(e.domain));
    return Array.from(set).sort();
  }, [examples]);

  // Client-side filtering
  const filtered = useMemo(() => {
    let list = examples as ExamplePrompt[];
    if (domainFilter !== "all") list = list.filter((e) => e.domain === domainFilter);
    if (difficultyFilter !== "all") list = list.filter((e) => e.difficulty === difficultyFilter);
    if (patternFilter !== "all") list = list.filter((e) => e.patternSlug === patternFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.domain.toLowerCase().includes(q) ||
          e.promptText.toLowerCase().includes(q) ||
          (e.patternSlug && e.patternSlug.toLowerCase().includes(q))
      );
    }
    return list;
  }, [examples, domainFilter, difficultyFilter, patternFilter, search]);

  // Domain breakdown counts
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (examples as ExamplePrompt[]).forEach((e) => {
      counts[e.domain] = (counts[e.domain] || 0) + 1;
    });
    return counts;
  }, [examples]);

  function openExample(ex: ExamplePrompt) {
    setSelectedExample(ex);
    setDialogOpen(true);
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-zinc-100">Example Library</h1>
          </div>
          <p className="text-sm text-zinc-500 max-w-2xl">
            {(examples as ExamplePrompt[]).length} real, tested prompts across {domains.length} domains.
            Each example demonstrates a specific pattern and is ready to copy or adapt in the scaffold builder.
          </p>
        </div>

        {/* Domain overview strip */}
        <div className="flex flex-wrap gap-2 mb-6">
          {domains.map((domain) => {
            const color = DOMAIN_COLORS[domain] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
            const active = domainFilter === domain;
            return (
              <button
                key={domain}
                onClick={() => setDomainFilter(active ? "all" : domain)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? color + " ring-1 ring-current"
                    : color + " opacity-60 hover:opacity-100"
                }`}
              >
                {DOMAIN_LABELS[domain] ?? domain}
                <span className="opacity-70">{domainCounts[domain]}</span>
              </button>
            );
          })}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search prompts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500"
            />
          </div>

          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-700 text-zinc-300">
              <Filter className="w-3.5 h-3.5 mr-2 text-zinc-500" />
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="all" className="text-zinc-300">All domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d} value={d} className="text-zinc-300">
                  {DOMAIN_LABELS[d] ?? d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="all" className="text-zinc-300">All levels</SelectItem>
              <SelectItem value="beginner" className="text-emerald-400">Beginner</SelectItem>
              <SelectItem value="intermediate" className="text-amber-400">Intermediate</SelectItem>
              <SelectItem value="advanced" className="text-rose-400">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={patternFilter} onValueChange={setPatternFilter}>
            <SelectTrigger className="w-44 bg-zinc-900 border-zinc-700 text-zinc-300">
              <SelectValue placeholder="Pattern" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              <SelectItem value="all" className="text-zinc-300">All patterns</SelectItem>
              {(patterns as Array<{ slug: string; name: string }>).map((p) => (
                <SelectItem key={p.slug} value={p.slug} className="text-zinc-300">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-zinc-600">
            Showing <span className="text-zinc-400 font-medium">{filtered.length}</span> of{" "}
            <span className="text-zinc-400 font-medium">{(examples as ExamplePrompt[]).length}</span> examples
          </p>
          {(domainFilter !== "all" || difficultyFilter !== "all" || patternFilter !== "all" || search) && (
            <button
              onClick={() => {
                setDomainFilter("all");
                setDifficultyFilter("all");
                setPatternFilter("all");
                setSearch("");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-40 bg-zinc-900/40 border border-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No examples match your filters.</p>
            <button
              onClick={() => {
                setDomainFilter("all");
                setDifficultyFilter("all");
                setPatternFilter("all");
                setSearch("");
              }}
              className="mt-2 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ex) => (
              <ExampleCard key={ex.id} example={ex as ExamplePrompt} onView={openExample} />
            ))}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <ExampleDetailDialog
        example={selectedExample}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </AppLayout>
  );
}
