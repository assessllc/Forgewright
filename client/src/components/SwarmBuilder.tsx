/**
 * SwarmBuilder.tsx
 *
 * The custom swarm builder. Allows users to:
 * 1. Name their swarm and describe its goal
 * 2. Choose a topology (sequential, parallel, hub-spoke, hierarchical, iterative)
 * 3. Add agents — each with a name, role, and system prompt
 * 4. For each agent's system prompt: type it manually OR pick from the 108-example library
 * 5. Save the swarm to the database (requires auth)
 * 6. Export the swarm as a Markdown briefing document
 *
 * The example-picker opens a modal showing the full example library with search/filter.
 * Selecting an example populates the agent's system prompt with the full prompt text,
 * and records the source example slug for provenance.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import type { SwarmTopology } from "../../../shared/prompitect-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  Copy,
  Download,
  Save,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  GitBranch,
  Layers,
  RotateCcw,
  Network,
  Shuffle,
  GripVertical,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomAgent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  inputFrom: string;
  outputTo: string;
  handoffCondition: string;
  sourceExampleSlug?: string;
  sourceExampleTitle?: string;
}

interface ExamplePromptRow {
  id: number;
  slug: string;
  title: string;
  domain: string;
  taskType: string;
  promptText: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  patternSlug: string | null;
  isFeatured: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOPOLOGY_OPTIONS: { value: SwarmTopology; label: string; description: string; icon: React.FC<{ className?: string }> }[] = [
  {
    value: "sequential",
    label: "Sequential",
    description: "Agents run one after another. Each agent's output feeds the next.",
    icon: ArrowRight,
  },
  {
    value: "parallel",
    label: "Parallel",
    description: "Multiple agents run simultaneously on the same input, then results are merged.",
    icon: GitBranch,
  },
  {
    value: "hub-spoke",
    label: "Hub & Spoke",
    description: "A central orchestrator delegates to specialist agents and collects results.",
    icon: Network,
  },
  {
    value: "hierarchical",
    label: "Hierarchical",
    description: "Team leads coordinate sub-agents. Multi-level delegation for complex tasks.",
    icon: Layers,
  },
  {
    value: "iterative",
    label: "Iterative",
    description: "Agents loop — a generator and a critic refine output until a quality bar is met.",
    icon: RotateCcw,
  },
];

const DOMAIN_LABELS: Record<string, string> = {
  "software-engineering": "Software Engineering",
  "creative-writing": "Creative Writing",
  "data-analysis": "Data Analysis",
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

const DIFFICULTY_COLORS = {
  beginner: "border-green-500/40 text-green-400",
  intermediate: "border-yellow-500/40 text-yellow-400",
  advanced: "border-red-500/40 text-red-400",
};

function generateAgentId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function buildCustomExportDocument(
  name: string,
  goal: string,
  topology: SwarmTopology,
  agents: CustomAgent[]
): string {
  const topologyLabel = TOPOLOGY_OPTIONS.find((t) => t.value === topology)?.label ?? topology;
  const lines: string[] = [
    `# ${name}`,
    ``,
    `**Goal:** ${goal || "Not specified"}`,
    `**Topology:** ${topologyLabel}`,
    `**Agents:** ${agents.length}`,
    `**Built with:** Forgewright — by ASSESS LLC`,
    ``,
    `---`,
    ``,
    `## Topology: ${topologyLabel}`,
    ``,
    TOPOLOGY_OPTIONS.find((t) => t.value === topology)?.description ?? "",
    ``,
    `---`,
    ``,
    `## Agents`,
    ``,
  ];

  agents.forEach((agent, idx) => {
    lines.push(`### Agent ${idx + 1}: ${agent.name}`);
    lines.push(``);
    lines.push(`**Role:** ${agent.role}`);
    if (agent.inputFrom) lines.push(`**Receives input from:** ${agent.inputFrom}`);
    if (agent.outputTo) lines.push(`**Sends output to:** ${agent.outputTo}`);
    if (agent.handoffCondition) lines.push(`**Handoff condition:** ${agent.handoffCondition}`);
    if (agent.sourceExampleTitle) {
      lines.push(`**System prompt source:** Example Library — "${agent.sourceExampleTitle}"`);
    }
    lines.push(``);
    lines.push(`**System Prompt:**`);
    lines.push(``);
    lines.push("```");
    lines.push(agent.systemPrompt);
    lines.push("```");
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  });

  lines.push(`*Generated by Forgewright — by ASSESS LLC*`);
  return lines.join("\n");
}

// ─── Example Picker Modal ─────────────────────────────────────────────────────

interface ExamplePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (example: ExamplePromptRow) => void;
}

function ExamplePicker({ open, onClose, onSelect }: ExamplePickerProps) {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");

  const { data: examples = [], isLoading } = trpc.knowledge.getExamples.useQuery(
    { domain: domainFilter !== "all" ? domainFilter : undefined },
    { enabled: open }
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return examples as ExamplePromptRow[];
    const q = search.toLowerCase();
    return (examples as ExamplePromptRow[]).filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.domain.toLowerCase().includes(q) ||
        e.taskType.toLowerCase().includes(q) ||
        e.promptText.toLowerCase().includes(q)
    );
  }, [examples, search]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Pick from Example Library
          </DialogTitle>
          <DialogDescription>
            Select an example prompt to use as this agent's system prompt. The full prompt text will be copied in — you can edit it after.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="px-6 py-3 border-b flex-shrink-0 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search examples..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue placeholder="All domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All domains</SelectItem>
              {Object.entries(DOMAIN_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 px-6 py-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No examples match your search.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((ex) => (
                <button
                  key={ex.slug}
                  onClick={() => { onSelect(ex); onClose(); }}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                          {ex.title}
                        </span>
                        {ex.isFeatured && (
                          <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400 flex-shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className="capitalize">{DOMAIN_LABELS[ex.domain] ?? ex.domain}</span>
                        <span>·</span>
                        <span className="capitalize">{ex.taskType}</span>
                        {ex.difficulty && (
                          <>
                            <span>·</span>
                            <span className={`px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                              {ex.difficulty}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {ex.promptText.slice(0, 180)}…
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-1 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-3 border-t flex-shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} examples</span>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Agent Editor Card ────────────────────────────────────────────────────────

interface AgentEditorProps {
  agent: CustomAgent;
  index: number;
  total: number;
  onChange: (id: string, field: keyof CustomAgent, value: string) => void;
  onDelete: (id: string) => void;
  onPickExample: (agentId: string) => void;
}

function AgentEditor({ agent, index, total, onChange, onDelete, onPickExample }: AgentEditorProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border-b">
        <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Agent {index + 1}
          </span>
          {agent.name && (
            <span className="ml-2 text-sm font-medium text-foreground truncate">
              — {agent.name}
            </span>
          )}
          {agent.sourceExampleTitle && (
            <Badge variant="outline" className="ml-2 text-xs border-primary/30 text-primary/70">
              <BookOpen className="w-2.5 h-2.5 mr-1" />
              {agent.sourceExampleTitle.length > 30
                ? agent.sourceExampleTitle.slice(0, 30) + "…"
                : agent.sourceExampleTitle}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {total > 1 && (
            <button
              onClick={() => onDelete(agent.id)}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Agent Name *</label>
              <Input
                value={agent.name}
                onChange={(e) => onChange(agent.id, "name", e.target.value)}
                placeholder="e.g. Research Lead, Content Writer, Reviewer"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Role Summary *</label>
              <Input
                value={agent.role}
                onChange={(e) => onChange(agent.id, "role", e.target.value)}
                placeholder="e.g. Researches market trends and summarizes findings"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Receives Input From</label>
              <Input
                value={agent.inputFrom}
                onChange={(e) => onChange(agent.id, "inputFrom", e.target.value)}
                placeholder={index === 0 ? "user" : `agent_${index}`}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sends Output To</label>
              <Input
                value={agent.outputTo}
                onChange={(e) => onChange(agent.id, "outputTo", e.target.value)}
                placeholder={index === total - 1 ? "user" : `agent_${index + 2}`}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Handoff Condition</label>
              <Input
                value={agent.handoffCondition}
                onChange={(e) => onChange(agent.id, "handoffCondition", e.target.value)}
                placeholder="When analysis is complete, pass to..."
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">System Prompt *</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs gap-1 px-2"
                    onClick={() => onPickExample(agent.id)}
                  >
                    <BookOpen className="w-3 h-3" />
                    Pick from Examples
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Browse the 108-example library and use one as this agent's system prompt</TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              value={agent.systemPrompt}
              onChange={(e) => onChange(agent.id, "systemPrompt", e.target.value)}
              placeholder={`Write this agent's system prompt here. Be specific about:\n• What this agent does (and does not do)\n• What format it should output\n• When it should hand off to the next agent\n\nOr click "Pick from Examples" to start from a real example prompt.`}
              className="min-h-[180px] text-sm font-mono leading-relaxed resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {agent.systemPrompt.length > 0
                ? `${agent.systemPrompt.length} characters · ~${Math.ceil(agent.systemPrompt.length / 4)} tokens`
                : "Tip: A good system prompt defines role, constraints, output format, and handoff condition."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── My Swarms List ───────────────────────────────────────────────────────────

interface MySwarmsProps {
  onLoad: (swarm: {
    id: number;
    name: string;
    goal: string | null;
    description: string | null;
    topology: SwarmTopology;
    agents: CustomAgent[];
  }) => void;
}

function MySwarms({ onLoad }: MySwarmsProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: swarms = [], isLoading } = trpc.swarms.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const deleteMutation = trpc.swarms.delete.useMutation({
    onSuccess: () => {
      utils.swarms.list.invalidate();
      toast.success("Swarm deleted");
    },
    onError: () => toast.error("Failed to delete swarm"),
  });

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center space-y-2">
        <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Sign in to save and view your custom swarms.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />)}
      </div>
    );
  }

  if (swarms.length === 0) {
    return (
      <div className="py-16 text-center space-y-2">
        <Shuffle className="w-8 h-8 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No saved swarms yet.</p>
        <p className="text-xs text-muted-foreground/70">Build one in the "Build Your Own" tab and save it.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {swarms.map((swarm) => (
        <div key={swarm.id} className="border border-border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{swarm.name}</h3>
              {swarm.goal && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{swarm.goal}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs capitalize">{swarm.topology}</Badge>
                <span>{swarm.agentCount} agents</span>
                <span>·</span>
                <span>{new Date(swarm.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onLoad({
                  id: swarm.id,
                  name: swarm.name,
                  goal: swarm.goal,
                  description: swarm.description,
                  topology: swarm.topology as SwarmTopology,
                  agents: swarm.agents as CustomAgent[],
                })}
              >
                Load
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteMutation.mutate({ id: swarm.id })}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main SwarmBuilder Component ──────────────────────────────────────────────

interface SavedSwarmData {
  id: number;
  name: string;
  goal: string | null;
  description: string | null;
  topology: SwarmTopology;
  agents: CustomAgent[];
}

interface SwarmBuilderProps {
  /** When provided, hydrates the builder with this saved swarm on mount/change */
  initialSwarm?: SavedSwarmData | null;
  /** Called when user switches to "My Swarms" tab — parent can handle tab state */
  onViewSaved?: () => void;
}

export default function SwarmBuilder({ initialSwarm, onViewSaved }: SwarmBuilderProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Builder state
  const [swarmId, setSwarmId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [topology, setTopology] = useState<SwarmTopology>("sequential");
  const [agents, setAgents] = useState<CustomAgent[]>([
    {
      id: generateAgentId(),
      name: "",
      role: "",
      systemPrompt: "",
      inputFrom: "user",
      outputTo: "agent_2",
      handoffCondition: "",
    },
  ]);

  // Hydrate from initialSwarm when it changes (e.g. loaded from My Swarms)
  useEffect(() => {
    if (!initialSwarm) return;
    setSwarmId(initialSwarm.id);
    setName(initialSwarm.name);
    setGoal(initialSwarm.goal ?? "");
    setTopology(initialSwarm.topology);
    setAgents(initialSwarm.agents);
    toast.info("Swarm loaded", { description: `"${initialSwarm.name}" loaded into the builder.` });
  }, [initialSwarm]);

  // Example picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTargetAgentId, setPickerTargetAgentId] = useState<string | null>(null);

  // Save mutation
  const createMutation = trpc.swarms.create.useMutation({
    onSuccess: (data) => {
      setSwarmId(data.id);
      utils.swarms.list.invalidate();
      toast.success("Swarm saved", { description: `"${name}" has been saved to My Swarms.` });
    },
    onError: (err) => toast.error("Failed to save swarm", { description: err.message }),
  });

  const updateMutation = trpc.swarms.update.useMutation({
    onSuccess: () => {
      utils.swarms.list.invalidate();
      toast.success("Swarm updated", { description: `"${name}" has been updated.` });
    },
    onError: (err) => toast.error("Failed to update swarm", { description: err.message }),
  });

  // Agent operations
  const addAgent = useCallback(() => {
    const newIdx = agents.length + 1;
    setAgents((prev) => [
      ...prev,
      {
        id: generateAgentId(),
        name: "",
        role: "",
        systemPrompt: "",
        inputFrom: prev.length > 0 ? `agent_${prev.length}` : "user",
        outputTo: "user",
        handoffCondition: "",
      },
    ]);
  }, [agents.length]);

  const updateAgent = useCallback((id: string, field: keyof CustomAgent, value: string) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }, []);

  const deleteAgent = useCallback((id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const openPicker = useCallback((agentId: string) => {
    setPickerTargetAgentId(agentId);
    setPickerOpen(true);
  }, []);

  const handleExampleSelect = useCallback((example: ExamplePromptRow) => {
    if (!pickerTargetAgentId) return;
    setAgents((prev) =>
      prev.map((a) =>
        a.id === pickerTargetAgentId
          ? {
              ...a,
              systemPrompt: example.promptText,
              sourceExampleSlug: example.slug,
              sourceExampleTitle: example.title,
            }
          : a
      )
    );
    toast.success("Example loaded", { description: `"${example.title}" loaded as system prompt.` });
  }, [pickerTargetAgentId]);

  // Load a saved swarm into the builder
  const loadSwarm = useCallback((swarm: {
    id: number;
    name: string;
    goal: string | null;
    description: string | null;
    topology: SwarmTopology;
    agents: CustomAgent[];
  }) => {
    setSwarmId(swarm.id);
    setName(swarm.name);
    setGoal(swarm.goal ?? "");
    setTopology(swarm.topology);
    setAgents(swarm.agents);
    toast.info("Swarm loaded", { description: `"${swarm.name}" loaded into the builder.` });
  }, []);

  // Validation
  const isValid = useMemo(() => {
    if (!name.trim()) return false;
    if (agents.length === 0) return false;
    return agents.every((a) => a.name.trim() && a.systemPrompt.trim());
  }, [name, agents]);

  function handleSave() {
    if (!isAuthenticated) {
      toast.error("Sign in required", { description: "You must be signed in to save swarms." });
      return;
    }
    if (!isValid) {
      toast.error("Incomplete swarm", { description: "Every agent needs a name and a system prompt." });
      return;
    }
    const payload = {
      name: name.trim(),
      goal: goal.trim() || undefined,
      topology,
      agents,
      compatiblePlatforms: ["Manus"],
    };
    if (swarmId) {
      updateMutation.mutate({ id: swarmId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleExport() {
    const doc = buildCustomExportDocument(name || "My Swarm", goal, topology, agents);
    const blob = new Blob([doc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(name || "my-swarm").toLowerCase().replace(/\s+/g, "-")}-swarm.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported", { description: "Swarm exported as Markdown." });
  }

  function handleCopyAll() {
    const doc = buildCustomExportDocument(name || "My Swarm", goal, topology, agents);
    navigator.clipboard.writeText(doc).then(() => {
      toast.success("Copied", { description: `${agents.length} agent prompts copied to clipboard.` });
    });
  }

  function handleReset() {
    setSwarmId(null);
    setName("");
    setGoal("");
    setTopology("sequential");
    setAgents([{
      id: generateAgentId(),
      name: "",
      role: "",
      systemPrompt: "",
      inputFrom: "user",
      outputTo: "user",
      handoffCondition: "",
    }]);
  }

  return (
    <>
      <ExamplePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleExampleSelect}
      />

      <div className="flex flex-col h-full overflow-hidden">
        {/* Builder toolbar */}
        <div className="px-6 py-3 border-b bg-card/20 flex items-center gap-3 flex-shrink-0 flex-wrap">
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name your swarm (e.g. ASSESS Business Operations Swarm)"
              className="h-9 text-sm font-medium max-w-md"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleCopyAll}
              disabled={agents.length === 0}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleExport}
              disabled={agents.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
              Export .md
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleSave}
              disabled={!isValid || createMutation.isPending || updateMutation.isPending}
            >
              <Save className="w-3.5 h-3.5" />
              {swarmId ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6 max-w-4xl">

            {/* Goal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Swarm Goal
              </label>
              <Textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe what this swarm is designed to accomplish. Be specific — this becomes the orchestration context that all agents share. Example: 'Run a weekly business review covering finance, marketing, and operations, producing an executive summary with cross-functional insights and top priorities for the next period.'"
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

            {/* Topology */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Topology
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {TOPOLOGY_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTopology(value)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      topology === value
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-border/80 hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${topology === value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${topology === value ? "text-primary" : ""}`}>
                        {label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Agents */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Agents ({agents.length})
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-7"
                  onClick={addAgent}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Agent
                </Button>
              </div>

              {/* Guidance */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground/70">Design tip:</strong> Each agent should have one clear responsibility.
                If an agent is doing more than one thing, split it. Use "Pick from Examples" to seed a system prompt
                from the 108-example library — then customize it for this agent's specific role in the swarm.
              </div>

              <div className="space-y-3">
                {agents.map((agent, idx) => (
                  <AgentEditor
                    key={agent.id}
                    agent={agent}
                    index={idx}
                    total={agents.length}
                    onChange={updateAgent}
                    onDelete={deleteAgent}
                    onPickExample={openPicker}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full gap-2 text-sm border-dashed"
                onClick={addAgent}
              >
                <Plus className="w-4 h-4" />
                Add Another Agent
              </Button>
            </div>

            {/* Validation summary */}
            {!isValid && (name || agents.some((a) => a.name || a.systemPrompt)) && (
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground/70">Before saving:</strong> Every agent needs a name and a system prompt.
                  {!name.trim() && " The swarm also needs a name."}
                </div>
              </div>
            )}

            {/* Reset */}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground gap-1.5"
                onClick={handleReset}
              >
                <X className="w-3.5 h-3.5" />
                Reset builder
              </Button>
            </div>

          </div>
        </ScrollArea>
      </div>
    </>
  );
}

// Export the MySwarms component so SwarmComposer can use it in a separate tab
export { MySwarms };
export type { CustomAgent, SavedSwarmData };
