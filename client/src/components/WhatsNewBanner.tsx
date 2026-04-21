/**
 * WhatsNewBanner — a dismissible top-of-page banner shown to returning users
 * when a new version has been deployed. Version-keyed via CURRENT_VERSION in
 * useOnboarding so it only appears once per release.
 */

import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsNewBannerProps {
  onDismiss: () => void;
}

const WHATS_NEW_ITEMS = [
  "Output Diagnosis — paste AI output and get targeted edit suggestions",
  "A/B Compare — run two prompt variants side-by-side and track which wins",
  "Version History — every scaffold change tracked with visual diff and rollback",
  "Personal Insights — 12 pattern-learning rules that surface your prompt habits",
  "Swarm Composer — design multi-agent prompt systems with 8 production templates",
];

export default function WhatsNewBanner({ onDismiss }: WhatsNewBannerProps) {
  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground mb-1">
            What's new in Forgewright v1.0
          </p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {WHATS_NEW_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5 flex-shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
          aria-label="Dismiss what's new banner"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
