/**
 * AI Systems page component
 * Main page that integrates all AI Systems components
 */

// import React from 'react'
import { AISystemsTable } from './components'

export function AISystemsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Page Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Systems</h2>
          <p className="text-muted-foreground">
            Manage your AI systems and their configurations
          </p>
        </div>
      </div>

      {/* AI Systems Table */}
      <AISystemsTable />
    </div>
  )
}
