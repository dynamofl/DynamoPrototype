import { Button } from '@/components/ui/button'
import { TablePattern, TableActions } from '@/components/patterns'
import { Plus, Edit, Send } from 'lucide-react'
import teamMembersData from '@/data/teamMembers.json'

export function TeamMembersContent() {
  // Define table columns based on Figma design
  const columns = [
    {
      key: 'name',
      title: 'Name',
      type: 'avatar' as const,
      width: '280px',
      getDisplayName: (_value: any, row: any) => row.name,
      getInitials: (_value: any, row: any) => {
        if (row.name === 'Pending Member') return ''
        const words = row.name.trim().split(/\s+/)
        if (words.length === 1) {
          return words[0].substring(0, 2).toUpperCase()
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase()
      }
    },
    {
      key: 'email',
      title: 'Email Address',
      type: 'freeText' as const,
      width: '280px',
      readonly: true
    },
    {
      key: 'roles',
      title: 'Role',
      type: 'multiBadge' as const,
      width: 'fit',
      maxVisible: 2,
      showOverflowCount: true,
      overflowLabel: '+{count} more',
      getBadges: (_value: any, row: any) => {
        return row.roles.map((role: string) => ({
          label: role,
          variant: 'default' as const
        }))
      }
    },
    {
      key: 'addedOn',
      title: 'Added On',
      type: 'date' as const,
      width: '160px',
      readonly: true
    },
    {
      key: 'status',
      title: 'Status',
      type: 'badge' as const,
      width: 'auto',
      minWidth: '180px',
      readonly: true,
      colorMap: {
        'onboarded': { variant: 'success' as const, className: 'bg-green-100 text-green-700 border border-green-200' },
        'pending onboarding': { variant: 'secondary' as const, className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' }
      }
    },
    {
      key: 'actions',
      title: '',
      type: 'multiButton' as const,
      width: '180px',
      buttonConfig: {
        getActions: (row: any) => {
          const actions = []
          
          if (row.status === 'Onboarded') {
            actions.push({
              key: 'manage',
              label: 'Manage User',
              icon: <Edit className="h-3.5 w-3.5" />,
              variant: 'outline' as const,
              className: 'border-gray-200 text-gray-600 hover:bg-gray-50'
            })
          } else if (row.status === 'Pending Onboarding') {
            actions.push({
              key: 'resend',
              label: 'Resend Invite',
              icon: <Send className="h-3.5 w-3.5" />,
              variant: 'outline' as const,
              className: 'border-blue-200 text-blue-600 hover:bg-blue-50'
            })
          }
          
          return actions
        }
      }
    }
  ]

  // Storage configuration
  const storageConfig = {
    type: 'static' as const,
    data: teamMembersData,
    autoSave: false
  }

  // Handle cell actions
  const handleCellAction = (action: string, row: any) => {
    console.log('Action:', action, 'Row:', row)
    // Handle manage user, resend invite, etc.
  }

  // Handle table actions
  const handleSearch = (value: string) => {
    console.log('Search:', value)
    // TODO: Implement search functionality
  }

  const handleFilter = () => {
    console.log('Filter clicked')
    // TODO: Implement filter functionality
  }

  const handleEditColumns = () => {
    console.log('Edit columns clicked')
    // TODO: Implement column management
  }

  const handleExport = () => {
    console.log('Export clicked')
    // TODO: Implement export functionality
  }

  return (
    <>
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-450 text-gray-900 tracking-tight">Team Members</h1>
            {/* <p className="text-[13px] text-gray-600 mt-1">
              View and update your team members and their access across the product.
            </p> */}
          </div>
          <Button variant="default" size="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Members
          </Button>
        </div>
      </div>

      <div className="space-y-2 py-4">

      {/* Table Actions */}
      <TableActions
        searchPlaceholder="Search Members..."
        onSearch={handleSearch}
        onFilter={handleFilter}
        onEditColumns={handleEditColumns}
        onExport={handleExport}
      />

      {/* Table Content */}
      <div className="flex-1 px-3 py-2">
        <div className="bg-white overflow-hidden">
          <TablePattern
            mode="view"
            columns={columns}
            storageConfig={storageConfig}
            onCellAction={handleCellAction}
            className="border-0"
            showHeader={true}
            stickyHeader={true}
          />
        </div>
      </div>
      </div>
    </>
  )
}
