"use client";

import { useEffect, useRef } from "react";
import { runShader, GLSL_NOISE } from "./shaderKit";

/**
 * Concept A — "Living Ocean".
 * A real-time aerial ocean: sand corner, breathing foam edge, caustic
 * shimmer in the shallows, rolling swell in the deep. 100% generated in a
 * fragment shader — no photography.
 */
const FRAG = `
${GLSL_NOISE}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv; p.x *= u_res.x / u_res.y;
  float t = u_t * 0.06;

  // shoreline: diagonal, wobbled by noise, breathing with the swell
  float shore = dot(uv, vec2(0.72, 0.62)) - 0.40;
  shore += 0.075 * fbm(p*3.0 + vec2(t*0.7, -t*0.4));
  shore += 0.035 * sin(u_t*0.45 + p.x*4.0);

  vec3 sand    = vec3(0.86, 0.80, 0.69);
  vec3 wetsand = vec3(0.78, 0.72, 0.62);
  vec3 shallow = vec3(0.42, 0.79, 0.83);
  vec3 mid     = vec3(0.10, 0.53, 0.71);
  vec3 deep    = vec3(0.02, 0.26, 0.49);

  vec3 col = mix(shallow, mid, smoothstep(0.04, 0.34, shore));
  col = mix(col, deep, smoothstep(0.30, 0.72, shore));

  // wet sand strip then dry sand
  vec3 sandCol = mix(wetsand, sand, smoothstep(-0.03, -0.14, shore));
  col = mix(sandCol, col, smoothstep(-0.015, 0.05, shore));

  // caustic shimmer in the shallows (two drifting fbm fields interfering)
  float c1 = fbm(p*9.0 + vec2(t*2.1,  t*1.3));
  float c2 = fbm(p*9.0 - vec2(t*1.6,  t*2.3) + 3.7);
  float caust = pow(1.0 - abs(c1 - c2), 9.0);
  col += caust * 0.30 * smoothstep(-0.01, 0.12, shore) * (1.0 - smoothstep(0.22, 0.5, shore));

  // deep-water swell shading
  float swell = fbm(p*2.1 + vec2(-t*0.9, t*0.55));
  col -= swell * 0.09 * smoothstep(0.28, 0.75, shore);
  col += pow(fbm(p*4.0 + vec2(t*1.4, -t)), 6.0) * 0.14 * smoothstep(0.3, 0.7, shore);

  // foam: broken white edge at the waterline...
  float f = fbm(p*7.0 + vec2(t*1.3, -t*0.9));
  float foam = smoothstep(0.085, 0.0, abs(shore - 0.012))
             * smoothstep(0.32, 0.72, f + 0.30*sin(u_t*0.55 + shore*36.0));
  // ...plus streaks washing back into the shallows
  float streaks = smoothstep(0.62, 0.95, fbm(p*5.0 + vec2(0.0, shore*9.0 - t*1.6)));
  foam += streaks * smoothstep(0.015, 0.10, shore) * (1.0 - smoothstep(0.10, 0.28, shore)) * 0.8;
  col = mix(col, vec3(0.97, 0.99, 1.0), clamp(foam, 0.0, 1.0));

  // gentle vignette
  col *= 1.0 - 0.18*length(uv - 0.5);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function OceanLive() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return runShader(ref.current, FRAG);
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-label="Generated living ocean animation" role="img" />;
}
