/**
 * Settings Page — /settings
 *
 * Five sections:
 * 1. Profile — display name, email (read-only from OAuth)
 * 2. Default model — saved to DB, pre-populates Discovery + Scaffold Builder
 * 3. Personal defaults — tone, format habit, domain focus
 * 4. API keys — user-provided Anthropic/OpenAI/Gemini keys (encrypted at rest)
 * 5. Data & account — export sessions (JSON / Markdown ZIP), delete account
 *
 * Security: raw API keys are never returned from the server.
 * The server returns only { anthropic: boolean, openai: boolean, gemini: boolean }.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Link } from "wouter";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  User,
  Cpu,
  Sliders,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  HelpCircle,
  PlayCircle,
} from "lucide-react";
import JSZip from "jszip";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="pl-11 space-y-4">{children}</div>
    </div>
  );
}

// ─── API Key row ──────────────────────────────────────────────────────────────

function ApiKeyRow({
  provider,
  label,
  placeholder,
  isSet,
  onSave,
  onRemove,
}: {
  provider: "anthropic" | "openai" | "gemini";
  label: string;
  placeholder: string;
  isSet: boolean;
  onSave: (provider: "anthropic" | "openai" | "gemini", key: string) => void;
  onRemove: (provider: "anthropic" | "openai" | "gemini") => void;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    if (!value.trim()) return;
    onSave(provider, value.trim());
    setValue("");
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">{label}</span>
          {isSet ? (
            <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30 bg-green-500/5 px-1.5 py-0">
              <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
              Saved
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
              <XCircle className="w-2.5 h-2.5 mr-1" />
              Not set
            </Badge>
          )}
        </div>
        {(editing || !isSet) && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="text-xs h-8 pr-8 font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={handleSave} disabled={!value.trim()}>
              Save
            </Button>
            {isSet && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
      {isSet && !editing && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setEditing(true)}
          >
            Replace
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onRemove(provider)}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Settings() {
  const { restartTour } = useOnboarding();
  const utils = trpc.useUtils();

  const { data: prefs, isLoading } = trpc.settings.getPreferences.useQuery();
  const { data: models = [] } = trpc.settings.getSupportedModels.useQuery();

  const updatePrefs = trpc.settings.updatePreferences.useMutation({
    onSuccess: () => {
      utils.settings.getPreferences.invalidate();
      toast.success("Preferences saved");
    },
    onError: (e) => toast.error(`Failed to save: ${e.message}`),
  });

  const setApiKey = trpc.settings.setApiKey.useMutation({
    onSuccess: (data) => {
      utils.settings.getPreferences.invalidate();
      toast.success(`API key saved (${data.masked})`);
    },
    onError: (e) => toast.error(`Failed to save key: ${e.message}`),
  });

  const removeApiKey = trpc.settings.removeApiKey.useMutation({
    onSuccess: () => {
      utils.settings.getPreferences.invalidate();
      toast.success("API key removed");
    },
    onError: (e) => toast.error(`Failed to remove key: ${e.message}`),
  });

  const exportJson = trpc.settings.exportSessionsJson.useQuery(undefined, {
    enabled: false,
  });

  const exportMarkdown = trpc.settings.exportSessionsMarkdown.useQuery(undefined, {
    enabled: false,
  });

  const deleteAccount = trpc.settings.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => (window.location.href = "/"), 1500);
    },
    onError: (e) => toast.error(`Failed to delete account: ${e.message}`),
  });

  // ─── Local form state ───────────────────────────────────────────────────────

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [defaultModel, setDefaultModel] = useState<string | null>(null);
  const [defaultTone, setDefaultTone] = useState<string | null>(null);
  const [defaultDomain, setDefaultDomain] = useState<string | null | undefined>(undefined);
  const [formatHabit, setFormatHabit] = useState<string | null>(null);

  // Use prefs as the source of truth when no local edit is pending
  const effectiveDisplayName = displayName ?? prefs?.displayName ?? prefs?.name ?? "";
  const effectiveModel = defaultModel ?? prefs?.defaultModel ?? "gpt-4o";
  const effectiveTone = defaultTone ?? prefs?.defaultTone ?? "professional";
  const effectiveDomain = defaultDomain !== undefined ? defaultDomain : (prefs?.defaultDomain ?? null);
  const effectiveFormat = formatHabit ?? prefs?.formatHabit ?? "markdown";

  const handleSavePreferences = () => {
    updatePrefs.mutate({
      displayName: effectiveDisplayName || undefined,
      defaultModel: effectiveModel,
      defaultTone: effectiveTone as "professional" | "casual" | "technical" | "creative",
      defaultDomain: (effectiveDomain as "software-engineering" | "data-analysis" | "creative-writing" | "legal" | "medical" | "marketing" | "education" | "research" | "customer-support" | "finance" | "product-management" | "general" | null) ?? null,
      formatHabit: effectiveFormat as "markdown" | "plain" | "json",
    });
  };

  const handleExportJson = async () => {
    const result = await exportJson.refetch();
    if (!result.data) return;
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forgewright-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${result.data.sessionCount} sessions as JSON`);
  };

  const handleExportMarkdown = async () => {
    const result = await exportMarkdown.refetch();
    if (!result.data) return;
    const zip = new JSZip();
    for (const file of result.data.files) {
      zip.file(file.filename, file.content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `forgewright-sessions-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${result.data.fileCount} sessions as Markdown ZIP`);
  };

  if (isLoading) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-10">

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <Section
          icon={User}
          title="Profile"
          description="Your display name and account identity."
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Display name</Label>
              <Input
                value={effectiveDisplayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                value={prefs?.email ?? "—"}
                readOnly
                disabled
                className="text-sm h-9 text-muted-foreground"
              />
              <p className="text-[10px] text-muted-foreground">Set by your OAuth provider</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] capitalize">
              {prefs?.plan ?? "free"} plan
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              Member since {prefs?.createdAt ? new Date(prefs.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
        </Section>

        <Separator />

        {/* ── Default model ─────────────────────────────────────────────────── */}
        <Section
          icon={Cpu}
          title="Default model"
          description="Pre-selected in Discovery and Scaffold Builder. You can always override per session."
        >
          <div className="space-y-1.5">
            <Label className="text-xs">Model</Label>
            <Select value={effectiveModel} onValueChange={setDefaultModel}>
              <SelectTrigger className="h-9 text-sm w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["Anthropic", "OpenAI", "Google"] as const).map((provider) => (
                  <div key={provider}>
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {provider}
                    </div>
                    {models
                      .filter((m) => m.provider === provider)
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-sm">
                          {m.label}
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Separator />

        {/* ── Personal defaults ─────────────────────────────────────────────── */}
        <Section
          icon={Sliders}
          title="Personal defaults"
          description="Applied as soft priors during Discovery. You can override them in any session."
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Tone</Label>
              <Select value={effectiveTone} onValueChange={setDefaultTone}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["professional", "casual", "technical", "creative"].map((t) => (
                    <SelectItem key={t} value={t} className="text-sm capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Output format</Label>
              <Select value={effectiveFormat} onValueChange={setFormatHabit}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["markdown", "plain", "json"].map((f) => (
                    <SelectItem key={f} value={f} className="text-sm capitalize">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Domain focus</Label>
              <Select
                value={effectiveDomain ?? "none"}
                onValueChange={(v) => setDefaultDomain(v === "none" ? null : v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm text-muted-foreground">
                    None
                  </SelectItem>
                  {[
                    ["software-engineering", "Software Engineering"],
                    ["data-analysis", "Data Analysis"],
                    ["creative-writing", "Creative Writing"],
                    ["legal", "Legal"],
                    ["medical", "Medical"],
                    ["marketing", "Marketing"],
                    ["education", "Education"],
                    ["research", "Research"],
                    ["customer-support", "Customer Support"],
                    ["finance", "Finance"],
                    ["product-management", "Product Management"],
                    ["general", "General"],
                  ].map(([val, label]) => (
                    <SelectItem key={val} value={val} className="text-sm">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleSavePreferences}
            disabled={updatePrefs.isPending}
          >
            {updatePrefs.isPending ? (
              <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Saving…</>
            ) : (
              "Save preferences"
            )}
          </Button>
        </Section>

        <Separator />

        {/* ── API keys ──────────────────────────────────────────────────────── */}
        <Section
          icon={Key}
          title="API keys"
          description="Provide your own keys to run prompts directly against provider APIs during testing. Keys are encrypted at rest and never logged."
        >
          <div className="space-y-4">
            <ApiKeyRow
              provider="anthropic"
              label="Anthropic"
              placeholder="sk-ant-api03-..."
              isSet={prefs?.apiKeyStatus?.anthropic ?? false}
              onSave={(p, k) => setApiKey.mutate({ provider: p, apiKey: k })}
              onRemove={(p) => removeApiKey.mutate({ provider: p })}
            />
            <ApiKeyRow
              provider="openai"
              label="OpenAI"
              placeholder="sk-proj-..."
              isSet={prefs?.apiKeyStatus?.openai ?? false}
              onSave={(p, k) => setApiKey.mutate({ provider: p, apiKey: k })}
              onRemove={(p) => removeApiKey.mutate({ provider: p })}
            />
            <ApiKeyRow
              provider="gemini"
              label="Google Gemini"
              placeholder="AIzaSy..."
              isSet={prefs?.apiKeyStatus?.gemini ?? false}
              onSave={(p, k) => setApiKey.mutate({ provider: p, apiKey: k })}
              onRemove={(p) => removeApiKey.mutate({ provider: p })}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Keys are stored encrypted using AES-256-GCM. They are used only when you explicitly
            run a "Test on model" action. Forgewright's built-in LLM calls use platform credentials.
          </p>
        </Section>

        <Separator />

        {/* ── Data export ───────────────────────────────────────────────────── */}
        <Section
          icon={Download}
          title="Data export"
          description="Download all your sessions in portable formats. Your data is yours."
        >
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={handleExportJson}
              disabled={exportJson.isFetching}
            >
              {exportJson.isFetching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              Export as JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5"
              onClick={handleExportMarkdown}
              disabled={exportMarkdown.isFetching}
            >
              {exportMarkdown.isFetching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              Export as Markdown ZIP
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            JSON export includes all session metadata, scaffold blocks, and variants.
            Markdown ZIP produces one <code>.md</code> file per session.
          </p>
        </Section>

        <Separator />

        {/* ── Account ───────────────────────────────────────────────────────── */}
        <Section
          icon={Trash2}
          title="Account"
          description="Irreversible actions. Deleting your account removes all sessions, diagnoses, and preferences permanently."
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 text-xs gap-1.5"
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                Delete my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete your account and all associated data — sessions, diagnoses,
                  comparisons, and preferences. This action cannot be undone.
                  <br /><br />
                  Consider exporting your sessions before proceeding.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deleteAccount.mutate()}
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        {/* Help & Tour section */}
        <Section
          icon={HelpCircle}
          title="Help & Tour"
          description="Access the full how-to guide, glossary, and interactive tour at any time."
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <PlayCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Guided tour</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A 14-step interactive walkthrough of every page in Forgewright. Resets and replays from the beginning.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5 flex-shrink-0"
                onClick={restartTour}
              >
                <PlayCircle className="w-3 h-3" />
                Replay tour
              </Button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Help & Glossary</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Page-by-page how-to guide for all 14 pages, plus a full glossary of Forgewright terms.
                </p>
              </div>
              <Link href="/help">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 flex-shrink-0">
                  <HelpCircle className="w-3 h-3" />
                  Open
                </Button>
              </Link>
            </div>
          </div>
        </Section>

      </div>
    </AppLayout>
  );
}
