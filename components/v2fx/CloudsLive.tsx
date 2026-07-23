"use client";

import { useEffect, useRef } from "react";
import { runShader, GLSL_NOISE } from "./shaderKit";

/**
 * Concept C — "Aerial Cloudscape".
 * Two layers of domain-warped noise clouds drifting at different speeds
 * over a pale sky with a warm sun. 100% generated in a fragment shader.
 */
const FRAG = `
${GLSL_NOISE}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_t * 0.05;

  // sky: zenith blue to warm horizon
  vec3 zenith  = vec3(0.50, 0.72, 0.92);
  vec3 horizon = vec3(0.98, 0.95, 0.90);
  vec3 col = mix(horizon, zenith, smoothstep(0.05, 0.9, uv.y));

  // warm sun, upper right
  vec2 sun = vec2(0.80 * u_res.x / u_res.y, 0.78);
  float sd = length(p - sun);
  col += vec3(1.0, 0.72, 0.42) * 0.38 * exp(-sd*3.4);
  col += vec3(1.0, 0.55, 0.25) * 0.18 * exp(-sd*9.0);

  // far cloud layer (big, slow)
  float w1 = fbm(p*1.6 + vec2(t*0.5, 0.0));
  float d1 = smoothstep(0.46, 0.72, fbm(p*2.2 + w1 + vec2(t*0.8, 0.02*sin(t))));
  vec3 farCloud = mix(vec3(0.86, 0.89, 0.94), vec3(1.0), d1);
  col = mix(col, farCloud, d1*0.55);

  // near cloud layer (smaller, faster, shaded)
  float w2 = fbm(p*2.4 + vec2(t*1.1, 3.0));
  float c2 = fbm(p*3.4 + w2 + vec2(t*1.7, 7.0));
  float d2 = smoothstep(0.50, 0.78, c2);
  // underside shading: sample density slightly toward the sun
  float lit = fbm(p*3.4 + w2 + vec2(t*1.7, 7.0) + normalize(sun - p)*0.18);
  float shade = clamp((lit - c2)*2.4, -0.5, 0.6);
  vec3 nearCloud = mix(vec3(0.72, 0.77, 0.85), vec3(1.02, 1.0, 0.98), 0.55 + shade);
  col = mix(col, nearCloud, d2*0.92);

  // faint warm glow on cloud edges near the sun
  col += vec3(1.0, 0.6, 0.3) * 0.10 * d2 * exp(-sd*2.2);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function CloudsLive() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return runShader(ref.current, FRAG);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-label="Generated drifting clouds animation" role="img" />;
}
