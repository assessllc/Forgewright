/**
 * useOnboarding — manages first-run tour state and what's-new banner visibility.
 *
 * State is persisted in localStorage so the tour never re-triggers automatically.
 * Users can manually re-trigger via the sidebar "Take the tour" link.
 *
 * Keys:
 *   forgewright_onboarded        — boolean; true once user completes or skips the tour
 *   forgewright_tour_step        — number; last completed step (0-indexed)
 *   forgewright_whats_new_seen   — string; version string of last seen "what's new" banner
 */

import { useState, useCallback, useEffect } from "react";

const ONBOARDED_KEY = "forgewright_onboarded";
const WHATS_NEW_KEY = "forgewright_whats_new_seen";

/** Current app version — bump this string to re-show the "What's new" banner */
export const CURRENT_VERSION = "1.0.0";

export interface OnboardingState {
  /** Whether the first-run tour should be shown right now */
  showTour: boolean;
  /** Whether the "What's new" banner should be shown */
  showWhatsNew: boolean;
  /** Mark the tour as complete (or skipped) */
  completeTour: () => void;
  /** Manually re-trigger the tour (e.g. from sidebar link) */
  restartTour: () => void;
  /** Dismiss the "What's new" banner for this version */
  dismissWhatsNew: () => void;
}

export function useOnboarding(): OnboardingState {
  const [showTour, setShowTour] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDED_KEY);
    const seenVersion = localStorage.getItem(WHATS_NEW_KEY);

    if (!onboarded) {
      // First-time user: show the tour
      setShowTour(true);
    } else if (seenVersion !== CURRENT_VERSION) {
      // Returning user who hasn't seen the current version's what's-new banner
      setShowWhatsNew(true);
    }
  }, []);

  const completeTour = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    localStorage.setItem(WHATS_NEW_KEY, CURRENT_VERSION);
    setShowTour(false);
    setShowWhatsNew(false);
  }, []);

  const restartTour = useCallback(() => {
    setShowTour(true);
  }, []);

  const dismissWhatsNew = useCallback(() => {
    localStorage.setItem(WHATS_NEW_KEY, CURRENT_VERSION);
    setShowWhatsNew(false);
  }, []);

  return { showTour, showWhatsNew, completeTour, restartTour, dismissWhatsNew };
}
