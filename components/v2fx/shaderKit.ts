"use client";

/**
 * Minimal WebGL fullscreen-shader runner shared by the generated hero
 * visuals. Handles: context setup, resize (DPR-capped), a u_t/u_res uniform
 * loop, pausing when offscreen, and a static single frame under
 * prefers-reduced-motion.
 */
export function runShader(canvas: HTMLCanvasElement, fragSrc: string): () => void {
  const gl = canvas.getContext("webgl", { antialias: false, depth: false, stencil: false });
  if (!gl) return () => {};

  const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      // Surface shader bugs loudly during development
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
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

  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width * dpr));
    const h = Math.max(2, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  const draw = (t: number) => {
    gl.uniform1f(uT, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    draw(14);
    ro.disconnect();
    return () => {};
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
}

/** Shared GLSL helpers: hash, value noise, fbm. */
export const GLSL_NOISE = `
precision highp float;
uniform float u_t;
uniform vec2 u_res;

float hash(vec2 p){
  p = fract(p*vec2(123.34, 345.45));
  p += dot(p, p+34.345);
  return fract(p.x*p.y);
}
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, amp = 0.5;
  for(int i=0;i<5;i++){
    v += amp*noise(p);
    p = p*2.03 + vec2(17.3, 9.1);
    amp *= 0.5;
  }
  return v;
}
`;
