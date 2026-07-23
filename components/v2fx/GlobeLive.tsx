"use client";

import { useEffect, useRef } from "react";

/**
 * Concept B — "Connected Earth".
 * A rotating 3D dot-matrix globe. Continents are real (rasterized from
 * Natural Earth land polygons into the packed bitmask below), drawn as
 * brand-blue dots on a light sphere, with orange connection arcs pulsing
 * between world cities. Rendered on a 2D canvas with hand-rolled 3D math —
 * no libraries, no imagery.
 */

const MASK_W = 144;
const MASK_H = 72;
const MASK_B64 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCf//8HAAAAAAAAAAAAAAAAyPzz//8A4AAAAAADAAAAAACAlAnw//8AAAAAB4AfAAAAAADAAywA/P8AAABgAP4fAAEAAQKAPvYH+ID///9nuP//7x8AHwAA1CPjB+D/f4BfKAAAAAAAMAAAAMCDB/z9H0ADAAAAAAAAAP///684+AAB8P7///////9/wP///wMGcAAAfP7//////38fgAf+/wdeAAAAfP7//////wEBAAH4/x9+AABAKP//////f8ABAADw/3//AQCw+P///////8AAAADg////AwDA/////////wAAAADA//8vBwDA/////////wAAAADA//8/AACA/6/v////fwAAAADA//8PAACA1wf3////PwIAAADA//8HAADwYW/P////DwEAAACA//8DAADwQPnP//9/BAEAAACA//8DAAAAD+D/////yAAAAAAA/v8BAADgD8D/////IAAAAAAA+n8AAADwf9f/////AQAAAAAA/IMAAADw///3////AQAAAAAA8IEAAAD8/7/P////AAAAAAAA4AEAAAD8/79/+P9/AQAAAAAAwBEAAAD+/3//8OcHAAAAAAAAwBsYAAD8/39/4MMLAAAAAAAAAB4AAAD+//8e4IEHAQAAAAAAAHAAAAD+//8HwIAPAwAAAAAAAAAUAAD8//8JwIAGAAAAAAAAAID+AAD4//8PAIAABAAAAAAAAAD+AQDw/f8PAAEBAAAAAAAAAAD+DwAA8P8HAIBhAAAAAAAAAAD/DwAA8P8DAABzAAAAAAAAAAD/PwAA8P8BAABzMQAAAAAAAAD//wEA8P8AAAACwQMAAAAAAAD//wMA4P8AAAAEgAcAAAAAAAD//wMA4P8AAACABQEAAAAAAAD+/wEA4P8AAAAAAAAAAAAAAAD+/wAA4P8IAAAAMAAA//////8HAP//H+AMAAAAfgIAAAAAAADw/wAA4D8MAAAA/gcAAAAAAADw/wAA4D8GAADA/w8AAAAAAADwPwAAwD8GAADg/w8AAAAAAADwHwAAwB8AAADg/x8AAAAAAAD4DwAAgB8AAADA/x8AAAAAAAD4DwAAgA8AAADA/x8AAAAAAAD4BwAAgAMAAADAwx8AAAAAAAD4AQAAAAAAAAAAAA8AAAAAAAD4AAAAAAAAAAAAAARAAAAAAAA8AAAAAAAAAAAAAAQgAAAAAAA4AAAAAAAAAAAAAAAQAAAAAAAcAAAAAAAAAAAAAAAIAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAMAQAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAABAAAAAAABgAAAiAAAAAAAAAAAgAAAAACD+j////x8AAAAAAAB8AACg////5/////8PAACAgP/9AAD+//////////8HAMD///8PAMD///////////8BgPz///8BcPz///////////8HAPz///8fAP7///////////8AAPj///////////////////8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

interface P3 {
  x: number;
  y: number;
  z: number;
}

function decodeMask(): boolean[] {
  const bin = atob(MASK_B64);
  const bits: boolean[] = new Array(MASK_W * MASK_H);
  for (let i = 0; i < bits.length; i++) {
    bits[i] = (bin.charCodeAt(i >> 3) & (1 << (i & 7))) !== 0;
  }
  return bits;
}

function latLonToXYZ(latDeg: number, lonDeg: number): P3 {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return {
    x: Math.cos(lat) * Math.sin(lon),
    y: Math.sin(lat),
    z: Math.cos(lat) * Math.cos(lon),
  };
}

// hub cities for the connection arcs (lat, lon)
const HUBS: [number, number][] = [
  [40.7, -74.0], // New York
  [51.5, -0.1], // London
  [35.7, 139.7], // Tokyo
  [-33.9, 151.2], // Sydney
  [-23.6, -46.6], // São Paulo
  [25.2, 55.3], // Dubai
  [34.0, -118.2], // Los Angeles
];
const ARCS: [number, number][] = [
  [0, 1],
  [1, 5],
  [5, 2],
  [2, 3],
  [0, 6],
  [6, 2],
  [1, 4],
];

export default function GlobeLive() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bits = decodeMask();
    // land points with a slight de-gridding jitter for an organic look
    const pts: { p: P3; o: boolean }[] = [];
    let n = 0;
    for (let gy = 0; gy < MASK_H; gy++) {
      for (let gx = 0; gx < MASK_W; gx++) {
        if (!bits[gy * MASK_W + gx]) continue;
        const lat = 90 - ((gy + 0.5) / MASK_H) * 180;
        if (lat < -72) continue; // skip the dense antarctic dot ring
        const lon = -180 + ((gx + 0.5) / MASK_W) * 360;
        pts.push({ p: latLonToXYZ(lat, lon), o: n % 19 === 0 });
        n++;
      }
    }
    const hubs = HUBS.map(([la, lo]) => latLonToXYZ(la, lo));

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
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const TILT = (-18 * Math.PI) / 180;
    const cosT = Math.cos(TILT), sinT = Math.sin(TILT);

    const rotate = (p: P3, rot: number): P3 => {
      // spin around Y, then tilt around X
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const x1 = p.x * cr + p.z * sr;
      const z1 = -p.x * sr + p.z * cr;
      return { x: x1, y: p.y * cosT - z1 * sinT, z: p.y * sinT + z1 * cosT };
    };

    const slerp = (a: P3, b: P3, t: number): P3 => {
      const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
      const th = Math.acos(dot);
      if (th < 1e-4) return a;
      const s = Math.sin(th);
      const wa = Math.sin((1 - t) * th) / s;
      const wb = Math.sin(t * th) / s;
      return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
    };

    const draw = (tSec: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.40;
      const rot = tSec * 0.14;

      // atmosphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.45);
      glow.addColorStop(0, "rgba(27,117,187,0.10)");
      glow.addColorStop(0.72, "rgba(27,117,187,0.05)");
      glow.addColorStop(1, "rgba(27,117,187,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // sphere disc + rim
      const disc = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      disc.addColorStop(0, "rgba(255,255,255,0.95)");
      disc.addColorStop(1, "rgba(224,238,248,0.9)");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(27,117,187,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // land dots
      for (const { p, o } of pts) {
        const q = rotate(p, rot);
        if (q.z < 0.02) continue;
        const sx = cx + q.x * R;
        const sy = cy - q.y * R;
        const a = 0.25 + 0.65 * q.z;
        ctx.fillStyle = o
          ? `rgba(241,90,36,${(a * 0.9).toFixed(3)})`
          : `rgba(16,89,148,${a.toFixed(3)})`;
        const r = (0.9 + 1.5 * q.z) * (R / 210);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // connection arcs with traveling pulses
      for (let i = 0; i < ARCS.length; i++) {
        const [ai, bi] = ARCS[i];
        const A = hubs[ai], B = hubs[bi];
        const STEPS = 44;
        ctx.beginPath();
        let drawing = false;
        for (let s = 0; s <= STEPS; s++) {
          const tt = s / STEPS;
          const m = slerp(A, B, tt);
          const lift = 1 + 0.22 * Math.sin(Math.PI * tt);
          const q = rotate({ x: m.x * lift, y: m.y * lift, z: m.z * lift }, rot);
          if (q.z < 0.0) {
            drawing = false;
            continue;
          }
          const sx = cx + q.x * R;
          const sy = cy - q.y * R;
          if (!drawing) {
            ctx.moveTo(sx, sy);
            drawing = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.strokeStyle = "rgba(241,90,36,0.30)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // pulse
        const pt = (tSec * 0.12 + i * 0.37) % 1;
        const m = slerp(A, B, pt);
        const lift = 1 + 0.22 * Math.sin(Math.PI * pt);
        const q = rotate({ x: m.x * lift, y: m.y * lift, z: m.z * lift }, rot);
        if (q.z > 0) {
          const sx = cx + q.x * R;
          const sy = cy - q.y * R;
          ctx.fillStyle = "rgba(241,90,36,0.95)";
          ctx.beginPath();
          ctx.arc(sx, sy, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(241,90,36,0.25)";
          ctx.beginPath();
          ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // hub markers
        for (const hi of [ai, bi]) {
          const q2 = rotate(hubs[hi], rot);
          if (q2.z < 0.02) continue;
          ctx.fillStyle = "rgba(241,90,36,0.9)";
          ctx.beginPath();
          ctx.arc(cx + q2.x * R, cy - q2.y * R, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // soft ground shadow
      const shY = cy + R * 1.38;
      const sh = ctx.createRadialGradient(cx, shY, 0, cx, shY, R * 0.75);
      sh.addColorStop(0, "rgba(14,40,66,0.10)");
      sh.addColorStop(1, "rgba(14,40,66,0)");
      ctx.fillStyle = sh;
      ctx.save();
      ctx.translate(cx, shY);
      ctx.scale(1, 0.18);
      ctx.translate(-cx, -shY);
      ctx.fillRect(cx - R, shY - R, R * 2, R * 2);
      ctx.restore();
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      draw(20);
      ro.disconnect();
      return;
    }

    let running = true;
    const io = new IntersectionObserver((e) => (running = e[0].isIntersecting), { threshold: 0 });
    io.observe(canvas);

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      draw((now - t0) / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-label="Generated rotating globe with connection arcs"
      role="img"
    />
  );
}
