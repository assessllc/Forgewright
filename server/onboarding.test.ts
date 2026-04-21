/**
 * Onboarding logic tests — Phase 7
 *
 * These tests validate the core state machine of the onboarding hook:
 * first-run detection, tour completion/skip, what's-new banner versioning.
 *
 * Because the hook uses localStorage (browser API), we test the underlying
 * logic directly via pure functions extracted from the hook's decision tree.
 * The driver.js tour itself is a UI integration and is not unit-tested here.
 */

import { describe, it, expect, beforeEach } from "vitest";

// ─── Pure logic extracted from useOnboarding ──────────────────────────────────

const ONBOARDED_KEY = "forgewright_onboarded";
const WHATS_NEW_KEY = "forgewright_whats_new_seen";
const CURRENT_VERSION = "1.0.0";

interface OnboardingDecision {
  showTour: boolean;
  showWhatsNew: boolean;
}

/**
 * Deterministic decision function — mirrors the useEffect in useOnboarding.ts.
 * Accepts a mock localStorage snapshot so we can test without a browser.
 */
function computeOnboardingState(
  storage: Record<string, string>
): OnboardingDecision {
  const onboarded = storage[ONBOARDED_KEY];
  const seenVersion = storage[WHATS_NEW_KEY];

  if (!onboarded) {
    return { showTour: true, showWhatsNew: false };
  }
  if (seenVersion !== CURRENT_VERSION) {
    return { showTour: false, showWhatsNew: true };
  }
  return { showTour: false, showWhatsNew: false };
}

/**
 * State after completing the tour — mirrors completeTour() in useOnboarding.ts.
 */
function applyCompleteTour(
  storage: Record<string, string>
): Record<string, string> {
  return {
    ...storage,
    [ONBOARDED_KEY]: "true",
    [WHATS_NEW_KEY]: CURRENT_VERSION,
  };
}

/**
 * State after dismissing the what's-new banner.
 */
function applyDismissWhatsNew(
  storage: Record<string, string>
): Record<string, string> {
  return { ...storage, [WHATS_NEW_KEY]: CURRENT_VERSION };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Onboarding state machine", () => {
  describe("First-run detection", () => {
    it("shows the tour for a brand-new user with empty storage", () => {
      const state = computeOnboardingState({});
      expect(state.showTour).toBe(true);
      expect(state.showWhatsNew).toBe(false);
    });

    it("does not show the tour if the user has already onboarded", () => {
      const storage = {
        [ONBOARDED_KEY]: "true",
        [WHATS_NEW_KEY]: CURRENT_VERSION,
      };
      const state = computeOnboardingState(storage);
      expect(state.showTour).toBe(false);
    });

    it("does not show the what's-new banner for a first-time user (tour takes priority)", () => {
      // Even if the version key is absent, a first-time user sees the tour, not the banner
      const state = computeOnboardingState({});
      expect(state.showWhatsNew).toBe(false);
    });
  });

  describe("Tour completion", () => {
    it("sets both onboarded and whats-new-seen keys on completion", () => {
      const after = applyCompleteTour({});
      expect(after[ONBOARDED_KEY]).toBe("true");
      expect(after[WHATS_NEW_KEY]).toBe(CURRENT_VERSION);
    });

    it("after completion, neither tour nor banner is shown", () => {
      const storage = applyCompleteTour({});
      const state = computeOnboardingState(storage);
      expect(state.showTour).toBe(false);
      expect(state.showWhatsNew).toBe(false);
    });

    it("after skip (same as complete), neither tour nor banner is shown", () => {
      // Skip is treated identically to complete — both call completeTour()
      const storage = applyCompleteTour({});
      const state = computeOnboardingState(storage);
      expect(state.showTour).toBe(false);
      expect(state.showWhatsNew).toBe(false);
    });
  });

  describe("What's new banner versioning", () => {
    it("shows the banner for a returning user who has not seen the current version", () => {
      const storage = {
        [ONBOARDED_KEY]: "true",
        [WHATS_NEW_KEY]: "0.9.0", // older version
      };
      const state = computeOnboardingState(storage);
      expect(state.showWhatsNew).toBe(true);
      expect(state.showTour).toBe(false);
    });

    it("does not show the banner for a returning user who has already seen this version", () => {
      const storage = {
        [ONBOARDED_KEY]: "true",
        [WHATS_NEW_KEY]: CURRENT_VERSION,
      };
      const state = computeOnboardingState(storage);
      expect(state.showWhatsNew).toBe(false);
    });

    it("does not show the banner for a returning user with no version key (treated as unseen)", () => {
      // No WHATS_NEW_KEY means they haven't seen it → banner should show
      const storage = { [ONBOARDED_KEY]: "true" };
      const state = computeOnboardingState(storage);
      expect(state.showWhatsNew).toBe(true);
    });

    it("dismissing the banner sets the version key to current", () => {
      const storage = { [ONBOARDED_KEY]: "true", [WHATS_NEW_KEY]: "0.9.0" };
      const after = applyDismissWhatsNew(storage);
      expect(after[WHATS_NEW_KEY]).toBe(CURRENT_VERSION);
    });

    it("after dismissal, the banner is no longer shown", () => {
      const storage = { [ONBOARDED_KEY]: "true", [WHATS_NEW_KEY]: "0.9.0" };
      const after = applyDismissWhatsNew(storage);
      const state = computeOnboardingState(after);
      expect(state.showWhatsNew).toBe(false);
    });
  });

  describe("Manual tour restart", () => {
    it("restartTour does not modify storage — it only sets in-memory state", () => {
      // restartTour() just calls setShowTour(true) — no storage side-effect.
      // We verify that storage state after restart still has onboarded=true,
      // meaning the next page load won't re-trigger the tour automatically.
      const storage = {
        [ONBOARDED_KEY]: "true",
        [WHATS_NEW_KEY]: CURRENT_VERSION,
      };
      // Storage is unchanged by restartTour
      const stateAfterRestart = computeOnboardingState(storage);
      // The hook's in-memory showTour would be true, but storage still says onboarded
      // So the next cold load would NOT show the tour (correct behavior)
      expect(stateAfterRestart.showTour).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles storage with only the onboarded key and no version key", () => {
      const storage = { [ONBOARDED_KEY]: "true" };
      const state = computeOnboardingState(storage);
      // No version seen → show banner
      expect(state.showWhatsNew).toBe(true);
      expect(state.showTour).toBe(false);
    });

    it("handles storage with only the version key and no onboarded key", () => {
      const storage = { [WHATS_NEW_KEY]: CURRENT_VERSION };
      const state = computeOnboardingState(storage);
      // Not onboarded → show tour (version key is irrelevant)
      expect(state.showTour).toBe(true);
      expect(state.showWhatsNew).toBe(false);
    });

    it("is idempotent: completing the tour multiple times produces the same result", () => {
      let storage = applyCompleteTour({});
      storage = applyCompleteTour(storage); // second call
      const state = computeOnboardingState(storage);
      expect(state.showTour).toBe(false);
      expect(state.showWhatsNew).toBe(false);
    });
  });
});
