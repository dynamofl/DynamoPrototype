# Create V2 Feature

Step-by-step template for adding a new feature to V2.

## Steps

### 1. Create Feature Directory
```
src/v2/features/<feature-name>/
  <feature-name>-page.tsx
  components/
  types/
  lib/
  index.ts
```

### 2. Create Page Component
- File: `src/v2/features/<feature-name>/<feature-name>-page.tsx`
- Pages render directly inside `V2Shell` — no layout wrapper needed
- Use `usePageHeader()` to set the header title and actions:
```tsx
import { usePageHeader } from '@/v2/hooks/usePageHeader'

function MyPage() {
  const { setHeader } = usePageHeader()
  useEffect(() => {
    setHeader({ title: 'My Page', action: <Button>Action</Button> })
    return () => setHeader({ title: '' })
  }, [])
  return <div className="p-6">...</div>
}
```

### 3. Create Types
- File: `src/v2/features/<feature-name>/types/<type-name>.ts`
- Export interfaces for the feature's data models

### 4. Create Supabase Hook
- File: `src/v2/features/<feature-name>/lib/use<FeatureName>.ts`
- Import `supabase` from `@/lib/supabase/client`
- Follow the pattern in `src/v2/features/projects/lib/useProjects.ts`
- Include: loading state, error state, CRUD operations, refresh function

### 5. Create Components
- Place in `src/v2/features/<feature-name>/components/`
- Use shared UI from `@/components/ui/` (Dialog, Input, Button, etc.)
- Follow styling rules from v2-conventions skill

### 6. Create Barrel Export
- File: `src/v2/features/<feature-name>/index.ts`
- Export page components, hooks, and types

### 7. Register Route
- For project-level pages: add route in `src/v2/features/projects/project-detail-page.tsx`
- For top-level pages: add route in `src/v2/V2App.tsx`

### 8. Add Navigation (if applicable)
- For project-level pages: add nav item in `src/v2/features/projects/components/project-sidebar.tsx` (in `navSections`)

### 9. Database Migration (if needed)
- Create migration in `supabase/migrations/` with naming: `YYYYMMDD000001_description.sql`
- Enable RLS, add appropriate policies
