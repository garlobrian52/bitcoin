export type NavLink = {
  label: string;
  href: string;
};

export type Feature = {
  title: string;
  description: string;
  icon: "links" | "brand" | "analytics" | "share";
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
  preview: {
    handle: string;
    bio: string;
    links: { label: string; href: string }[];
  };
};

/**
 * Central content source for the landing page.
 * Aligned to the Blueprint link-page product (Vercel: v0-linktree-clone-plan).
 * Sync remaining copy from Linear once MCP auth is available.
 */
export const siteContent: SiteContent = {
  brand: {
    name: "Blueprint",
    tagline: "Your links. One page. Everywhere.",
  },
  nav: [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Pricing", href: "#cta" },
  ],
  hero: {
    headline: "One page for every link that matters.",
    subheadline:
      "Blueprint gives creators and shops a fast, beautiful link page — share it on socials, in bios, and on packaging.",
    primaryCta: { label: "Create your page", href: "#cta" },
    secondaryCta: { label: "See how it works", href: "#how-it-works" },
  },
  features: {
    title: "Everything you need in a link page",
    description:
      "Design once, update anytime, and keep every audience pointed to the right place.",
    items: [
      {
        title: "Unlimited links",
        description:
          "Stack products, socials, drops, and newsletters. Reorder in seconds with live preview.",
        icon: "links",
      },
      {
        title: "Brand-ready themes",
        description:
          "Match your look with custom colors, fonts, and profile art — no design degree required.",
        icon: "brand",
      },
      {
        title: "Click insights",
        description:
          "See which links convert so you can promote what actually works.",
        icon: "analytics",
      },
      {
        title: "Share anywhere",
        description:
          "One short URL for Instagram, TikTok, packaging QR codes, and email signatures.",
        icon: "share",
      },
    ],
  },
  howItWorks: {
    title: "Live in minutes",
    description: "From empty page to shareable link — without a website rebuild.",
    steps: [
      {
        number: "01",
        title: "Claim your handle",
        description: "Pick blueprint.link/you and set a profile photo plus short bio.",
      },
      {
        number: "02",
        title: "Add your links",
        description:
          "Drop in storefronts, socials, and campaigns. Group them with headers when you need structure.",
      },
      {
        number: "03",
        title: "Publish and share",
        description:
          "Copy your URL into every bio and QR. Update links anytime — the page stays the same.",
      },
    ],
  },
  cta: {
    title: "Put every link on one Blueprint.",
    description: "Start free. Upgrade when you need insights, custom domains, and scheduling.",
    button: { label: "Start building", href: "mailto:hello@blueprint.link" },
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Blueprint. All rights reserved.`,
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "GitHub", href: "https://github.com/garlobrian52/bitcoin" },
    ],
  },
  preview: {
    handle: "@studio",
    bio: "Drops, playlists, and the shop.",
    links: [
      { label: "Shop the drop", href: "#" },
      { label: "Listen now", href: "#" },
      { label: "Book a session", href: "#" },
    ],
  },
};
