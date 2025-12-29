# Dev Notes

Succinct guide for working in this repo (React + TypeScript + Vite + Tailwind v3 + shadcn-style Radix wrappers). 

## Coding Playbook
- **Start with context**: read `src/App.tsx`, `src/main.tsx`, `src/index.css`, and the needed files in `src/components/ui`. Search with `grep` before editing to mirror existing patterns and props.
- **Reuse primitives first**: import from `@/components/ui` (Button/Input/Card/Tabs/Dialog/Sheet/Tooltip/Form/Toast/Chart/etc.) and the `cn` helper from `@/lib/utils`. Keep existing `data-slot`/`data-*` attributes when extending components.
- **Forms and validation**: use `react-hook-form` + `zod`. Wrap fields with `Form`, `FormField`, `FormItem`, `FormControl`, `FormLabel`, and `FormMessage` from `@/components/ui/form` so errors wire up automatically.
- **Data fetching/mutations**: use `@tanstack/react-query` hooks instead of raw `fetch` in components. Surface API errors via `sonner` toasts from `@/components/ui/sonner`.
- **Animation & motion**: prefer `framer-motion` for React animations, `gsap` for timelines, and `tw-animate-css` classes for lightweight effects. Keep transitions expressed via Tailwind utilities where possible.
- **Theming & layout**: CSS variables already expose light/dark tokens and `@custom-variant dark`; honor them with `dark:` classes rather than hard-coded colors. Do not modify the `@theme inline` block in `src/index.css`; it maps tokens for Tailwind. Place shared layout styles in Tailwind classes instead of inline styles.
- **Fonts & tokens**: Load fonts before Tailwind (add `@import url(...)`/`@font-face` above `@import "tailwindcss";`) so `font-sans`/`font-serif`/`font-mono` resolve instead of falling back. Use semantic classes (e.g., `bg-card`, `text-muted-foreground`, `rounded-lg`) backed by tokens; if you need new tokens, add them via a dedicated `@theme` block instead of editing the generated `@theme inline`.
- **Color variables**: Colors in `src/index.css` use `oklch()`. Components that accept CSS vars (inline styles/HTML attrs) can use `var(--chart-1)` directly; do not wrap with `hsl()`/`rgb()`. Recharts SVG props do **not** resolve CSS vars—pass a computed color string instead (e.g., read from `getComputedStyle(document.documentElement).getPropertyValue('--chart-1')` or hardcode the token value).
- **Files & imports**: use the `@/*` alias for source imports. Feature-specific components live in `src/components`; only add to `src/components/ui` when creating reusable primitives that match the existing shadcn patterns.
- **Public surface**: static assets go under `public/`; page metadata/OG tags live in `index.html`. Keep the Cloudflare worker API inside `worker/index.ts` and update `wrangler.jsonc` if you add bindings.
- **Verification**: run `npm run build` to keep type-check/builds green; skip `npm run lint` for now (known issues). Do not introduce new dependencies unless necessary.

## Stack & Key Dependencies
- Core: React 19, Vite 7, TypeScript.
- Styling: Tailwind CSS v3 + `tailwindcss-animate`; utilities `tailwind-merge`, `clsx`, `class-variance-authority`.
- UI: shadcn-style Radix wrappers (accordion/dialog/dropdown/select/tabs/tooltip/toast etc.), `lucide-react` icons, `vaul` for sheets/drawers, `next-themes` for theme toggling.
- Data/state: `@tanstack/react-query`.
- Forms/validation: `react-hook-form`, `@hookform/resolvers`, `zod`, `input-otp`.
- Dates & pickers: `date-fns`, `react-day-picker`.
- Content: `react-markdown`.
- Feedback/UX: `sonner` (toasts), `recharts` (charts).
- Maps: `react-map-gl` + `mapbox-gl` (Mapbox GL JS).
- Animations: `framer-motion`, `gsap`, plus `tw-animate-css`.
- Carousels: `embla-carousel` for sliders.
- APIs: `openai` client.
- Diagrams: `reactflow` for mind maps/workflows; theme with shadcn tokens (see below).

## Maps (react-map-gl)
1) `MAPBOX_API_TOKEN` is provided via system env; Vite exposes `MAPBOX_*` via `envPrefix`, so you can read it with `import.meta.env.MAPBOX_API_TOKEN` (no `.env` needed).
2) Import styles and render:
   ```tsx
   import 'mapbox-gl/dist/mapbox-gl.css'
   import { Map, NavigationControl } from 'react-map-gl/mapbox'

   <div className="h-[480px] w-full overflow-hidden rounded-xl">
     <Map
       mapboxAccessToken={import.meta.env.MAPBOX_API_TOKEN}
       initialViewState={{ longitude: 116.4, latitude: 39.9, zoom: 9 }}
       mapStyle="mapbox://styles/mapbox/light-v11"
     >
       <NavigationControl position="bottom-right" />
     </Map>
   </div>
   ```
   Ensure the container has explicit height/width; swap `mapStyle` for other Mapbox styles or your own tiles. Vite is configured to expose `MAPBOX_*` env vars via `envPrefix`.

## Project Structure
- `src/main.tsx`: App bootstrap with React StrictMode.
- `src/App.tsx`: Present Beyond marketing hero copy (simplified slogan page).
- `src/index.css`: Tailwind v3 setup, font stack, theme tokens, and base styles.
- `src/components/ui/`: shadcn-style wrappers for Radix (button, input, dialog, tabs, select, table, sheet, drawer, etc.) plus `sonner` wrapper and chart/progress helpers.
- `src/lib/utils.ts`: `cn` helper (`clsx` + `tailwind-merge`).
- `public/`: static assets served as-is.
- `index.html`: HTML shell; set product-level metadata (title/description/OG).
- Config: `vite.config.ts` (React plugin), `tsconfig.*`, `wrangler.jsonc`/`worker-configuration.d.ts` for Cloudflare deployment.

## Scripts
- `npm run dev` — start Vite dev server with HMR.
- `npm run build` — type-check (`tsc -b`) then build for production.
- `npm run deploy` — build then `wrangler deploy` to Cloudflare Workers.
- `npm run cf-typegen` — generate Cloudflare types.

## Development Workflow
1) Install deps: `npm install`.
2) Run locally: `npm run dev` (Vite defaults to http://localhost:5173).
3) Edit components in `src/components/ui` using Tailwind classes; share utilities via `src/lib/utils.ts`.
4) For animations, prefer `framer-motion` for React components and `gsap` for timelines; lightweight effects can use `tw-animate-css` classes.
5) Add new styles in `src/index.css` or component-level CSS; Tailwind v3 is imported via `@import "tailwindcss";` (no separate config file).

## React Flow + shadcn styling
- Import once where you render React Flow: `import 'reactflow/dist/style.css'; import './reactflow-theme.css';`
- Create `src/reactflow-theme.css` to map React Flow parts to theme vars, e.g.:
  ```css
  @layer components {
    .react-flow__node { @apply rounded-lg border border-border bg-card text-card-foreground shadow-sm; }
    .react-flow__node.selected { @apply border-primary ring-2 ring-primary/30; }
    .react-flow__handle { @apply h-2 w-2 rounded-full border border-primary/60 bg-primary; }
    .react-flow__edge-path { stroke: var(--border); }
    .react-flow__edge.selected .react-flow__edge-path { stroke: var(--primary); }
  }
  ```
- Nodes can also set `className` (e.g., `bg-card border-border`) and custom node components can use existing shadcn UI pieces.

## HTML & SEO
- Update `index.html` head tags for product SEO/preview. Example:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Present Beyond — Product Stories Without Slides</title>
  <meta name="description" content="Present Beyond turns product states into cohesive stories you can present in minutes." />
  <meta name="author" content="Present Beyond" />
  <meta property="og:title" content="Present Beyond — Product Stories Without Slides" />
  <meta property="og:description" content="Present Beyond turns product states into cohesive stories you can present in minutes." />
  <meta property="og:type" content="website" />
  ```
- Swap the default favicon (`/vite.svg`) with your own in `public/`.

## Deployment
- Ensure Cloudflare credentials are set; `wrangler.jsonc` controls environment.
- Before running `npm run deploy`:
  - Configure custom domain in `wrangler.jsonc` as `{PROJECT_NAME}.bespoker.ai`.
  - Verify all required production environment variables are set.
  - Run the deploy command and confirm it completes successfully.
- Deploy with `npm run deploy` (runs build first). For type updates against Cloudflare bindings, use `npm run cf-typegen`.

## Important Notes
- Existing UI components follow shadcn patterns; reuse them to keep styling consistent.
- Keep new code TypeScript-strict and Tailwind-first; prefer Radix primitives for accessibility.
