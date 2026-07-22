export type NavLink = {
  label: string;
  href: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: "sparkles" | "shield" | "zap" | "layers";
};

export type Step = {
  number: string;
  title: string;
  description: string;
};

export type SiteContent = {
  brand: {
    name: string;
    tagline: string;
  };
  nav: NavLink[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
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
    copyright: string;
    links: NavLink[];
  };
};

/**
 * Central content source for the landing page.
 * Update this file once Linear project requirements are synced.
 */
export const siteContent: SiteContent = {
  brand: {
    name: "Blueprint",
    tagline: "Plan, build, and ship with clarity.",
  },
  nav: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Stripe Connect", href: "/connect" },
    { label: "Get started", href: "#cta" },
  ],
  hero: {
    eyebrow: "Landing page foundation",
    headline: "Turn your product vision into a page that converts.",
    subheadline:
      "A modular Next.js foundation ready to be filled in from your Linear project — hero, features, workflow, and call-to-action sections included.",
    primaryCta: { label: "Get started", href: "#cta" },
    secondaryCta: { label: "See features", href: "#features" },
  },
  features: {
    title: "Built for fast iteration",
    description:
      "Each section is isolated and content-driven so you can map Linear issues directly to components.",
    items: [
      {
        title: "Content-first architecture",
        description:
          "All copy and links live in a single typed config, making it easy to sync from Linear docs or issues.",
        icon: "layers",
      },
      {
        title: "Polished by default",
        description:
          "Responsive layout, accessible navigation, and a cohesive visual system out of the box.",
        icon: "sparkles",
      },
      {
        title: "Production ready",
        description:
          "Next.js App Router, TypeScript, and Tailwind CSS — ready to deploy on Vercel.",
        icon: "zap",
      },
      {
        title: "Easy to extend",
        description:
          "Add new sections as your Linear project grows without restructuring the app.",
        icon: "shield",
      },
    ],
  },
  howItWorks: {
    title: "How it works",
    description: "A simple flow from planning to launch.",
    steps: [
      {
        number: "01",
        title: "Define in Linear",
        description:
          "Capture requirements, copy, and design notes as issues or project docs in your Linear workspace.",
      },
      {
        number: "02",
        title: "Map to sections",
        description:
          "Connect each Linear issue to a landing page section in the content config.",
      },
      {
        number: "03",
        title: "Ship the page",
        description:
          "Build, preview locally, and deploy — iterate as your project evolves.",
      },
    ],
  },
  cta: {
    title: "Ready to connect your Linear project?",
    description:
      "Authenticate the Linear MCP server in Cursor to pull your project requirements and replace the placeholder content.",
    button: { label: "Contact us", href: "mailto:hello@example.com" },
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Blueprint. All rights reserved.`,
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "GitHub", href: "https://github.com/garlobrian52/bitcoin" },
    ],
  },
};
