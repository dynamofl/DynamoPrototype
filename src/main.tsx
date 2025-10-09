import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/patterns/theme-provider'
import '@/lib/supabase/migrate-to-supabase' // Make migration functions globally available
import '@/lib/supabase/test-secure-keys' // Make test functions globally available
import '@/lib/supabase/migrate-keys-to-vault' // Make key migration functions globally available
import '@/lib/supabase/quick-migrate' // Quick migration helper
import '@/lib/migrations/migrate-ai-systems-to-uuid' // Migrate AI system IDs to UUID
import '@/lib/supabase/fix-invalid-uuids' // Fix invalid UUIDs in Supabase

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="dynamo-ui-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
