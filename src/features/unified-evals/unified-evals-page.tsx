import { AppBar } from '@/components/patterns'
import type { BreadcrumbItem } from '@/components/patterns'
import { GetStartedSection } from './components'

const breadcrumbs: BreadcrumbItem[] = [
  { name: 'AI System', path: '/ai-systems' },
]

export function UnifiedEvalsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppBar
        variant="breadcrumb"
        breadcrumbs={breadcrumbs}
        currentSection={{ name: 'GPT 3.5 TURBO' }}
      />
      <main className="flex flex-1 flex-col items-center justify-start border rounded-lg shadow m-2 mb-0 bg-gray-0 pt-32">
        <GetStartedSection />
      </main>
    </div>
  )
}
