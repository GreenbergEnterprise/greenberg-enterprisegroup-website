"use client";

import { useEffect, useRef } from "react";

/**
 * Concept B3 — "Connected Earth — Realistic".
 * A photoreal-style 3D Earth: the generated equirectangular texture
 * (/earth-tex.webp, painted from Natural Earth land polygons) wrapped
 * around a per-pixel raycast sphere in WebGL, with sun lighting, ocean
 * specular, drifting procedural clouds and an atmosphere rim — plus the
 * live network of connection arcs on a synced 2D overlay.
 */

const ROT_SPEED = 0.14;
const TILT = (-18 * Math.PI) / 180;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform sampler2D u_tex;

const float TILT = -0.3141592653589793; // -18deg
const float PI = 3.141592653589793;

float hash(vec2 p){
  p = fract(p*vec2(123.34, 345.45));
  p += dot(p, p+34.345);
  return fract(p.x*p.y);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, amp = 0.5;
  for(int i=0;i<4;i++){
    v += amp*noise(p);
    p = p*2.03 + vec2(17.3, 9.1);
    amp *= 0.5;
  }
  return v;
}
vec3 rotX(vec3 v, float a){
  float c = cos(a), s = sin(a);
  return vec3(v.x, v.y*c - v.z*s, v.y*s + v.z*c);
}
vec3 rotY(vec3 v, float a){
  float c = cos(a), s = sin(a);
  return vec3(v.x*c + v.z*s, v.y, -v.x*s + v.z*c);
}

void main(){
  vec2 p = (2.0*gl_FragCoord.xy - u_res) / min(u_res.x, u_res.y);
  vec2 q = p / 0.8; // sphere radius = 0.40*min => 0.8 in this space
  float r2 = dot(q, q);

  vec3 L = normalize(vec3(-0.45, 0.42, 0.74));

  if (r2 > 1.0) {
    // atmosphere halo
    float d = sqrt(r2) - 1.0;
    float glow = exp(-d*7.0)*0.42 + exp(-d*22.0)*0.25;
    vec3 halo = vec3(0.45, 0.68, 0.9);
    float a = clamp(glow, 0.0, 1.0);
    gl_FragColor = vec4(halo*a, a);
    return;
  }

  // view-space normal on the sphere
  vec3 n = vec3(q.x, q.y, sqrt(max(0.0, 1.0 - r2)));

  // invert view transforms to find the sphere-space direction
  float rot = u_t * ${ROT_SPEED.toFixed(4)};
  vec3 s = rotY(rotX(n, -TILT), -rot);

  float lat = asin(clamp(s.y, -1.0, 1.0));
  float lon = atan(s.x, s.z);
  vec2 uv = vec2(lon/(2.0*PI) + 0.5, 0.5 - lat/PI);
  vec3 col = texture2D(u_tex, uv).rgb;

  // ocean detection for specular (blue-dominant pixels)
  float ocean = smoothstep(0.04, 0.22, col.b - col.r);

  // drifting clouds: noise over sphere-space direction (seam-free),
  // rotated slowly relative to the ground
  vec3 cs = rotY(s, u_t*0.02);
  float cbase = fbm(vec2(cs.x*2.6 + cs.z*1.3, cs.y*2.6 - cs.z*0.7))
              + 0.45*fbm(vec2(cs.z*4.2, cs.y*4.2 + cs.x*2.1));
  float cloud = smoothstep(0.78, 1.05, cbase);

  // lighting (fixed in view space)
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float shade = 0.32 + 0.78*diff;
  col *= shade;

  // ocean sun glint
  vec3 R = reflect(-L, n);
  float spec = pow(max(R.z, 0.0), 60.0) * ocean * 0.55;
  col += vec3(1.0, 0.95, 0.85) * spec;

  // cloud shadow then clouds
  col *= 1.0 - 0.22*cloud;
  vec3 cloudCol = vec3(1.0) * (0.55 + 0.5*diff);
  col = mix(col, cloudCol, cloud*0.92);

  // atmosphere rim (fresnel)
  float fres = pow(1.0 - n.z, 2.6);
  col += vec3(0.36, 0.58, 0.85) * fres * 0.5;

  gl_FragColor = vec4(col, 1.0);
}
`;

interface P3 {
  x: number;
  y: number;
  z: number;
}

function latLonToXYZ(latDeg: number, lonDeg: number): P3 {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  return { x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon) };
}

const HUBS: [number, number][] = [
  [40.7, -74.0],
  [51.5, -0.1],
  [35.7, 139.7],
  [-33.9, 151.2],
  [-23.6, -46.6],
  [25.2, 55.3],
  [34.0, -118.2],
  [1.35, 103.8], // Singapore
  [19.1, 72.9], // Mumbai
  [52.5, 13.4], // Berlin
  [-1.3, 36.8], // Nairobi
  [45.4, -75.7], // Ottawa
];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function EarthLive() {
  const glRef = useRef<HTMLCanvasElement>(null);
  const ovRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const glCanvas = glRef.current;
    const ovCanvas = ovRef.current;
    if (!glCanvas || !ovCanvas) return;
    const gl = glCanvas.getContext("webgl", { antialias: false, depth: false, alpha: true, premultipliedAlpha: true });
    const ctx = ovCanvas.getContext("2d");
    if (!gl || !ctx) return;

    // --- WebGL setup ---
    const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, "u_t");
    const uRes = gl.getUniformLocation(prog, "u_res");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([10, 50, 100]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const img = new Image();
    img.src = "/earth-tex.webp";
    let texReady = false;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      texReady = true;
    };

    // --- shared sizing ---
    const dpr = Math.min(1.75, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const fit = () => {
      const r = glCanvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      glCanvas.width = Math.max(2, Math.round(W * dpr));
      glCanvas.height = Math.max(2, Math.round(H * dpr));
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      ovCanvas.width = Math.max(2, Math.round(W * dpr));
      ovCanvas.height = Math.max(2, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(glCanvas);

    // --- network arcs state ---
    const hubs = HUBS.map(([la, lo]) => latLonToXYZ(la, lo));
    const rand = mulberry32(4242);
    interface LiveArc {
      A: P3;
      B: P3;
      born: number;
      dur: number;
      big: boolean;
      dist: number;
    }
    const arcs: LiveArc[] = [];
    const MAX_ARCS = 100;
    const angDist = (a: P3, b: P3) =>
      Math.acos(Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z)));
    // endpoints: hubs plus random points biased to land latitudes
    const pool: P3[] = [...hubs];
    for (let i = 0; i < 90; i++) {
      const lat = (rand() * 2 - 1) * 62;
      const lon = rand() * 360 - 180;
      pool.push(latLonToXYZ(lat, lon));
    }
    const spawnArc = (now: number, preAge = 0) => {
      let A: P3, B: P3, d = 0, guard = 0;
      do {
        A = rand() < 0.55 ? hubs[(rand() * hubs.length) | 0] : pool[(rand() * pool.length) | 0];
        B = pool[(rand() * pool.length) | 0];
        d = angDist(A, B);
      } while ((d < 0.35 || d > 2.6) && guard++ < 8);
      arcs.push({ A, B, born: now - preAge, dur: 1.6 + rand() * 1.9, big: rand() < 0.16, dist: d });
    };

    const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
    const rotate = (p: P3, rot: number): P3 => {
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const x1 = p.x * cr + p.z * sr;
      const z1 = -p.x * sr + p.z * cr;
      return { x: x1, y: p.y * cosT - z1 * sinT, z: p.y * sinT + z1 * cosT };
    };
    const slerp = (a: P3, b: P3, t: number): P3 => {
      const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
      const th = Math.acos(dot);
      if (th < 1e-4) return a;
      const sn = Math.sin(th);
      const wa = Math.sin((1 - t) * th) / sn;
      const wb = Math.sin(t * th) / sn;
      return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
    };

    const drawOverlay = (tSec: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.4;
      const rot = tSec * ROT_SPEED;

      for (let i = arcs.length - 1; i >= 0; i--) {
        if ((tSec - arcs[i].born) / arcs[i].dur > 1) arcs.splice(i, 1);
      }
      while (arcs.length < MAX_ARCS) spawnArc(tSec, rand() * 0.25);

      for (const arc of arcs) {
        const p = (tSec - arc.born) / arc.dur;
        const growEnd = 0.32;
        const reach = p < growEnd ? 1 - Math.pow(1 - p / growEnd, 3) : 1;
        const fade = p < 0.7 ? 1 : Math.max(0, 1 - (p - 0.7) / 0.3);
        const lift = 0.1 + 0.12 * arc.dist;
        const STEPS = 26;
        const nSeg = Math.max(2, Math.round(STEPS * reach));

        ctx.beginPath();
        let drawing = false;
        let zSum = 0, zN = 0;
        let head: P3 | null = null;
        for (let sg = 0; sg <= nSeg; sg++) {
          const tt = sg / STEPS;
          const m = slerp(arc.A, arc.B, tt);
          const l = 1 + lift * Math.sin(Math.PI * tt);
          const q = rotate({ x: m.x * l, y: m.y * l, z: m.z * l }, rot);
          if (sg === nSeg) head = q;
          if (q.z < 0) {
            drawing = false;
            continue;
          }
          zSum += q.z;
          zN++;
          const sx = cx + q.x * R, sy = cy - q.y * R;
          if (!drawing) {
            ctx.moveTo(sx, sy);
            drawing = true;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        if (!zN) continue;
        const zAvg = zSum / zN;
        const a = fade * (arc.big ? 0.66 : 0.44) * (0.4 + 0.6 * zAvg);
        ctx.strokeStyle = arc.big
          ? `rgba(120,200,255,${a.toFixed(3)})`
          : `rgba(255,140,70,${a.toFixed(3)})`;
        ctx.lineWidth = arc.big ? 1.7 : 1.2;
        ctx.stroke();

        if (p < growEnd && head && head.z > 0) {
          const hx = cx + head.x * R, hy = cy - head.y * R;
          ctx.fillStyle = `rgba(255,255,255,${(0.95 * fade).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(hx, hy, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = arc.big ? "rgba(120,200,255,0.5)" : "rgba(255,140,70,0.55)";
          ctx.beginPath();
          ctx.arc(hx, hy, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p >= growEnd && p < growEnd + 0.16) {
          const q = rotate(arc.B, rot);
          if (q.z > 0) {
            const k = (p - growEnd) / 0.16;
            const bx = cx + q.x * R, by = cy - q.y * R;
            ctx.strokeStyle = `rgba(255,140,70,${(0.75 * (1 - k) * q.z).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(bx, by, 2 + k * 9, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // city lights: steady hub glow
      for (const h of hubs) {
        const q = rotate(h, tSec * ROT_SPEED);
        if (q.z < 0.02) continue;
        const hx = cx + q.x * R, hy = cy - q.y * R;
        ctx.fillStyle = "rgba(255,190,120,0.95)";
        ctx.beginPath();
        ctx.arc(hx, hy, 2.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,150,80,0.22)";
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawGL = (tSec: number) => {
      gl.uniform1f(uT, tSec);
      gl.uniform2f(uRes, glCanvas.width, glCanvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const once = () => {
        drawGL(20);
        for (let i = 0; i < MAX_ARCS; i++) spawnArc(20, rand() * 2.4);
        drawOverlay(20);
      };
      if (texReady) once();
      else img.addEventListener("load", once, { once: true });
      return () => ro.disconnect();
    }

    let running = true;
    const io = new IntersectionObserver((e) => (running = e[0].isIntersecting), { threshold: 0 });
    io.observe(glCanvas);

    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) return;
      const t = (now - t0) / 1000;
      drawGL(t);
      drawOverlay(t);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const style: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  return (
    <>
      <canvas ref={glRef} style={style} aria-label="Realistic rotating Earth with live network connections" role="img" />
      <canvas ref={ovRef} style={style} aria-hidden="true" />
    </>
  );
}
