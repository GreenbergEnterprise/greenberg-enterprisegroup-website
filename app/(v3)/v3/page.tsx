import { Fragment } from "react";
import { content } from "@/lib/content";
import Fx3 from "@/components/v3/Fx3";

/** Split a headline into animated lines/words, italicizing the accent word. */
function SplitHeadline({ text, accent }: { text: string; accent: string }) {
  const words = text.split(" ");
  const ai = words.findIndex((w) => w.toLowerCase().startsWith(accent.toLowerCase()));
  const lines: string[][] =
    ai > 0
      ? [words.slice(0, ai), [words[ai]], words.slice(ai + 1)].filter((l) => l.length)
      : [words];
  let wi = 0;
  return (
    <>
      {lines.map((line, li) => (
        <span className="line" key={li}>
          {line.map((word) => {
            const delay = { "--wd": `${0.1 + wi++ * 0.09}s` } as React.CSSProperties;
            const isAccent = wi - 1 === ai;
            return (
              <Fragment key={`${li}-${word}-${wi}`}>
                <span className="w" style={delay}>
                  {isAccent ? <em>{word}</em> : word}
                </span>{" "}
              </Fragment>
            );
          })}
        </span>
      ))}
    </>
  );
}

/** Wrap one word in <em> for the gradient italic treatment. */
function accentWord(text: string, word: string) {
  const idx = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <em>{text.slice(idx, idx + word.length)}</em>
      {text.slice(idx + word.length)}
    </>
  );
}

function MiniCube({ letter }: { letter: string }) {
  return (
    <div className="mini-scene" aria-hidden="true">
      <div className="mini-cube">
        <i className="f1">{letter}</i>
        <i className="f2">{letter}</i>
        <i className="f3">{letter}</i>
        <i className="f4">{letter}</i>
        <i className="f5">G</i>
        <i className="f6">G</i>
      </div>
    </div>
  );
}

function statParts(value: string) {
  const m = value.match(/^(\d+)(.*)$/);
  if (!m) return null;
  return { n: parseInt(m[1], 10), pad: m[1].startsWith("0") ? m[1].length : 0, suffix: m[2] };
}

export default function V3() {
  const { brand, nav, hero, intro, portfolio, approach, history, contact, footer } =
    content;
  const tickerWords = brand.tagline.replace(/\.$/, "").split(" ");

  return (
    <main id="top">
      <Fx3 />

      {/* ---------- Floating pill nav ---------- */}
      <div className="navbar">
        <a className="mark" href="#top" aria-label={`${brand.name} home`}>
          <img src="/geg-mark-color.png" alt="" width={36} height={36} />
          <b>
            <span className="g1">Greenberg</span> <span className="g2">Enterprise Group</span>
          </b>
        </a>
        <nav aria-label="Primary navigation">
          {nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-primary btn-sm" data-magnet="0.2" href={`mailto:${brand.email}`}>
          Contact <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* ---------- Hero ---------- */}
      <section className="hero" data-scene>
        <canvas id="fx-canvas" aria-hidden="true" />

        <div className="hero-media" data-depth="0.35" aria-hidden="true">
          <div className="media-img" />
        </div>

        {hero.snapshot.map((stat, i) => {
          const parts = statParts(stat.value);
          return (
            <div
              className={`chip chip-${i + 1}`}
              data-depth={[0.7, 0.5, 0.85][i]}
              key={stat.label}
            >
              {parts ? (
                <b data-count={parts.n} data-pad={parts.pad} data-suffix={parts.suffix}>
                  {stat.value}
                </b>
              ) : (
                <b>{stat.value}</b>
              )}
              <span>{stat.label}</span>
            </div>
          );
        })}

        <div className="hero-copy">
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1>
            <SplitHeadline text={hero.headline} accent="enduring" />
          </h1>
          <p className="hero-lede" data-reveal>
            {hero.lede}
          </p>
          <div className="hero-cta" data-reveal style={{ "--d": ".1s" } as React.CSSProperties}>
            <a className="btn btn-primary btn-lg" data-magnet="0.18" href={hero.ctaHref}>
              {hero.ctaLabel} <span aria-hidden="true">→</span>
            </a>
            <a className="btn btn-ghost btn-lg" data-magnet="0.18" href={`mailto:${brand.email}`}>
              Contact <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          Scroll
        </div>
      </section>

      {/* ---------- Outline marquee ---------- */}
      <div className="outline-marquee" aria-hidden="true">
        <div className="outline-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              {Array.from({ length: 3 }).map((_, r) => (
                <Fragment key={r}>
                  {tickerWords.map((w, i) =>
                    w.toLowerCase() === "enduring" ? <i key={i}> {w} </i> : <Fragment key={i}> {w} </Fragment>
                  )}
                  {" — "}
                </Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- About ---------- */}
      <section className="about section" id="about">
        <div className="section-label" data-reveal>
          <b>{intro.num}</b> {intro.label}
        </div>
        <div className="about-grid">
          <div className="about-copy">
            <p className="eyebrow" data-reveal>
              <span className="dot" aria-hidden="true" />
              {intro.eyebrow}
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              {intro.headingLines.map((l, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {i === 1 ? <em>{l}</em> : l}
                </Fragment>
              ))}
            </h2>
            {intro.paragraphs.map((para, i) => (
              <p key={i} data-reveal style={{ "--d": `${0.1 + i * 0.1}s` } as React.CSSProperties}>
                {para}
              </p>
            ))}
          </div>
          <figure className="about-media" data-reveal="right">
            <span className="ghost" aria-hidden="true">
              {intro.num}
            </span>
            <div className="holo" data-tilt="7">
              <img src="/v3/holo.webp" alt="Abstract flowing light in the brand colors" />
            </div>
            <figcaption>{brand.tagline}</figcaption>
          </figure>
        </div>
      </section>

      {/* ---------- Portfolio rows ---------- */}
      <section className="work section" id="portfolio">
        <div className="section-label" data-reveal>
          <b>{portfolio.num}</b> {portfolio.label}
        </div>
        <h2 data-reveal>{portfolio.heading}</h2>

        <div className="rows">
          {portfolio.companies.map((company, i) => (
            <article className="row" key={company.index} data-reveal style={{ "--d": `${i * 0.06}s` } as React.CSSProperties}>
              <span className="row-index">{company.index}</span>
              <MiniCube letter={company.monogram} />
              <div className="row-name">
                <h3>{company.name}</h3>
                <span className="row-kicker">{company.kicker}</span>
              </div>
              <div className="row-info">
                <div className="row-meta">
                  {company.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <p>{company.description}</p>
                <div className="row-links">
                  {company.visit && (
                    <a
                      href={company.visit.href}
                      aria-label={company.visit.ariaLabel ?? `Visit ${company.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {company.visit.label} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {company.brands?.map((b) => (
                    <a key={b.href} href={b.href} target="_blank" rel="noopener noreferrer">
                      {b.label} <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                  {company.stage && <span className="row-stage">{company.stage}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Approach: stacking cards ---------- */}
      <section className="approach section" id="approach">
        <div className="section-label" data-reveal>
          <b>{approach.num}</b> {approach.label}
        </div>
        <p className="eyebrow" data-reveal>
          <span className="dot" aria-hidden="true" />
          {approach.eyebrow}
        </p>
        <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
          {accentWord(approach.heading, "distance")}
        </h2>

        <div className="stack">
          {approach.principles.map((p, i) => (
            <article
              className="stack-card"
              key={p.num}
              style={{ top: `${104 + i * 30}px`, zIndex: i + 1 }}
            >
              <span className="stack-num" aria-hidden="true">
                {p.num}
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Ocean band ---------- */}
      <div className="ocean">
        <div className="ocean-bg" data-parallax="0.14" aria-hidden="true" />
        <div className="ocean-glass" data-reveal="scale">
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {brand.name}
          </p>
          <p className="big">{accentWord(brand.tagline, "enduring")}</p>
        </div>
      </div>

      {/* ---------- History timeline ---------- */}
      <section className="history section" id="history">
        <div className="section-label" data-reveal>
          <b>{history.num}</b> {history.label}
        </div>
        <h2 data-reveal>{history.heading}</h2>

        <div className="timeline">
          {history.exits.map((exit, i) => (
            <article key={exit.id} id={exit.id} data-reveal="left" style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}>
              <div>
                <span className="exit-cat">{exit.category}</span>
                <h3>{exit.name}</h3>
              </div>
              <p>{exit.note}</p>
              <span className="status">{exit.status}</span>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="contact" id="contact">
        <div className="blob o" aria-hidden="true" />
        <div className="blob b" aria-hidden="true" />
        <p className="eyebrow" data-reveal>
          <span className="dot" aria-hidden="true" />
          {contact.eyebrow}
        </p>
        <h2 data-reveal style={{ "--d": ".06s" } as React.CSSProperties}>
          {accentWord(contact.headingLines[0], "opportunity")}
          <br />
          {contact.headingLines[1]}
        </h2>
        <div className="contact-actions" data-reveal style={{ "--d": ".14s" } as React.CSSProperties}>
          <a className="btn btn-primary btn-lg" data-magnet="0.16" href={`mailto:${contact.email}`}>
            {contact.ctaLabel} <span aria-hidden="true">→</span>
          </a>
          <a className="contact-email" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer>
        <div className="footer-brand">
          <img src="/geg-mark-color.png" alt="" width={50} height={50} />
          <div>
            <b>
              <span className="g1">Greenberg</span> <span className="g2">Enterprise Group, LLC</span>
            </b>
            <p>{brand.tagline}</p>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-links">
            {footer.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="versions" aria-label="Design versions">
            <a href="/">V1</a>
            <a href="/v2">V2</a>
            <a href="/v3" className="on">
              V3
            </a>
          </div>
        </div>

        <p className="copyright">
          © {footer.copyrightYear} {brand.legalName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
