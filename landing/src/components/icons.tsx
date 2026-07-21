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
        d="M8 22V10h6.2c2.6 0 4.2 1.4 4.2 3.5 0 1.4-.8 2.5-2.1 3L19 22h-3.1l-2.4-4.7H11V22H8Zm3-7.2h2.8c1.1 0 1.8-.5 1.8-1.4s-.7-1.4-1.8-1.4H11v2.8Z"
        fill="var(--paper)"
      />
      <circle cx="23.5" cy="11.5" r="2.5" fill="var(--accent)" />
    </svg>
  );
}

export function FeatureIcon({
  name,
  className = "h-6 w-6",
}: {
  name: "links" | "brand" | "analytics" | "share";
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
