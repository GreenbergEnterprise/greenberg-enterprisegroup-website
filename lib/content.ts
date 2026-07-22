/**
 * Central site content.
 *
 * Every piece of copy on the page lives here so it is easy to edit in one
 * place. When a database is added later, this module can be replaced by (or
 * backed by) a MongoDB fetch that returns the same `SiteContent` shape — the
 * page components consume the typed object and do not care where it comes from.
 *
 * Content mirrors the live site at
 * https://greenberg-enterprise-group.greenbergb.chatgpt.site/
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SnapshotStat {
  value: string;
  label: string;
}

export interface BrandLink {
  label: string;
  href: string;
}

export interface Company {
  index: string;
  monogram: string;
  kicker: string;
  name: string;
  meta: string[];
  description: string;
  /** Rendered as the direct call-to-action link on the row (e.g. "Visit company"). */
  visit?: { label: string; href: string; ariaLabel?: string };
  /** Rendered inside the company body when a company operates multiple brands. */
  brands?: BrandLink[];
  /** Rendered as the right-hand status label when there is no visit link. */
  stage?: string;
}

export interface Principle {
  num: string;
  title: string;
  body: string;
}

export interface Exit {
  id: string;
  category: string;
  name: string;
  note: string;
  status: string;
}

export interface SiteContent {
  brand: {
    name: string;
    legalName: string;
    tagline: string;
    email: string;
  };
  nav: NavLink[];
  hero: {
    eyebrow: string;
    headline: string;
    lede: string;
    ctaLabel: string;
    ctaHref: string;
    imageAlt: string;
    snapshotTitle: string;
    snapshot: SnapshotStat[];
  };
  intro: {
    num: string;
    label: string;
    eyebrow: string;
    headingLines: string[];
    paragraphs: string[];
  };
  portfolio: {
    num: string;
    label: string;
    heading: string;
    companies: Company[];
  };
  approach: {
    num: string;
    label: string;
    eyebrow: string;
    heading: string;
    principles: Principle[];
  };
  history: {
    num: string;
    label: string;
    heading: string;
    exits: Exit[];
  };
  contact: {
    eyebrow: string;
    headingLines: string[];
    ctaLabel: string;
    email: string;
  };
  footer: {
    links: NavLink[];
    copyrightYear: number;
  };
}

const EMAIL = "hello@greenbergenterprisegroup.com";

export const content: SiteContent = {
  brand: {
    name: "Greenberg Enterprise Group",
    legalName: "Greenberg Enterprise Group, LLC",
    tagline: "Building enduring businesses.",
    email: EMAIL,
  },

  nav: [
    { label: "About", href: "#about" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Approach", href: "#approach" },
  ],

  hero: {
    eyebrow: "Operator-led holding company",
    headline: "We build enduring businesses.",
    lede: "We invest in and operate exceptional businesses across insurance, technology, and digital markets.",
    ctaLabel: "Explore Our Portfolio",
    ctaHref: "#portfolio",
    imageAlt: "Monumental limestone architecture in warm sunlight",
    snapshotTitle: "Portfolio snapshot",
    snapshot: [
      { value: "04", label: "Active companies" },
      { value: "03", label: "Successful exits" },
      { value: "20+", label: "Years operating" },
    ],
  },

  intro: {
    num: "01",
    label: "Who we are",
    eyebrow: "Built from the operator's seat",
    headingLines: ["Patient ownership.", "Practical experience."],
    paragraphs: [
      "Greenberg Enterprise Group is a founder-led holding company built around a simple conviction: the best businesses solve real problems, earn trust, and improve with time.",
      "We bring more than two decades of experience building companies in regulated, complex markets. Our work combines industry knowledge, digital distribution, software, and disciplined execution.",
    ],
  },

  portfolio: {
    num: "02",
    label: "Current portfolio",
    heading: "Companies we're building for the long term.",
    companies: [
      {
        index: "01",
        monogram: "Q",
        kicker: "Insurance Technology",
        name: "Quoteplicity",
        meta: ["Operating", "Portfolio company"],
        description:
          "A digital distribution platform helping insurance agencies quote, qualify, automate, and serve clients more effectively.",
        visit: {
          label: "Visit company",
          href: "https://quoteplicity.com",
          ariaLabel: "Visit Quoteplicity",
        },
      },
      {
        index: "02",
        monogram: "I",
        kicker: "Insurance Distribution",
        name: "Insurancy",
        meta: ["Operating", "Portfolio company"],
        description:
          "A modern, independent life insurance agency combining trusted guidance with a more thoughtful digital buying experience.",
        visit: {
          label: "Visit company",
          href: "https://insurancy.com",
          ariaLabel: "Visit Insurancy",
        },
      },
      {
        index: "03",
        monogram: "S",
        kicker: "Financial Services",
        name: "Six Oaks Advisory Partners",
        meta: ["In development", "New venture"],
        description:
          "A newly formed referral and advisory consulting firm connecting high-net-worth individuals, families, and business owners with trusted wealth management and financial planning relationships.",
        stage: "Building now",
      },
      {
        index: "04",
        monogram: "W",
        kicker: "Commercial Supply & E-Commerce",
        name: "Wholesale Warehouse Supply",
        meta: ["Operating", "Affiliated operating company"],
        description:
          "A family-operated commercial supply company serving thousands of customers nationwide through specialized e-commerce brands, dependable fulfillment, and long-standing manufacturer relationships.",
        brands: [
          { label: "Wholesale Janitorial Supply", href: "https://wholesalejanitorialsupply.com" },
          { label: "TouchFree Concepts", href: "https://touchfreeconcepts.com" },
        ],
        stage: "Two operating brands",
      },
    ],
  },

  approach: {
    num: "03",
    label: "Our approach",
    eyebrow: "How we create value",
    heading: "We don't invest from a distance.",
    principles: [
      {
        num: "01",
        title: "Build with purpose",
        body: "We start with durable customer problems, not temporary trends.",
      },
      {
        num: "02",
        title: "Operate actively",
        body: "Strategy matters, but execution compounds. We work inside the businesses we own.",
      },
      {
        num: "03",
        title: "Use technology wisely",
        body: "We apply software and automation where they make people more capable and service more human.",
      },
      {
        num: "04",
        title: "Think in decades",
        body: "We favor patient decisions, aligned incentives, and reputations built one customer at a time.",
      },
    ],
  },

  history: {
    num: "04",
    label: "Selected history",
    heading: "Built, grown, and successfully transitioned.",
    exits: [
      {
        id: "exit-bjg-digital",
        category: "Digital services",
        name: "BJG Digital",
        note: "Built, operated, and successfully acquired",
        status: "Successful Exit",
      },
      {
        id: "exit-insurist-true-blue",
        category: "Digital insurance",
        name: "Insurist / True Blue Life Insurance",
        note: "Built into a nationally recognized online agency and acquired",
        status: "Successful Exit",
      },
      {
        id: "exit-seo-services-internet-marketing",
        category: "Digital marketing & SEO",
        name: "SEO Services Internet Marketing LLC",
        note: "Built, operated, and successfully acquired",
        status: "Successful Exit",
      },
    ],
  },

  contact: {
    eyebrow: "Let's build what lasts",
    headingLines: ["Have an opportunity", "worth exploring?"],
    ctaLabel: "Start a conversation",
    email: EMAIL,
  },

  footer: {
    links: [
      { label: "About", href: "#about" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Approach", href: "#approach" },
    ],
    copyrightYear: 2026,
  },
};
