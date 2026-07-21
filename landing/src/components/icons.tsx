import type { Feature } from "@/content/site";

type IconProps = { className?: string };

export function LogoMark({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-[var(--ink)]" />
      <path
        d="M9 23V9h6.1c2.9 0 4.7 1.5 4.7 3.7 0 1.5-.8 2.7-2.1 3.3 1.7.5 2.8 1.9 2.8 3.7 0 2.4-1.9 4.3-5.1 4.3H9Zm3.1-8.2h2.6c1.3 0 2.1-.7 2.1-1.8s-.8-1.7-2.1-1.7h-2.6v3.5Zm0 5.7h3c1.5 0 2.4-.8 2.4-2s-.9-1.9-2.4-1.9h-3v3.9Z"
        fill="var(--paper)"
      />
      <circle cx="24" cy="10" r="2.4" fill="var(--accent)" />
    </svg>
  );
}

export function FeatureIcon({
  name,
  className = "h-6 w-6",
}: {
  name: Feature["icon"];
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "links":
      return (
        <svg {...common}>
          <path d="M9 12h6" />
          <path d="M10 8H7a4 4 0 0 0 0 8h3" />
          <path d="M14 8h3a4 4 0 0 1 0 8h-3" />
        </svg>
      );
    case "brand":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c1.5-3.2 3.8-4.8 7-4.8s5.5 1.6 7 4.8" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M22 19V8" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="M8.3 10.8 15.7 6.7" />
          <path d="M8.3 13.2 15.7 17.3" />
        </svg>
      );
  }
}
