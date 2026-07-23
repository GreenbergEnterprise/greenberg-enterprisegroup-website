import type { Metadata } from "next";
import { content } from "@/lib/content";
import OceanLive from "@/components/v2fx/OceanLive";
import GlobeLive from "@/components/v2fx/GlobeLive";
import EarthLive from "@/components/v2fx/EarthLive";
import CloudsLive from "@/components/v2fx/CloudsLive";

export const metadata: Metadata = {
  title: `${content.brand.name} | Hero Visual Concepts`,
  robots: { index: false },
};

const CONCEPTS: {
  letter: string;
  name: string;
  desc: string;
  Comp: React.ComponentType<{ busy?: boolean }>;
  busy?: boolean;
  frameClass?: string;
}[] = [
  {
    letter: "A",
    name: "Living Ocean",
    desc: "A real-time water shader — the aerial ocean idea, but alive. The foam edge breathes against the sand, caustic light shimmers through the shallows, and slow swell rolls through the deep water. Every pixel is computed live; nothing is a photograph.",
    Comp: OceanLive,
  },
  {
    letter: "B",
    name: "Connected Earth",
    desc: "A rotating 3D globe drawn from real continent data as a matrix of brand-blue dots, with orange connection arcs pulsing between world cities — the holding company with global reach. Rendered with hand-rolled 3D math, no libraries.",
    Comp: GlobeLive,
  },
  {
    letter: "B2",
    name: "Connected Earth — Live Network",
    desc: "The busy version: dozens of connections alive at every moment, constantly firing between cities and land points across the globe. Each one draws itself across the sky, lands with an impact ring, and fades as new ones spark elsewhere — internet traffic buzzing around a living Earth.",
    Comp: GlobeLive,
    busy: true,
  },
  {
    letter: "B3",
    name: "Connected Earth — Realistic",
    desc: "The realistic take: a true 3D Earth with continents, climate colors, drifting clouds, sun glint on the oceans and an atmosphere rim — all generated in code (the surface texture is painted from real map data, the clouds are live noise fields). The same storm of connections buzzes above it.",
    Comp: EarthLive,
    frameClass: "frame-space",
  },
  {
    letter: "C",
    name: "Aerial Cloudscape",
    desc: "Drifting volumetric clouds generated from layered noise fields — two layers moving at different speeds for depth, with warm sunlight catching the edges. Slow, calm, endless motion.",
    Comp: CloudsLive,
  },
];

export default function Concepts() {
  const { brand } = content;

  return (
    <main className="concepts">
      <header className="site-header">
        <a className="wordmark" href="/v2" aria-label="Back to version 2">
          <img src="/geg-mark-color.png" alt="" width={46} height={46} />
          <span className="wm-text">
            <b>Greenberg</b>
            <i>Enterprise Group</i>
          </span>
        </a>
        <nav aria-label="Concepts navigation">
          <a href="#concept-a">A</a>
          <a href="#concept-b">B</a>
          <a href="#concept-b2">B2</a>
          <a href="#concept-b3">B3</a>
          <a href="#concept-c">C</a>
        </nav>
        <a className="btn btn-ghost header-contact" href="/v2">
          Back to V2 <span aria-hidden="true">←</span>
        </a>
      </header>

      <section className="section concepts-intro">
        <p className="eyebrow">Hero visual concepts</p>
        <h2>
          Three living, generated visuals for the V2 hero.
        </h2>
        <p className="concepts-note">
          All three are rendered in real time in the browser — created in code, not sourced
          from anywhere. They are in constant motion; hover and watch them move. Pick your
          favorite (A, B, or C) and it replaces the building photo on the V2 homepage.
        </p>
      </section>

      {CONCEPTS.map(({ letter, name, desc, Comp, busy, frameClass }) => (
        <section className="section concept" id={`concept-${letter.toLowerCase()}`} key={letter}>
          <div className="concept-head">
            <span className="concept-letter">{letter}</span>
            <div>
              <h3>{name}</h3>
              <p>{desc}</p>
            </div>
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              Live
            </span>
          </div>
          <div className={`concept-frame${frameClass ? ` ${frameClass}` : ""}`}>
            <Comp busy={busy} />
          </div>
        </section>
      ))}

      <footer>
        <div className="footer-brand">
          <img src="/geg-mark-color.png" alt="" width={52} height={52} />
          <div>
            <span className="wm-text">
              <b>Greenberg</b>
              <i>Enterprise Group, LLC</i>
            </span>
            <p className="footer-tagline">{brand.tagline}</p>
          </div>
        </div>
        <div className="footer-links">
          <a href="/v2">Version 2</a>
          <a href="/v3">Version 3</a>
          <a href="/">Version 1</a>
        </div>
        <p className="copyright">
          © {content.footer.copyrightYear} {brand.legalName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
