import { Fragment } from "react";
import { content } from "@/lib/content";
import MotionFX from "@/components/MotionFX";

/** Render lines separated by <br/>. */
function multiline(lines: string[]) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

/** Wrap one word of a sentence in <em> for the gradient accent treatment. */
function accent(text: string, word: string) {
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

function Cube({ size, letters }: { size: "hero" | "mini"; letters: [string, string, string] }) {
  const cls = size === "hero" ? "cube" : "mini-cube";
  const [a, b, c] = letters;
  return (
    <div className={cls} aria-hidden="true">
      <i className="f1">{a}</i>
      <i className="f2">{b}</i>
      <i className="f3">{a}</i>
      <i className="f4">{b}</i>
      <i className="f5">{c}</i>
      <i className="f6">{c}</i>
    </div>
  );
}

/** Parse "04" -> {n:4,pad:2}, "20+" -> {n:20,suffix:"+"} for the count-up stats. */
function statParts(value: string) {
  const m = value.match(/^(\d+)(.*)$/);
  if (!m) return null;
  return { n: parseInt(m[1], 10), pad: m[1].startsWith("0") ? m[1].length : 0, suffix: m[2] };
}

export default function Home() {
  const { brand, nav, hero, intro, portfolio, approach, history, contact, footer } =
    content;
  const tickerItems = [hero.eyebrow, ...portfolio.companies.map((c) => c.kicker)];

  return (
    <main id="top">
      <MotionFX />

      {/* ---------- Header ---------- */}
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label={`${brand.name} home`}>
          <img src="/geg-mark-color.png" alt="" width={46} height={46} />
          <span className="wm-text">
            <b>Greenberg</b>
            <i>Enterprise Group</i>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          {nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="btn btn-primary header-contact" href={`mailto:${brand.email}`}>
          Contact <span aria-hidden="true">↗</span>
        </a>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-blob a" aria-hidden="true" />
        <div className="hero-blob b" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow" data-reveal>
              {hero.eyebrow}
            </p>
            <h1 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              {accent(hero.headline, "enduring")}
            </h1>
            <p className="hero-lede" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
              {hero.lede}
            </p>
            <div className="hero-cta" data-reveal style={{ "--d": ".24s" } as React.CSSProperties}>
              <a className="btn btn-primary btn-lg" href={hero.ctaHref}>
                {hero.ctaLabel} <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-ghost btn-lg" href={`mailto:${brand.email}`}>
                Contact <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="hero-visual" data-reveal style={{ "--d": ".2s" } as React.CSSProperties}>
            <div className="photo-frame" data-tilt="6" role="img" aria-label={hero.imageAlt}>
              <div className="kenburns" />
            </div>
            <div className="scene">
              <Cube size="hero" letters={["G", "E", "G"]} />
            </div>
            <div className="cube-shadow" aria-hidden="true" />
          </div>
        </div>

        <div className="stats" aria-label="Portfolio snapshot" data-reveal>
          <span className="stats-title">{hero.snapshotTitle}</span>
          {hero.snapshot.map((stat) => {
            const parts = statParts(stat.value);
            return (
              <div className="stat" key={stat.label}>
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
        </div>
      </section>

      {/* ---------- Ticker ---------- */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <Fragment key={copy}>
              {tickerItems.map((item, i) => (
                <span key={`${copy}-${i}`}>{item}</span>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ---------- Intro / About ---------- */}
      <section className="intro section" id="about">
        <div className="section-label" data-reveal>
          <b>{intro.num}</b> {intro.label}
        </div>
        <p className="eyebrow" data-reveal>
          {intro.eyebrow}
        </p>
        <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
          {multiline(intro.headingLines)}
        </h2>
        <div className="two-col-copy">
          {intro.paragraphs.map((para, i) => (
            <p key={i} data-reveal style={{ "--d": `${0.12 + i * 0.1}s` } as React.CSSProperties}>
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ---------- Portfolio ---------- */}
      <section className="portfolio section" id="portfolio">
        <div className="section-label" data-reveal>
          <b>{portfolio.num}</b> {portfolio.label}
        </div>
        <h2 data-reveal>{portfolio.heading}</h2>

        <div className="company-list">
          {portfolio.companies.map((company, i) => (
            <article
              className="company"
              key={company.index}
              data-tilt="4"
              data-reveal
              style={{ "--d": `${(i % 2) * 0.1}s` } as React.CSSProperties}
            >
              <div className="company-top">
                <div className="mini-scene">
                  <Cube size="mini" letters={[company.monogram, company.monogram, "G"]} />
                </div>
                <span className="company-index">{company.index}</span>
              </div>

              <p className="company-kicker">{company.kicker}</p>
              <h3>{company.name}</h3>
              <div className="company-meta">
                {company.meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
              <p className="company-description">{company.description}</p>

              <div className="company-links">
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
                {company.stage && <span className="company-stage">{company.stage}</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Approach ---------- */}
      <section className="approach section" id="approach">
        <div className="section-label" data-reveal>
          <b>{approach.num}</b> {approach.label}
        </div>
        <div className="approach-grid">
          <div className="approach-title">
            <p className="eyebrow" data-reveal>
              {approach.eyebrow}
            </p>
            <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
              {approach.heading}
            </h2>
          </div>
          <div className="principles">
            {approach.principles.map((p, i) => (
              <article
                key={p.num}
                data-num={p.num}
                data-reveal
                style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
              >
                <span>{p.num}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Parallax band ---------- */}
      <div className="band">
        <div className="band-bg" data-parallax="0.16" aria-hidden="true" />
        <div className="band-overlay" aria-hidden="true" />
        <div className="band-content" data-reveal>
          <p className="eyebrow">{brand.name}</p>
          <p className="band-tagline">{accent(brand.tagline, "enduring")}</p>
        </div>
      </div>

      {/* ---------- History ---------- */}
      <section className="history section" id="history">
        <div className="section-label" data-reveal>
          <b>{history.num}</b> {history.label}
        </div>
        <h2 data-reveal>{history.heading}</h2>

        <div className="exit-list">
          {history.exits.map((exit, i) => (
            <article
              key={exit.id}
              id={exit.id}
              data-reveal
              style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
            >
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
      <section className="contact-section" id="contact">
        <div className="hero-grid" aria-hidden="true" />
        <p className="eyebrow" data-reveal>
          {contact.eyebrow}
        </p>
        <h2 data-reveal style={{ "--d": ".08s" } as React.CSSProperties}>
          {accent(contact.headingLines[0], "opportunity")}
          <br />
          {contact.headingLines[1]}
        </h2>
        <div className="contact-actions" data-reveal style={{ "--d": ".16s" } as React.CSSProperties}>
          <a className="btn btn-primary btn-lg" href={`mailto:${contact.email}`}>
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
          {footer.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <p className="copyright">
          © {footer.copyrightYear} {brand.legalName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
