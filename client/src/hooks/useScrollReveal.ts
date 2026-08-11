import { useEffect, useRef } from "react";

/**
 * Attaches IntersectionObserver to add `.visible` class to `.reveal` children.
 * Respects prefers-reduced-motion by skipping if motion is reduced.
 */
export function useScrollReveal(rootMargin = "0px 0px -60px 0px") {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const container = ref.current ?? document;
    const targets = (container instanceof Document ? document : container).querySelectorAll(".reveal");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
