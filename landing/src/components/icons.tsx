import type { Feature } from "@/content/site";

type IconProps = {
  className?: string;
};

export function FeatureIcon({
  name,
  className = "h-5 w-5",
}: {
  name: Feature["icon"];
  className?: string;
}) {
  switch (name) {
    case "sparkles":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l1.2 4.2L17.5 8.5 13.2 9.7 12 14l-1.2-4.3L6.5 8.5l4.3-1.3L12 3zM5 14l.8 2.8L8.8 18l-3 1.2L5 22l-.8-2.8L1.2 18l3-1.2L5 14zm14 0l.8 2.8 3 1.2-3 1.2-.8 2.8-.8-2.8-3-1.2 3-1.2.8-2.8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "zap":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "layers":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l9 5-9 5-9-5 9-5zm0 8l9 5-9 5-9-5 9-5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function LogoMark({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="24" height="24" rx="8" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M10 20V12h4.2c2.2 0 3.6 1.2 3.6 3.1 0 1.9-1.4 3.1-3.6 3.1H13v1.8h-3zm3-3.2h1.1c1 0 1.5-.5 1.5-1.3 0-.8-.5-1.3-1.5-1.3H13v2.6zM18.2 20l3.3-8h3.2l-4.8 11.2h-3.1L18.2 20z"
        fill="currentColor"
      />
    </svg>
  );
}
