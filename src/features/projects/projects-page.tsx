import { Construction } from 'lucide-react'

export function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between my-4">
              <h1 className="text-lg font-450 tracking-tight">Projects</h1>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Construction className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold tracking-tight">
                  Projects Page Under Construction
                </h3>
                <p className="text-muted-foreground max-w-[420px]">
                  We're working hard to bring you an amazing projects experience. 
                  This feature will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}