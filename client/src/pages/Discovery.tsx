import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
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

export default function Discovery() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<DiscoveryMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [spec, setSpec] = useState<DiscoverySpec>({ completionScore: 0 });
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.analysis.discoveryChat.useMutation();
  const scaffoldMutation = trpc.scaffold.generateFromDescription.useMutation();
  const createSession = trpc.sessions.create.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || isThinking) return;
    const userMsg: DiscoveryMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const result = await chatMutation.mutateAsync({
        messages: allMessages,
        currentSpec: spec as unknown as Record<string, unknown>,
      });
      const assistantMsg: DiscoveryMessage = {
        role: "assistant",
        content: result.message,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSpec(result.updatedSpec);
    } catch {
      const errMsg: DiscoveryMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  }

  async function skipToScaffold() {
    setIsThinking(true);
    try {
      // Build a description from whatever we have so far
      const conversationText = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ");
      const description =
        conversationText ||
        "General purpose assistant for the described task";

      const result = await scaffoldMutation.mutateAsync({
        description,
        domain: spec.domain,
      });

      const sessionResult = await createSession.mutateAsync({
        title: result.title,
        targetModel: "gpt-4o",
        blocks: result.blocks as Parameters<typeof createSession.mutateAsync>[0]["blocks"],
        mode: "discovery",
        domain: result.domain,
        discoveryData: JSON.stringify(spec),
      });

      navigate(`/scaffold/${sessionResult.id}`);
    } catch {
      setIsThinking(false);
    }
  }

  async function buildScaffold() {
    setIsThinking(true);
    try {
      const description = [
        spec.role && `Role: ${spec.role}`,
        spec.task && `Task: ${spec.task}`,
        spec.context && `Context: ${spec.context}`,
        spec.audience && `Audience: ${spec.audience}`,
        spec.format && `Format: ${spec.format}`,
        spec.constraints?.length && `Constraints: ${spec.constraints.join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n");

      const result = await scaffoldMutation.mutateAsync({
        description: description || "General assistant",
        targetModel: spec.targetModel ?? "gpt-4o",
        domain: spec.domain,
      });

      const sessionResult = await createSession.mutateAsync({
        title: result.title,
        targetModel: spec.targetModel ?? "gpt-4o",
        blocks: result.blocks as Parameters<typeof createSession.mutateAsync>[0]["blocks"],
        mode: "discovery",
        domain: result.domain,
        discoveryData: JSON.stringify(spec),
      });

      navigate(`/scaffold/${sessionResult.id}`);
    } catch {
      setIsThinking(false);
    }
  }

  const completionScore = spec.completionScore ?? 0;

  return (
    <AppLayout title="Discovery" actions={
      <Button
        variant="ghost"
        size="sm"
        onClick={skipToScaffold}
        disabled={isThinking}
        className="text-muted-foreground hover:text-foreground text-xs gap-1.5"
      >
        Skip to scaffold
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    }>
      <div className="h-full flex overflow-hidden" style={{ height: "calc(100vh - 3.5rem)" }}>
        {/* Left: Chat panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-2xl",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
                    msg.role === "assistant"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <Zap className="w-3.5 h-3.5" />
                  ) : (
                    "U"
                  )}
                </div>
                {/* Bubble */}
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
            {isThinking && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
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
                    sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isThinking}
                size="icon"
                className="self-end flex-shrink-0"
              >
                <Send className="w-4 h-4" />
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
            <Progress
              value={completionScore}
              className="h-1.5 bg-muted"
            />
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
                    <span className="text-xs font-medium text-sidebar-foreground">
                      {label}
                    </span>
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
                  <span className="text-xs font-medium text-sidebar-foreground">
                    Constraints
                  </span>
                </div>
                <div className="pl-4.5 flex flex-wrap gap-1">
                  {spec.constraints.map((c, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Build scaffold CTA */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              onClick={buildScaffold}
              disabled={isThinking || completionScore < 30}
              className="w-full gap-2 text-sm"
            >
              {isThinking ? (
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
