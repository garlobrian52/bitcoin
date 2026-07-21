# Landing page

`landing/` is a standalone Next.js 16 application for the Blueprint marketing
page. The page is assembled from reusable sections, while its copy and links
come from one typed configuration file.

This application is independent of the Bitcoin Core CMake build. Run its
JavaScript install and validation commands separately.

## Local setup

Install Node.js and npm first. The repository does not currently pin a Node.js
version.

```bash
cd landing
npm ci
npm run dev
```

Open <http://localhost:3000>. The development server reloads the page when files
under `src/` change.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 by default. |
| `npm run lint` | Run ESLint with the Next.js Core Web Vitals and TypeScript rules. |
| `npm run build` | Create a production build and check TypeScript. |
| `npm run start` | Serve an existing production build; run `npm run build` first. |

There is no separate automated test command. Before submitting changes, run:

```bash
npm run lint
npm run build
```

## Architecture

| Path | Responsibility |
| --- | --- |
| `src/content/site.ts` | Defines the `SiteContent` interface and the page's copy, links, feature icons, and steps. |
| `src/app/page.tsx` | Sets the section order for the `/` route. |
| `src/app/layout.tsx` | Defines metadata, Geist fonts, global page classes, and the sticky-header scroll offset. |
| `src/components/*.tsx` | Renders the header, hero, features, workflow, call to action, footer, and SVG icons. |
| `src/app/globals.css` | Loads Tailwind CSS 4 and defines global theme values. |

The render flow is:

```text
src/content/site.ts
        |
        +--> src/app/layout.tsx (title and description)
        |
        +--> src/components/*.tsx
                       |
                       +--> src/app/page.tsx
```

The components read local configuration directly. There are no API routes,
environment variables, or runtime content requests in this application.

## Updating content

Edit `siteContent` in `src/content/site.ts` for normal copy and link changes.
Its `SiteContent` type groups the public configuration into:

- `brand` and `nav`
- `hero`, including the primary and secondary calls to action
- `features.items`
- `howItWorks.steps`
- `cta`
- `footer.links` and `footer.copyright`

For example, a feature must use one of the icon names allowed by the `Feature`
type:

```ts
{
  title: "Typed content",
  description: "Keep section content in one reviewed configuration.",
  icon: "layers",
}
```

The supported names are `sparkles`, `shield`, `zap`, and `layers`. To add
another icon, extend `Feature["icon"]` in `src/content/site.ts` and add the
matching case to `FeatureIcon` in `src/components/icons.tsx`.

References to Linear in the placeholder content describe a manual workflow:
copy approved requirements into `siteContent`. This repository does not contain
a Linear client or synchronization command.

## Adding or reordering sections

1. Add the section component under `src/components/`.
2. Extend `SiteContent` and `siteContent` if the section needs configurable
   content.
3. Import and position the component in `src/app/page.tsx`.
4. If navigation should link to it, give the section an `id` and add a matching
   `#id` value to `siteContent.nav`.

The existing anchors are `#features`, `#how-it-works`, and `#cta`. Keep link
fragments and section IDs synchronized. The `scroll-pt-*` classes in
`src/app/layout.tsx` prevent anchored sections from being hidden by the sticky
header.

The header button reuses `hero.primaryCta`; changing that entry affects both
the header and hero. Page metadata also comes from `brand` and
`hero.subheadline`. The footer year is evaluated during the production build,
so rebuild the application when publishing a new version.

## Troubleshooting

- If `npm run start` reports that no production build exists, run
  `npm run build` first.
- If an in-page link lands at the top or does not move, verify that its `href`
  exactly matches a rendered section `id`.
- If Bitcoin Core's CMake or test commands pass but landing-page changes fail,
  run the commands in this directory; the root build does not cover `landing/`.
- When changing framework APIs, consult the Next.js 16 documentation installed
  under `node_modules/next/dist/docs/`; older Next.js examples may use removed
  conventions.
