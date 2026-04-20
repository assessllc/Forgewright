/**
 * SwarmComposer.tsx
 *
 * The Swarm Composer is a tool for designing multi-agent prompt systems.
 * It provides:
 * - A curated library of 8 real swarm templates grounded in published research
 * - Full agent-by-agent system prompt viewer with topology diagrams
 * - Export functionality: copy individual agent prompts or the full swarm as a
 *   structured briefing document for use in Manus, AutoGen, CrewAI, or LangGraph
 *
 * Sources:
 * - Anthropic "Building Effective Agents" (Dec 2024)
 * - OpenAI "Orchestrating Agents: Routines and Handoffs" (Oct 2024)
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import type { SwarmAgent, SwarmTopology } from "../../../shared/prompitect-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Copy,
  Download,
  Search,
  ChevronRight,
  ArrowRight,
  GitBranch,
  Layers,
  RotateCcw,
  Network,
  Shuffle,
  Info,
  CheckCircle2,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SwarmTemplate {
  id: number;
  slug: string;
  name: string;
  description: string;
  useCase: string;
  topology: SwarmTopology;
  agents: SwarmAgent[];
  compatiblePlatforms: string[];
  domains: string[];
  agentCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  isFeatured: boolean;
  sourceNote: string | null;
  sortOrder: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPOLOGY_META: Record<
  SwarmTopology,
  { label: string; icon: React.FC<{ className?: string }>; color: string; description: string }
> = {
  sequential: {
    label: "Sequential",
    icon: ArrowRight,
    color: "text-blue-400",
    description: "Agents run one after another. Each agent's output is the next agent's input. Best for pipelines where order matters.",
  },
  parallel: {
    label: "Parallel",
    icon: Shuffle,
    color: "text-emerald-400",
    description: "Multiple agents run simultaneously on the same input, then a synthesis agent merges their outputs. Best for multi-perspective analysis.",
  },
  "hub-spoke": {
    label: "Hub & Spoke",
    icon: Network,
    color: "text-amber-400",
    description: "A central routing agent dispatches requests to specialist agents. Best for high-volume workflows with diverse request types.",
  },
  hierarchical: {
    label: "Hierarchical",
    icon: Layers,
    color: "text-purple-400",
    description: "An orchestrator coordinates team leads, each of whom coordinates their own specialists. Best for complex multi-function workflows.",
  },
  iterative: {
    label: "Iterative",
    icon: RotateCcw,
    color: "text-rose-400",
    description: "Two agents loop: one generates, one evaluates. The loop continues until quality criteria are met. Best for refinement tasks.",
  },
};

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const ALL_TOPOLOGIES: SwarmTopology[] = ["sequential", "parallel", "hub-spoke", "hierarchical", "iterative"];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function buildExportDocument(template: SwarmTemplate): string {
  const topologyMeta = TOPOLOGY_META[template.topology];
  const lines: string[] = [];

  lines.push(`# ${template.name}`);
  lines.push(`**Topology:** ${topologyMeta.label}  |  **Agents:** ${template.agentCount}  |  **Difficulty:** ${template.difficulty}`);
  lines.push(``);
  lines.push(`## Overview`);
  lines.push(template.description);
  lines.push(``);
  lines.push(`## When to Use`);
  lines.push(template.useCase);
  lines.push(``);
  lines.push(`## Compatible Platforms`);
  lines.push(template.compatiblePlatforms.join(", "));
  lines.push(``);
  if (template.sourceNote) {
    lines.push(`## Research Basis`);
    lines.push(template.sourceNote);
    lines.push(``);
  }
  lines.push(`## Topology: ${topologyMeta.label}`);
  lines.push(topologyMeta.description);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Agent System Prompts`);
  lines.push(``);

  template.agents.forEach((agent, idx) => {
    lines.push(`### Agent ${idx + 1}: ${agent.name}`);
    lines.push(`**Role:** ${agent.role}`);
    lines.push(``);
    const inputFrom = Array.isArray(agent.inputFrom) ? agent.inputFrom.join(", ") : agent.inputFrom;
    lines.push(`**Receives input from:** ${inputFrom}`);
    lines.push(`**Passes output to:** ${agent.outputTo}`);
    lines.push(``);
    lines.push(`**Handoff condition:** ${agent.handoffCondition}`);
    lines.push(``);
    lines.push(`**System Prompt:**`);
    lines.push(``);
    lines.push("```");
    lines.push(agent.systemPrompt);
    lines.push("```");
    lines.push(``);
    if (idx < template.agents.length - 1) {
      lines.push(`---`);
      lines.push(``);
    }
  });

  lines.push(`---`);
  lines.push(`*Generated by Promptwright — https://promptwright.app*`);

  return lines.join("\n");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopologyDiagram({ template }: { template: SwarmTemplate }) {
  const { topology, agents } = template;

  if (topology === "sequential") {
    return (
      <div className="flex flex-wrap items-center gap-1 py-3">
        {agents.map((agent, idx) => (
          <div key={agent.id} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div className="px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 font-medium whitespace-nowrap max-w-[120px] truncate">
                {agent.name}
              </div>
            </div>
            {idx < agents.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (topology === "parallel") {
    const parallelAgents = agents.filter((a) => !Array.isArray(a.inputFrom));
    const synthesizer = agents.find((a) => Array.isArray(a.inputFrom));
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="px-2 py-1 rounded bg-muted/50 border text-xs text-muted-foreground font-medium">
          Input
        </div>
        <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <div className="flex flex-col gap-1">
          {parallelAgents.map((agent) => (
            <div key={agent.id} className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-medium whitespace-nowrap max-w-[130px] truncate">
              {agent.name}
            </div>
          ))}
        </div>
        {synthesizer && (
          <>
            <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <div className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-200 font-semibold whitespace-nowrap max-w-[130px] truncate">
              {synthesizer.name}
            </div>
          </>
        )}
      </div>
    );
  }

  if (topology === "hub-spoke") {
    const hub = agents[0];
    const spokes = agents.slice(1, -1);
    const qa = agents[agents.length - 1];
    return (
      <div className="flex items-center gap-2 py-3 flex-wrap">
        <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 font-semibold whitespace-nowrap">
          {hub?.name}
        </div>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          {spokes.map((s) => (
            <div key={s.id} className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-medium whitespace-nowrap max-w-[130px] truncate">
              {s.name}
            </div>
          ))}
        </div>
        {qa && (
          <>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <div className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 font-semibold whitespace-nowrap max-w-[130px] truncate">
              {qa.name}
            </div>
          </>
        )}
      </div>
    );
  }

  if (topology === "hierarchical") {
    const orchestrator = agents[0];
    const rest = agents.slice(1);
    return (
      <div className="flex flex-col gap-2 py-3">
        <div className="flex justify-center">
          <div className="px-3 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-xs text-purple-200 font-semibold">
            {orchestrator?.name}
          </div>
        </div>
        <div className="flex justify-center gap-1 flex-wrap">
          {rest.map((agent) => (
            <div key={agent.id} className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 font-medium whitespace-nowrap max-w-[110px] truncate">
              {agent.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topology === "iterative") {
    return (
      <div className="flex items-center gap-2 py-3">
        {agents.map((agent, idx) => (
          <div key={agent.id} className="flex items-center gap-2">
            <div className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-medium whitespace-nowrap max-w-[130px] truncate">
              {agent.name}
            </div>
            {idx < agents.length - 1 && (
              <RotateCcw className="w-3 h-3 text-rose-400" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

function AgentCard({
  agent,
  index,
  topology,
  onCopy,
}: {
  agent: SwarmAgent;
  index: number;
  topology: SwarmTopology;
  onCopy: (text: string, label: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const topologyColor = TOPOLOGY_META[topology].color;
  const inputFrom = Array.isArray(agent.inputFrom) ? agent.inputFrom.join(", ") : agent.inputFrom;

  return (
    <div className="border rounded-lg overflow-hidden bg-card/50">
      <button
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${topologyColor.replace("text-", "border-").replace("-400", "-500/40")} bg-current/5`}>
          <span className={topologyColor}>{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{agent.name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{agent.role}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span>← {inputFrom}</span>
            <span>→ {agent.outputTo}</span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t bg-muted/10 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Handoff Condition</p>
            <p className="text-sm text-foreground/80 italic">{agent.handoffCondition}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">System Prompt</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(agent.systemPrompt, agent.name);
                }}
              >
                <Copy className="w-3 h-3" />
                Copy
              </Button>
            </div>
            <ScrollArea className="h-64">
              <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed p-3 bg-background/50 rounded border">
                {agent.systemPrompt}
              </pre>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: SwarmTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  const topologyMeta = TOPOLOGY_META[template.topology];
  const TopologyIcon = topologyMeta.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? "border-primary/60 bg-primary/5 shadow-sm"
          : "border-border hover:border-border/80 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-sm leading-tight">{template.name}</span>
        {template.isFeatured && (
          <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`flex items-center gap-1 text-xs ${topologyMeta.color}`}>
          <TopologyIcon className="w-3 h-3" />
          <span>{topologyMeta.label}</span>
        </div>
        <span className="text-muted-foreground text-xs">·</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{template.agentCount} agents</span>
        </div>
        <span className="text-muted-foreground text-xs">·</span>
        <span className={`text-xs px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[template.difficulty]}`}>
          {template.difficulty}
        </span>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SwarmComposer() {
  const [search, setSearch] = useState("");
  const [topologyFilter, setTopologyFilter] = useState<SwarmTopology | "all">("all");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data: templates = [], isLoading } = trpc.knowledge.getSwarmTemplates.useQuery(undefined);

  const filteredTemplates = useMemo(() => {
    let results = templates as SwarmTemplate[];
    if (topologyFilter !== "all") {
      results = results.filter((t) => t.topology === topologyFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.useCase.toLowerCase().includes(q) ||
          t.domains.some((d) => d.toLowerCase().includes(q))
      );
    }
    return results;
  }, [templates, topologyFilter, search]);

  const selectedTemplate = useMemo(
    () => (selectedSlug ? (templates as SwarmTemplate[]).find((t) => t.slug === selectedSlug) ?? null : null),
    [templates, selectedSlug]
  );

  // Auto-select first template when loaded
  useMemo(() => {
    if (templates.length > 0 && !selectedSlug) {
      setSelectedSlug((templates as SwarmTemplate[])[0]?.slug ?? null);
    }
  }, [templates, selectedSlug]);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Copied: ${label}`, { description: "System prompt copied to clipboard." });
    });
  }

  function exportTemplate(template: SwarmTemplate) {
    const doc = buildExportDocument(template);
    const blob = new Blob([doc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.slug}-swarm.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported", { description: `${template.name} exported as Markdown.` });
  }

  function copyFullSwarm(template: SwarmTemplate) {
    const doc = buildExportDocument(template);
    navigator.clipboard.writeText(doc).then(() => {
      toast.success("Copied full swarm", { description: `${template.agentCount} agent prompts copied to clipboard.` });
    });
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-card/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">Swarm Composer</h1>
                <Badge variant="outline" className="text-xs border-primary/40 text-primary/80">Beta</Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Design multi-agent prompt systems. Each template provides fully written system prompts for every agent,
                grounded in published research on orchestration patterns. Export to Manus, AutoGen, CrewAI, or LangGraph.
              </p>
            </div>
          </div>

          {/* What is a swarm? */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50 flex gap-3">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground/70">What is a swarm?</strong> A swarm is a coordinated set of AI agents,
              each with a specific role and system prompt, that work together on a task too complex for a single agent.
              Instead of one prompt doing everything, you design a system: a researcher hands off to a writer, who hands off
              to an editor. Each agent is focused, constrained, and accountable for one part of the workflow.
              The result is more reliable, auditable, and improvable than a single monolithic prompt.
            </div>
          </div>
        </div>

        {/* Body: two-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Template Browser */}
          <div className="w-80 flex-shrink-0 border-r flex flex-col">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setTopologyFilter("all")}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                    topologyFilter === "all"
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "border-border text-muted-foreground hover:border-border/80"
                  }`}
                >
                  All
                </button>
                {ALL_TOPOLOGIES.map((t) => {
                  const meta = TOPOLOGY_META[t];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={t}
                      onClick={() => setTopologyFilter(t)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                        topologyFilter === t
                          ? `bg-current/5 border-current/40 ${meta.color}`
                          : "border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1.5">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 rounded-lg bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No templates match your filters.
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.slug}
                      template={template}
                      isSelected={selectedSlug === template.slug}
                      onClick={() => setSelectedSlug(template.slug)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <p className="text-xs text-muted-foreground text-center">
                {filteredTemplates.length} of {templates.length} templates
              </p>
            </div>
          </div>

          {/* Right: Template Detail */}
          {selectedTemplate ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-lg font-bold">{selectedTemplate.name}</h2>
                    {selectedTemplate.isFeatured && (
                      <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 gap-1">
                        <Zap className="w-3 h-3" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-xs border ${DIFFICULTY_COLORS[selectedTemplate.difficulty]}`}>
                      {selectedTemplate.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {(() => {
                      const meta = TOPOLOGY_META[selectedTemplate.topology];
                      const Icon = meta.icon;
                      return (
                        <span className={`flex items-center gap-1 ${meta.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </span>
                      );
                    })()}
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {selectedTemplate.agentCount} agents
                    </span>
                    <span>·</span>
                    <span>{selectedTemplate.compatiblePlatforms.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => copyFullSwarm(selectedTemplate)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy all agent prompts to clipboard</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => exportTemplate(selectedTemplate)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export .md
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download as Markdown briefing document</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="px-6 py-4 space-y-6">
                  <Tabs defaultValue="agents">
                    <TabsList className="mb-4">
                      <TabsTrigger value="agents">Agents ({selectedTemplate.agentCount})</TabsTrigger>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="howto">How to Use</TabsTrigger>
                    </TabsList>

                    {/* Agents Tab */}
                    <TabsContent value="agents" className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/20 border">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                          {TOPOLOGY_META[selectedTemplate.topology].label} Flow
                        </p>
                        <TopologyDiagram template={selectedTemplate} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {TOPOLOGY_META[selectedTemplate.topology].description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {selectedTemplate.agents.map((agent, idx) => (
                          <AgentCard
                            key={agent.id}
                            agent={agent}
                            index={idx}
                            topology={selectedTemplate.topology}
                            onCopy={copyToClipboard}
                          />
                        ))}
                      </div>
                    </TabsContent>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedTemplate.description}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Domains</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTemplate.domains.map((d) => (
                            <Badge key={d} variant="secondary" className="text-xs capitalize">
                              {d.replace(/-/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedTemplate.sourceNote && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-sm font-semibold mb-2">Research Basis</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed italic">{selectedTemplate.sourceNote}</p>
                          </div>
                        </>
                      )}
                      <Separator />
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Compatible Platforms</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTemplate.compatiblePlatforms.map((p) => (
                            <Badge key={p} variant="outline" className="text-xs">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* How to Use Tab */}
                    <TabsContent value="howto" className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold mb-2">When to Use This Template</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedTemplate.useCase}</p>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold">How to Deploy This Swarm</h3>
                        <div className="space-y-2">
                          {[
                            {
                              step: 1,
                              title: "Export the template",
                              desc: 'Click "Export .md" to download a complete briefing document with all agent system prompts.',
                            },
                            {
                              step: 2,
                              title: "Set up your agents",
                              desc: `In your chosen platform (${selectedTemplate.compatiblePlatforms[0]}, etc.), create ${selectedTemplate.agentCount} agents and paste each system prompt into the corresponding agent's configuration.`,
                            },
                            {
                              step: 3,
                              title: "Configure handoffs",
                              desc: "Each agent's system prompt includes a HANDOFF_TO instruction. Configure your platform to route agent outputs according to these instructions.",
                            },
                            {
                              step: 4,
                              title: "Test with a real input",
                              desc: "Run the swarm with a real-world input. Review each agent's output at each step before the full pipeline runs automatically.",
                            },
                            {
                              step: 5,
                              title: "Tune individual agents",
                              desc: "If a specific agent underperforms, copy its system prompt back into Promptwright's Scaffold Builder to refine it using patterns and examples.",
                            },
                          ].map(({ step, title, desc }) => (
                            <div key={step} className="flex gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                                {step}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="flex gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            <strong className="text-foreground/70">Pro tip:</strong> The most effective swarms have agents
                            with narrow, non-overlapping responsibilities. If two agents are doing similar things, collapse
                            them into one. If one agent is doing too much, split it. The handoff condition is the most
                            important part of each agent — it determines when the baton passes and prevents agents from
                            over-reaching their role.
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Select a template to view its agents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
