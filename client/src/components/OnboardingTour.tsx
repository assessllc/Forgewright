/**
 * OnboardingTour — 5-step guided tooltip tour using driver.js.
 *
 * Steps walk through the core Forgewright workflow:
 *   1. Home input — describe what you want to build
 *   2. Discovery — the AI interview that extracts your spec
 *   3. Scaffold Builder — the 8-block structured editor
 *   4. Pattern Library — apply documented patterns to your scaffold
 *   5. Reverse Mode — work backwards from output you admire
 *
 * The tour is triggered by the parent via `active` prop.
 * On complete or skip, `onFinish` is called so the parent can persist state.
 */

import { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface OnboardingTourProps {
  active: boolean;
  onFinish: () => void;
}

export default function OnboardingTour({ active, onFinish }: OnboardingTourProps) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    if (!active) return;

    // Small delay so the DOM is fully painted before driver.js measures elements
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 8,
        allowClose: true,
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Start building",
        onDestroyStarted: () => {
          driverObj.destroy();
          onFinish();
        },
        steps: [
          {
            // Step 1: Home input — the starting point
            element: "textarea",
            popover: {
              title: "Start here",
              description:
                "Describe what you want the AI to do — in plain language. Forgewright will extract the specification you didn't know you needed to provide. Leave it blank to start a guided discovery conversation.",
              side: "bottom",
              align: "center",
            },
          },
          {
            // Step 2: Discovery nav item
            element: 'a[href="/discovery"]',
            popover: {
              title: "Discovery — the AI interview",
              description:
                "Discovery interviews you with targeted questions to surface domain, audience, constraints, and success criteria. It auto-detects your domain and applies the right elicitation script. Most users produce a better prompt in 3 minutes here than in 30 minutes writing freehand.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 3: Scaffold Builder nav item
            element: 'a[href="/scaffold"]',
            popover: {
              title: "Scaffold Builder — the structured editor",
              description:
                "Your prompt is built as 8 labeled blocks: Role, Context, Task, Constraints, Examples, Format, Reasoning, and Output Validation. Each block is independently editable, togglable, and annotated. Token counts and cost estimates update in real time.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 4: Pattern Library nav item
            element: 'a[href="/patterns"]',
            popover: {
              title: "Pattern Library — documented techniques",
              description:
                "22 prompt patterns drawn from published research — Chain-of-Thought, Few-Shot, ReAct, Self-Critique, and more. Each has a description, when-to-use guidance, and a one-click 'Apply to Scaffold' action that merges the pattern into your current session.",
              side: "right",
              align: "start",
            },
          },
          {
            // Step 5: Reverse Mode nav item
            element: 'a[href="/reverse"]',
            popover: {
              title: "Reverse Mode — work backwards from output",
              description:
                "Paste any output you admire — an article, a code snippet, an analysis. Forgewright reverse-engineers the prompt structure that would produce something like it, and populates your scaffold automatically. This is the fastest way to learn what good prompts look like.",
              side: "right",
              align: "start",
            },
          },
        ],
      });

      driverRef.current = driverObj;
      driverObj.drive();
    }, 400);

    return () => {
      clearTimeout(timer);
      driverRef.current?.destroy();
    };
  }, [active, onFinish]);

  return null; // driver.js manages its own DOM
}
