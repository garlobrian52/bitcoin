# Landing page foundation

Next.js App Router landing page scaffold for the Blueprint workspace.

## Status

Linear MCP authentication is required in Cursor Desktop before project-specific copy, visuals, and acceptance criteria can be synced. Until then, placeholder content lives in `src/content/site.ts`.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4

## Develop

```bash
cd landing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
cd landing
npm run build
```

## Content sync

1. Authenticate the Linear MCP server in Cursor Desktop.
2. Pull issues / docs from the Linear project.
3. Update `src/content/site.ts` (and extend section components as needed).
