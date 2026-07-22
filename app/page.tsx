import { Fragment } from "react";
import { content } from "@/lib/content";

/** Render an array of strings as lines separated by <br/>. */
function multiline(lines: string[]) {
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

export default function Home() {
  const { brand, nav, hero, intro, portfolio, approach, history, contact, footer } =
    content;

  return (
    <main>
      {/* ---------- Header ---------- */}
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label={`${brand.name} home`}>
          <span className="brand-mark" />
          <span>{brand.name}</span>
        </a>

        <nav aria-label="Primary navigation">
          {nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <a className="header-contact" href={`mailto:${brand.email}`}>
          Contact <span aria-hidden="true">↗</span>
        </a>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1>{hero.headline}</h1>
          <p className="hero-lede">{hero.lede}</p>
          <a className="primary-button" href={hero.ctaHref}>
            {hero.ctaLabel} <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="hero-image" role="img" aria-label={hero.imageAlt} />

        <div className="snapshot" aria-label="Portfolio snapshot">
          <span className="snapshot-title">{hero.snapshotTitle}</span>
          {hero.snapshot.map((stat) => (
            <span key={stat.label}>
              <b>{stat.value}</b> {stat.label}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Intro / About ---------- */}
      <section className="intro section" id="about">
        <div className="section-label">
          <span>{intro.num}</span> {intro.label}
        </div>
        <div className="intro-content">
          <p className="eyebrow">{intro.eyebrow}</p>
          <h2>{multiline(intro.headingLines)}</h2>
          <div className="two-col-copy">
            {intro.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Portfolio ---------- */}
      <section className="portfolio section" id="portfolio">
        <div className="portfolio-heading">
          <div className="section-label light">
            <span>{portfolio.num}</span> {portfolio.label}
          </div>
          <h2>{portfolio.heading}</h2>
        </div>

        <div className="company-list">
          {portfolio.companies.map((company) => (
            <article className="company" key={company.index}>
              <div className="company-index">{company.index}</div>
              <div className="company-monogram">{company.monogram}</div>
              <div className="company-main">
                <p>{company.kicker}</p>
                <h3>{company.name}</h3>
                <div className="company-meta">
                  {company.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <div className="company-description">{company.description}</div>
                {company.brands && (
                  <div className="company-brands" aria-label={`${company.name} brands`}>
                    {company.brands.map((b) => (
                      <a key={b.href} href={b.href} target="_blank" rel="noopener noreferrer">
                        {b.label}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

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
              {company.stage && <span className="company-stage">{company.stage}</span>}
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Approach ---------- */}
      <section className="approach section" id="approach">
        <div className="section-label">
          <span>{approach.num}</span> {approach.label}
        </div>
        <div className="approach-grid">
          <div className="approach-title">
            <p className="eyebrow">{approach.eyebrow}</p>
            <h2>{approach.heading}</h2>
          </div>
          <div className="principles">
            {approach.principles.map((p) => (
              <article key={p.num}>
                <span>{p.num}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- History / Selected history ---------- */}
      <section className="history section" id="history">
        <div className="history-heading">
          <div className="section-label">
            <span>{history.num}</span> {history.label}
          </div>
          <h2>{history.heading}</h2>
        </div>

        <div className="exit-list">
          {history.exits.map((exit) => (
            <article key={exit.id} id={exit.id}>
              <div>
                <span>{exit.category}</span>
                <h3>{exit.name}</h3>
              </div>
              <p>{exit.note}</p>
              <span className="status">{exit.status}</span>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="contact-section">
        <p className="eyebrow">{contact.eyebrow}</p>
        <h2>{multiline(contact.headingLines)}</h2>
        <a href={`mailto:${contact.email}`}>
          {contact.ctaLabel} <span aria-hidden="true">→</span>
        </a>
      </section>

      {/* ---------- Footer ---------- */}
      <footer>
        <div className="footer-brand">
          <span className="brand-mark" />
          <div>
            <b>{brand.legalName}</b>
            <p>{brand.tagline}</p>
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
