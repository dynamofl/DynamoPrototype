import { Plus } from 'lucide-react'
import { TeamMembersTable, TeamMemberFilter } from './components'
import { PageHeader } from '@/components/patterns/ui-patterns/page-header'
import type { TableRow } from '@/types/table'

export function TeamMembersContent() {
  // Handle cell actions
  const handleCellAction = (action: string, row: TableRow) => {
    console.log('Action:', action, 'Row:', row)
    // Handle manage user, resend invite, etc.
  }

  // Handle search
  const handleSearch = (value: string) => {
    console.log('Search:', value)
    // TODO: Implement search functionality
  }

  return (
    <div className="space-y-3 py-3">
      {/* Header */}
      <PageHeader
        title="Team Members"
        actions={[
          {
            icon: Plus,
            label: 'Add Members',
            onClick: () => console.log('Add Members clicked'),
            variant: 'default'
          }
        ]}
      />

      {/* Team Member Filter */}
      <TeamMemberFilter onSearch={handleSearch} />

      {/* Table Content */}
      <div className="px-4">
        <div className="overflow-hidden">
          <TeamMembersTable
            onCellAction={handleCellAction}
          />
        </div>
      </div>
    </div>
  )
}
