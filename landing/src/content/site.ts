export type NavLink = {
  label: string;
  href: string;
};

export type Feature = {
  title: string;
  description: string;
};

export type Step = {
  number: string;
  title: string;
  description: string;
};

export type SiteContent = {
  brand: {
    name: string;
    mark: string;
  };
  nav: NavLink[];
  hero: {
    headline: string;
    support: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  features: {
    title: string;
    description: string;
    items: Feature[];
  };
  howItWorks: {
    title: string;
    description: string;
    steps: Step[];
  };
  cta: {
    title: string;
    description: string;
    button: { label: string; href: string };
  };
  footer: {
    note: string;
    links: NavLink[];
  };
};

/**
 * Single source of truth for landing page copy.
 * Replace / extend from Linear project issues once the Linear MCP
 * server is authenticated in Cursor.
 */
export const siteContent: SiteContent = {
  brand: {
    name: "Blueprint",
    mark: "BP",
  },
  nav: [
    { label: "Features", href: "#features" },
    { label: "Process", href: "#process" },
    { label: "Start", href: "#start" },
  ],
  hero: {
    headline: "Ship the page your product deserves.",
    support:
      "A modular Next.js foundation mapped to your Linear project — ready for real copy, real visuals, and a clear path to launch.",
    primaryCta: { label: "Start building", href: "#start" },
    secondaryCta: { label: "See the structure", href: "#features" },
  },
  features: {
    title: "Structure that keeps pace with the plan",
    description:
      "Each section is content-driven so Linear issues can land directly in the page without a redesign.",
    items: [
      {
        title: "Typed content config",
        description:
          "All headlines, CTAs, and section data live in one file — sync from Linear docs or issues without hunting through JSX.",
      },
      {
        title: "Section-first layout",
        description:
          "Hero, features, process, and call-to-action are isolated components you can reorder or extend as the project grows.",
      },
      {
        title: "Deployable by default",
        description:
          "Next.js App Router, TypeScript, and Tailwind — preview locally and ship to Vercel when the brief is locked.",
      },
    ],
  },
  howItWorks: {
    title: "From Linear to live",
    description: "A straight line from requirements to a page that ships.",
    steps: [
      {
        number: "01",
        title: "Capture the brief",
        description:
          "Keep product copy, visual notes, and acceptance criteria in your Linear project.",
      },
      {
        number: "02",
        title: "Map to sections",
        description:
          "Translate each issue into fields in the content config and matching components.",
      },
      {
        number: "03",
        title: "Launch and iterate",
        description:
          "Build, preview, deploy — then refine as Linear tickets move through the board.",
      },
    ],
  },
  cta: {
    title: "Connect Linear to finish the foundation",
    description:
      "Authenticate the Linear MCP server in Cursor Desktop, then sync your project requirements into this content config.",
    button: { label: "Open the content config", href: "#features" },
  },
  footer: {
    note: "Landing page foundation · content pending Linear sync",
    links: [
      { label: "Features", href: "#features" },
      { label: "Process", href: "#process" },
      {
        label: "Repository",
        href: "https://github.com/garlobrian52/bitcoin",
      },
    ],
  },
};
