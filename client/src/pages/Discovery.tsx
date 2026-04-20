import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useStream } from "@/hooks/useStream";
import {
  Send,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Zap,
} from "lucide-react";
import type { DiscoveryMessage, DiscoverySpec } from "../../../shared/prompitect-types";

const INITIAL_MESSAGE: DiscoveryMessage = {
  role: "assistant",
  content:
    "Hi! I'm going to help you craft a high-quality prompt. Let's start with the basics — what do you want the model to do? Describe it in plain language, and I'll ask follow-up questions to sharpen the spec.",
  timestamp: Date.now(),
};

const SPEC_FIELDS = [
  { key: "domain", label: "Domain" },
  { key: "role", label: "Role" },
  { key: "task", label: "Task" },
  { key: "audience", label: "Audience" },
  { key: "format", label: "Format" },
  { key: "context", label: "Context" },
] as const;

/** Strip hidden spec annotation from display text */
function stripSpecAnnotation(text: string): string {
  return text.replace(/<!--spec:[\s\S]*?-->/g, "").trim();
}

/**
 * Infer spec updates from the conversation heuristically.
 * Provides progressive spec filling even without explicit LLM annotations.
 */
function inferSpecFromConversation(
  msgs: DiscoveryMessage[],
  currentSpec: DiscoverySpec
): DiscoverySpec {
  const userText = msgs
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const updated = { ...currentSpec };

  if (!updated.domain) {
    if (/\b(code|function|class|bug|refactor|typescript|python|javascript|api|database|sql)\b/.test(userText))
      updated.domain = "code";
    else if (/\b(email|report|article|blog|essay|write|draft|copy)\b/.test(userText))
      updated.domain = "writing";
    else if (/\b(data|analysis|chart|visuali|pandas|excel|csv|insight)\b/.test(userText))
      updated.domain = "data-analysis";
    else if (/\b(legal|contract|clause|compliance|jurisdiction|law)\b/.test(userText))
      updated.domain = "legal";
    else if (/\b(medical|clinical|patient|diagnosis|health|symptom)\b/.test(userText))
      updated.domain = "medical";
    else if (/\b(translate|translation|spanish|french|german|language)\b/.test(userText))
      updated.domain = "translation";
    else if (/\b(market|campaign|brand|seo|social|ad|copy|audience)\b/.test(userText))
      updated.domain = "marketing";
    else if (/\b(research|paper|literature|citation|academic|study)\b/.test(userText))
      updated.domain = "research";
  }

  const filledFields = [
    updated.domain, updated.role, updated.task,
    updated.audience, updated.format, updated.context,
  ].filter(Boolean).length;
  const msgCount = msgs.filter((m) => m.role === "user").length;
  updated.completionScore = Math.min(
    95,
    Math.round((filledFields / 6) * 60 + Math.min(msgCount * 5, 35))
  );

  return updated;
}

export default function Discovery() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<DiscoveryMessage[]>([INITIAL_MESSAGE]);
  const [streamingContent, setStreamingContent] = useState("");
  const [input, setInput] = useState("");
  const [spec, setSpec] = useState<DiscoverySpec>({ completionScore: 0 });
  const [isBuildingScaffold, setIsBuildingScaffold] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const specRef = useRef(spec);
  specRef.current = spec;

  const scaffoldMutation = trpc.scaffold.generateFromDescription.useMutation();
  const createSession = trpc.sessions.create.useMutation();

  const { stream, isStreaming } = useStream("/api/stream/discovery", {
    onToken: (_token, accumulated) => {
      setStreamingContent(accumulated);
    },
    onDone: (fullText) => {
      const cleanText = stripSpecAnnotation(fullText);
      const assistantMsg: DiscoveryMessage = {
        role: "assistant",
        content: cleanText,
        timestamp: Date.now(),
      };
      setMessages((prev) => {
        const updated = [...prev, assistantMsg];
        setSpec(inferSpecFromConversation(updated, specRef.current));
        return updated;
      });
      setStreamingContent("");
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
      setStreamingContent("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || isBuildingScaffold) return;

    const userMsg: DiscoveryMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    const streamMessages = updatedMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    try {
      await stream({
        messages: streamMessages,
        currentSpec: specRef.current as unknown as Record<string, unknown>,
      });
    } catch {
      // onError callback handles UI state
    }
  }, [input, isStreaming, isBuildingScaffold, messages, stream]);

  async function skipToScaffold() {
    setIsBuildingScaffold(true);
    try {
      const conversationText = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ");
      const description = conversationText || "General purpose assistant";

      const result = await scaffoldMutation.mutateAsync({
        description,
        domain: specRef.current.domain,
      });
      const sessionResult = await createSession.mutateAsync({
        title: result.title,
        targetModel: "gpt-4o",
        blocks: result.blocks as Parameters<typeof createSession.mutateAsync>[0]["blocks"],
        mode: "discovery",
        domain: result.domain,
        discoveryData: JSON.stringify(specRef.current),
      });
      navigate(`/scaffold/${sessionResult.id}`);
    } catch {
      setIsBuildingScaffold(false);
    }
  }

  async function buildScaffold() {
    setIsBuildingScaffold(true);
    try {
      const s = specRef.current;
      const description = [
        s.role && `Role: ${s.role}`,
        s.task && `Task: ${s.task}`,
        s.context && `Context: ${s.context}`,
        s.audience && `Audience: ${s.audience}`,
        s.format && `Format: ${s.format}`,
        s.constraints?.length && `Constraints: ${s.constraints.join(", ")}`,
      ].filter(Boolean).join("\n") || "General assistant";

      const result = await scaffoldMutation.mutateAsync({
        description,
        targetModel: s.targetModel ?? "gpt-4o",
        domain: s.domain,
      });
      const sessionResult = await createSession.mutateAsync({
        title: result.title,
        targetModel: s.targetModel ?? "gpt-4o",
        blocks: result.blocks as Parameters<typeof createSession.mutateAsync>[0]["blocks"],
        mode: "discovery",
        domain: result.domain,
        discoveryData: JSON.stringify(s),
      });
      navigate(`/scaffold/${sessionResult.id}`);
    } catch {
      setIsBuildingScaffold(false);
    }
  }

  const completionScore = spec.completionScore ?? 0;
  const isBusy = isStreaming || isBuildingScaffold;

  return (
    <AppLayout
      title="Discovery"
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={skipToScaffold}
          disabled={isBusy}
          className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
        >
          Skip to scaffold
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      }
    >
      <div className="h-full flex overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
        {/* Left: Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-2xl",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                    msg.role === "assistant"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {msg.role === "assistant" ? <Zap className="w-3.5 h-3.5" /> : "U"}
                </div>
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm leading-relaxed max-w-lg",
                    msg.role === "assistant"
                      ? "bg-card border border-border text-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Live streaming bubble */}
            {isStreaming && (
              <div className="flex gap-3 max-w-2xl">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="rounded-xl px-4 py-3 text-sm leading-relaxed bg-card border border-primary/30 text-foreground max-w-lg">
                  {streamingContent ? (
                    <>
                      {stripSpecAnnotation(streamingContent)}
                      <span className="inline-block w-1.5 h-3.5 bg-primary/70 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Thinking…
                    </span>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response…"
                className="min-h-[60px] max-h-[120px] resize-none bg-card border-border text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <Button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isBusy}
                size="icon"
                className="self-end flex-shrink-0"
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>

        {/* Right: Live spec card */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col bg-sidebar overflow-y-auto">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-sidebar-foreground uppercase tracking-wider">
                Spec Card
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {completionScore}%
              </span>
            </div>
            <Progress value={completionScore} className="h-1.5 bg-muted" />
            <p className="text-xs text-muted-foreground mt-1.5">
              {completionScore < 40
                ? "Just getting started…"
                : completionScore < 70
                ? "Good progress — keep going"
                : completionScore < 90
                ? "Almost ready to scaffold"
                : "Ready to build!"}
            </p>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {SPEC_FIELDS.map(({ key, label }) => {
              const value = spec[key as keyof DiscoverySpec];
              const hasValue = value && (typeof value === "string" ? value.length > 0 : true);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {hasValue ? (
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-sidebar-foreground">{label}</span>
                  </div>
                  {hasValue && (
                    <p className="text-xs text-muted-foreground pl-4.5 leading-relaxed line-clamp-3">
                      {typeof value === "string"
                        ? value
                        : Array.isArray(value)
                        ? value.join(", ")
                        : String(value)}
                    </p>
                  )}
                </div>
              );
            })}

            {spec.constraints && spec.constraints.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-xs font-medium text-sidebar-foreground">Constraints</span>
                </div>
                <div className="pl-4.5 flex flex-wrap gap-1">
                  {spec.constraints.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-border text-muted-foreground">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={buildScaffold}
              disabled={isBusy || completionScore < 30}
              className="w-full gap-2 text-sm"
            >
              {isBuildingScaffold ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Build Scaffold
            </Button>
            {completionScore < 30 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Answer a few more questions first
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
