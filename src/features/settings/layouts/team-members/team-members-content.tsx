import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TeamMembersTable, TeamMemberFilter } from './components'
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
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-450 text-gray-900 tracking-tight">Team Members</h1>
          </div>
          <Button variant="default" size="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Members
          </Button>
        </div>
      </div>

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
