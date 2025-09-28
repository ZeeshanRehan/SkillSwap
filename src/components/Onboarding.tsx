"use client";

import { useEffect } from "react";

type Props = {
  active: boolean;
  steps: Array<{ element?: string; intro: string; position?: string }>;
};

export default function Onboarding({ active, steps }: Props) {
  useEffect(() => {
    if (!active) return;
    let intro: any;
    (async () => {
      const mod = await import("intro.js");
      intro = mod.default();
      intro.setOptions({
      disableInteraction: false,
      showBullets: false,
      showProgress: true,
      overlayOpacity: 0.45,
      scrollToElement: true,
      exitOnEsc: true,
      exitOnOverlayClick: true,
      nextLabel: "Next",
      prevLabel: "Back",
      skipLabel: "Skip",
      doneLabel: "Got it",
      tooltipClass: "philly-intro-tooltip",
      highlightClass: "philly-intro-highlight",
      steps,
      });
      intro.start();
    })();
    return () => {
      try { intro?.exit?.(); } catch {}
    };
  }, [active, JSON.stringify(steps)]);
  return null;
}


