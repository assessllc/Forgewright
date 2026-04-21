/**
 * UpgradePromptModal
 *
 * Shown when a free-tier user attempts to create a new Discovery session
 * after exhausting their 10-session monthly limit.
 *
 * Usage:
 *   const [showUpgrade, setShowUpgrade] = useState(false);
 *   <UpgradePromptModal open={showUpgrade} onClose={() => setShowUpgrade(false)} used={10} limit={10} />
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface UpgradePromptModalProps {
  open: boolean;
  onClose: () => void;
  used: number;
  limit: number;
  month?: string;
}

export default function UpgradePromptModal({
  open,
  onClose,
  used,
  limit,
  month,
}: UpgradePromptModalProps) {
  const [, navigate] = useLocation();

  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: ({ url }) => {
      toast.info("Redirecting to Stripe checkout…");
      window.open(url, "_blank");
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout. Please try again.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <Badge variant="outline" className="text-xs">Free tier limit reached</Badge>
          </div>
          <DialogTitle className="text-xl">You've used all {limit} free sessions</DialogTitle>
          <DialogDescription className="text-sm">
            You've created {used} of {limit} Discovery sessions this month
            {month ? ` (${month})` : ""}. Upgrade to Pro for unlimited sessions.
          </DialogDescription>
        </DialogHeader>

        {/* Pro benefits */}
        <div className="mt-2 space-y-2">
          {[
            "Unlimited Discovery sessions",
            "All existing features stay the same",
            "Priority support",
            "Early access to new features",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Pricing callout */}
        <div className="mt-4 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Forgewright Pro</p>
            <p className="text-xs text-muted-foreground">Cancel anytime</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">$15</p>
            <p className="text-xs text-muted-foreground">/ month</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => checkoutMutation.mutate({ origin: window.location.origin })}
            disabled={checkoutMutation.isPending}
          >
            <Zap className="w-4 h-4 mr-2" />
            {checkoutMutation.isPending ? "Redirecting to Stripe…" : "Upgrade to Pro — $15/month"}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => {
              onClose();
              navigate("/pricing");
            }}
          >
            View full pricing details
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            <X className="w-3 h-3 mr-1" />
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
