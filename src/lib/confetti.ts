export function fireConfetti(): void {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.pointerEvents = "none";
  root.style.zIndex = "9999";

  const colors = ["#004C55", "#0a7c86", "#ffffff", "#0b1a1c", "#e5f4f6"];
  const emojis = ["✦", "◆", "●", "★", "✳︎"];

  for (let i = 0; i < 24; i++) {
    const span = document.createElement("span");
    span.textContent = emojis[i % emojis.length];
    span.style.position = "absolute";
    span.style.top = "-10px";
    span.style.left = Math.random() * 100 + "vw";
    span.style.color = colors[i % colors.length];
    span.style.fontSize = 10 + Math.round(Math.random() * 10) + "px";
    span.style.opacity = "0";
    span.style.transform = "translateY(0)";
    span.style.transition = "transform 1.2s ease-out, opacity 1.2s ease-out";
    root.appendChild(span);

    requestAnimationFrame(() => {
      span.style.opacity = "1";
      span.style.transform = `translateY(${60 + Math.random() * 60}vh)`;
      span.style.transitionDelay = `${Math.random() * 0.12}s`;
    });
  }

  document.body.appendChild(root);
  setTimeout(() => {
    if (root.parentNode) root.parentNode.removeChild(root);
  }, 1400);
}
