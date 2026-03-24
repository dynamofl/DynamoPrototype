# V2 Conventions

## Source Tree
V2 code lives in `src/v2/` with this structure:
- `src/v2/V2App.tsx` — Root component with `<Routes>`, wrapped in `V2Shell`
- `src/v2/layouts/v2-shell.tsx` — Persistent shell with sidebar + main content card
- `src/v2/components/` — Shared V2 components (profile-dropdown)
- `src/v2/features/` — Feature modules (same pattern as v1's `src/features/`)
- `src/v2/hooks/` — Shared hooks (useVersionToggle, usePageHeader)

## Feature Folder Pattern
Each feature in `src/v2/features/<name>/` follows:
```
<name>/
  <name>-page.tsx      — Page component
  components/          — Feature-specific components
  types/               — TypeScript types
  lib/                 — Hooks, utilities, state managers
  constants/           — Constants (if needed)
  index.ts             — Barrel exports
```

## Shell Architecture (`v2-shell.tsx`)
Single persistent shell that never unmounts. All layout transitions handled here.
```
V2Shell (permanent)
├── motion.aside [sidebar — always in DOM, width animates 0 ↔ 224px]
│   └── ProjectSidebar (with logo, project selector, nav)
└── main [content area]
    ├── header [logo fades out when sidebar shows, page title fades in, profile always right]
    └── content [AnimatePresence for page transitions]
```
- **Sidebar**: Always in DOM, `motion.aside` animates width. Contains Dynamo logo, project selector, grouped nav.
- **Header**: Persistent bar with logo (projects list) or page title (project detail) + profile dropdown.
- **Page title**: Set via `usePageHeader()` context from child pages.
- **Content**: `AnimatePresence mode="wait"` for page content fade transitions only.
- **No mount/unmount** for layout elements — only `animate` prop changes.

## Routing
- All V2 routes are prefixed with `/v2/`
- Routes: `/v2/projects` (list), `/v2/projects/:projectId/*` (detail with sub-routes)
- Routes defined in `src/v2/V2App.tsx`, rendered inside `V2Shell`
- V1↔V2 toggle: profile dropdown, sets `dynamo-version-preference` in localStorage
- `SmartRedirect` at `/` reads the preference

## Page Header Context
Pages set their header title/actions via `usePageHeader()` hook:
```tsx
const { setHeader } = usePageHeader()
useEffect(() => {
  setHeader({ title: 'Evaluations', action: <Button>New Evaluation</Button> })
  return () => setHeader({ title: '' })
}, [])
```

## Shared Imports (Never Duplicate)
- UI primitives: `@/components/ui/` (dialog, button, input, label, textarea, card, etc.)
- Patterns: `@/components/patterns/` (page-header, create-dialog, breadcrumb, etc.)
- Supabase client: `@/lib/supabase/client`
- Utils: `@/lib/utils` (cn helper)
- Icons: `@/assets/icons/`
- Theme: `@/components/patterns/theme-provider`
- Profile: `@/v2/components/profile-dropdown`

## Styling Rules
- Tailwind CSS only
- Colors: only gray, red, green, amber
- No `bg-white` — use `bg-gray-0` instead
- Title case for headings, titles, labels
- Text sizes: `text-[0.8125rem]` for body text, `font-450` or `font-[550]` for weights
- Use existing component variants/sizes rather than custom styles
- Transition durations: use CSS variables (see transition-durations skill)

## Database
- Same Supabase instance as v1
- Import client from `@/lib/supabase/client`
- Migrations go in `supabase/migrations/`
- V2-specific tables: `projects` (and more to come)
