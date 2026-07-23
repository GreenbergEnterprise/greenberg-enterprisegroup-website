"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement motion layer.
 *
 * The page is fully server-rendered and readable without this component; on
 * mount it wires up scroll reveals ([data-reveal]), count-up stats
 * ([data-count]), pointer tilt ([data-tilt]) and scroll parallax
 * ([data-parallax]). All of it is skipped when the visitor prefers reduced
 * motion.
 */
export default function MotionFX() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      reveals.forEach((el) => el.classList.add("in"));
      return;
    }

    // --- scroll reveals -----------------------------------------------------
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    // --- count-up stats -----------------------------------------------------
    const cio = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          cio.unobserve(e.target);
          const el = e.target as HTMLElement;
          const target = parseInt(el.dataset.count || "0", 10);
          const pad = parseInt(el.dataset.pad || "0", 10);
          const suffix = el.dataset.suffix || "";
          const t0 = performance.now();
          const dur = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * eased)).padStart(pad, "0") + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

    // --- pointer tilt ---------------------------------------------------------
    const tiltEls = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    const tiltCleanups: Array<() => void> = [];
    for (const el of tiltEls) {
      const max = parseFloat(el.dataset.tilt || "") || 7;
      const move = (ev: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
      };
      const leave = () => {
        el.style.transform = "";
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      tiltCleanups.push(() => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    }

    // --- parallax -------------------------------------------------------------
    const pEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        for (const el of pEls) {
          const s = parseFloat(el.dataset.parallax || "") || 0.12;
          const r = el.getBoundingClientRect();
          const off = (r.top + r.height / 2 - vh / 2) * s;
          el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
        }
      });
    };
    if (pEls.length) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    return () => {
      io.disconnect();
      cio.disconnect();
      tiltCleanups.forEach((f) => f());
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
