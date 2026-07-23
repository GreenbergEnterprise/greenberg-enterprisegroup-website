"use client";

import { useEffect } from "react";

/**
 * v3 motion layer. Server-rendered content works without it; on mount it
 * powers: scroll reveals, count-up stats, pointer tilt, scroll parallax,
 * magnetic buttons, a cursor ring, a mouse-parallax depth scene and the
 * interactive particle canvas in the hero. Everything is skipped under
 * prefers-reduced-motion, and pointer effects only attach on fine pointers.
 */
export default function Fx3() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      reveals.forEach((el) => el.classList.add("in"));
      return;
    }

    const cleanups: Array<() => void> = [];

    // --- hero headline word rise ---
    const h1 = document.querySelector(".hero h1");
    if (h1) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => h1.classList.add("in"))
      );
      cleanups.push(() => cancelAnimationFrame(raf));
    }

    // --- scroll reveals ---
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
    cleanups.push(() => io.disconnect());

    // --- count-up stats ---
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
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1400);
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
    cleanups.push(() => cio.disconnect());

    // --- scroll parallax ---
    const pEls = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let praf = 0;
    const onScroll = () => {
      cancelAnimationFrame(praf);
      praf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        for (const el of pEls) {
          const s = parseFloat(el.dataset.parallax || "") || 0.12;
          const r = el.getBoundingClientRect();
          el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * s).toFixed(1)}px, 0)`;
        }
      });
    };
    if (pEls.length) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanups.push(() => {
        cancelAnimationFrame(praf);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });
    }

    if (fine) {
      // --- pointer tilt ---
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"))) {
        const max = parseFloat(el.dataset.tilt || "") || 6;
        const move = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width - 0.5;
          const py = (ev.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(1000px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
        };
        const leave = () => (el.style.transform = "");
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      }

      // --- magnetic elements ---
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-magnet]"))) {
        const strength = parseFloat(el.dataset.magnet || "") || 0.22;
        const move = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = ev.clientX - (r.left + r.width / 2);
          const dy = ev.clientY - (r.top + r.height / 2);
          el.style.translate = `${(dx * strength).toFixed(1)}px ${(dy * strength).toFixed(1)}px`;
        };
        const leave = () => (el.style.translate = "0px 0px");
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      }

      // --- cursor ring ---
      const ring = document.createElement("div");
      ring.className = "cursor-ring";
      document.body.appendChild(ring);
      let rx = -100, ry = -100, tx = -100, ty = -100;
      let hover = false;
      const cmove = (ev: PointerEvent) => {
        tx = ev.clientX;
        ty = ev.clientY;
        const t = ev.target as HTMLElement;
        hover = !!t.closest("a, button, [data-magnet], [data-tilt]");
        ring.classList.toggle("is-hover", hover);
      };
      let craf = 0;
      const cloop = () => {
        rx += (tx - rx) * 0.16;
        ry += (ty - ry) * 0.16;
        ring.style.transform = `translate(${rx - 21}px, ${ry - 21}px)`;
        craf = requestAnimationFrame(cloop);
      };
      window.addEventListener("pointermove", cmove, { passive: true });
      craf = requestAnimationFrame(cloop);
      cleanups.push(() => {
        window.removeEventListener("pointermove", cmove);
        cancelAnimationFrame(craf);
        ring.remove();
      });

      // --- mouse-parallax depth scene ---
      const scene = document.querySelector<HTMLElement>("[data-scene]");
      const depths = Array.from(document.querySelectorAll<HTMLElement>("[data-depth]"));
      if (scene && depths.length) {
        const smove = (ev: PointerEvent) => {
          const dx = ev.clientX / window.innerWidth - 0.5;
          const dy = ev.clientY / window.innerHeight - 0.5;
          for (const el of depths) {
            const d = parseFloat(el.dataset.depth || "") || 0.5;
            el.style.translate = `${(-dx * d * 36).toFixed(1)}px ${(-dy * d * 26).toFixed(1)}px`;
          }
        };
        scene.addEventListener("pointermove", smove, { passive: true });
        cleanups.push(() => scene.removeEventListener("pointermove", smove));
      }
    }

    // --- particle canvas ---
    const canvas = document.getElementById("fx-canvas") as HTMLCanvasElement | null;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        let W = 0, H = 0;
        const fit = () => {
          const r = canvas.getBoundingClientRect();
          W = r.width;
          H = r.height;
          canvas.width = W * dpr;
          canvas.height = H * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        fit();
        const N = Math.min(72, Math.max(36, Math.floor(W / 22)));
        const seed = (i: number, m: number) => ((i * 9301 + 49297) % 233280) / 233280 * m;
        const pts = Array.from({ length: N }, (_, i) => ({
          x: seed(i * 7 + 1, W),
          y: seed(i * 13 + 5, H),
          vx: (seed(i * 3 + 2, 1) - 0.5) * 0.5,
          vy: (seed(i * 5 + 3, 1) - 0.5) * 0.5,
          o: i % 3 === 0,
        }));
        let mx = -9999, my = -9999;
        const pmove = (ev: PointerEvent) => {
          const r = canvas.getBoundingClientRect();
          mx = ev.clientX - r.left;
          my = ev.clientY - r.top;
        };
        const pleave = () => {
          mx = -9999;
          my = -9999;
        };
        window.addEventListener("pointermove", pmove, { passive: true });
        window.addEventListener("resize", fit);
        canvas.addEventListener("pointerleave", pleave);

        let running = true;
        const vio = new IntersectionObserver((e) => (running = e[0].isIntersecting), { threshold: 0 });
        vio.observe(canvas);

        let fraf = 0;
        const frame = () => {
          fraf = requestAnimationFrame(frame);
          if (!running) return;
          ctx.clearRect(0, 0, W, H);
          for (const p of pts) {
            const ddx = p.x - mx, ddy = p.y - my;
            const dist = Math.hypot(ddx, ddy);
            if (dist < 140 && dist > 0.01) {
              p.vx += (ddx / dist) * 0.16;
              p.vy += (ddy / dist) * 0.16;
            }
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            p.x = Math.max(0, Math.min(W, p.x));
            p.y = Math.max(0, Math.min(H, p.y));
          }
          ctx.lineWidth = 1;
          for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
              const a = pts[i], b = pts[j];
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (d < 110) {
                ctx.strokeStyle = `rgba(27,117,187,${(0.16 * (1 - d / 110)).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
          for (const p of pts) {
            ctx.fillStyle = p.o ? "rgba(241,90,36,0.55)" : "rgba(27,117,187,0.5)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.o ? 2.4 : 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        };
        fraf = requestAnimationFrame(frame);
        cleanups.push(() => {
          cancelAnimationFrame(fraf);
          vio.disconnect();
          window.removeEventListener("pointermove", pmove);
          window.removeEventListener("resize", fit);
          canvas.removeEventListener("pointerleave", pleave);
        });
      }
    }

    return () => cleanups.forEach((f) => f());
  }, []);

  return null;
}
