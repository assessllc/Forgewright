import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Zap, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { toast } from "sonner";

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const { data: plans, isLoading: plansLoading } = trpc.billing.getPlans.useQuery();
  const { data: status } = trpc.billing.getSubscriptionStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: ({ url }) => {
      toast.info("Redirecting to Stripe checkout…");
      window.open(url, "_blank");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
    },
  });

  function handleUpgrade() {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }
    checkoutMutation.mutate({ origin: window.location.origin });
  }

  const isLoading = authLoading || plansLoading;
  const isPro = status?.plan === "pro";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Simple, honest pricing</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no per-seat pricing.
          </p>
        </div>

        {/* Plan cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {(plans ?? []).map((plan) => {
              const isPlanPro = plan.id === "pro";
              const isCurrentPlan = status?.plan === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${
                    isPlanPro
                      ? "border-primary/60 shadow-lg shadow-primary/10 bg-card"
                      : "border-border bg-card/60"
                  }`}
                >
                  {isPlanPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{plan.label}</CardTitle>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="text-xs">
                          Current plan
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? "Free" : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground ml-1">/ month</span>
                      )}
                    </div>
                    <CardDescription className="mt-1">{plan.priceLabel}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 gap-6">
                    {/* Feature list */}
                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isPlanPro ? (
                      isPro ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate("/settings")}
                        >
                          Manage subscription
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={handleUpgrade}
                          disabled={checkoutMutation.isPending}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {checkoutMutation.isPending ? "Redirecting…" : plan.cta}
                        </Button>
                      )
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          if (!user) {
                            window.location.href = getLoginUrl();
                          } else {
                            navigate("/");
                          }
                        }}
                      >
                        {user ? "Go to dashboard" : plan.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Usage note for free users */}
        {user && !isPro && status && (
          <div className="mt-8 p-4 rounded-lg border border-border bg-muted/20 text-sm text-center text-muted-foreground">
            You've used{" "}
            <span className="font-semibold text-foreground">{status.used}</span> of{" "}
            <span className="font-semibold text-foreground">{status.limit}</span> free sessions this month
            {" "}({status.month}).
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: "What counts as a session?",
                a: "A session is created each time you start a new Discovery conversation or use Reverse Mode to analyze an output. Scaffold Builder work within an existing session does not count.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel from Settings → Billing portal at any time. You keep Pro access until the end of your billing period.",
              },
              {
                q: "Do unused sessions roll over?",
                a: "No. The free tier resets to 10 sessions at the start of each calendar month.",
              },
              {
                q: "Is my data safe?",
                a: "Yes. All sessions are stored securely in your account. API keys you provide are encrypted at rest using AES-256-GCM and never logged or returned in plaintext.",
              },
              {
                q: "What payment methods are accepted?",
                a: "All major credit and debit cards via Stripe. No PayPal or crypto at this time.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border border-border rounded-lg p-4">
                <p className="font-medium mb-1.5">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test card note */}
        <p className="mt-12 text-center text-xs text-muted-foreground">
          Testing? Use card <code className="font-mono bg-muted px-1 py-0.5 rounded">4242 4242 4242 4242</code> with any future expiry and any CVC.
        </p>
      </div>
    </AppLayout>
  );
}
