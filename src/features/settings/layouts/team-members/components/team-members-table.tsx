/**
 * Team Members table component using flat table structure
 */

import { useState, useEffect } from 'react'
import { Edit, Send } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import teamMembersData from '@/data/teamMembers.json'

interface TeamMember {
  id: string
  name: string
  email: string
  roles: string[]
  addedOn: string
  status: string
  avatar: string | null
}

interface TeamMembersTableProps {
  className?: string
  onCellAction?: (action: string, row: TeamMember) => void
}

export function TeamMembersTable({
  className = '',
  onCellAction
}: TeamMembersTableProps) {
  const [data, setData] = useState<TeamMember[]>([])

  useEffect(() => {
    // Load data from JSON
    setData(teamMembersData as TeamMember[])
  }, [])

  const getInitials = (name: string) => {
    if (name === 'Pending Member') return ''
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleAction = (action: string, member: TeamMember) => {
    onCellAction?.(action, member)
  }

  const renderRoleBadges = (roles: string[]) => {
    const maxVisible = 2
    const visibleRoles = roles.slice(0, maxVisible)
    const remainingCount = roles.length - maxVisible

    return (
      <div className="flex items-center gap-1.5">
        {visibleRoles.map((role, index) => (
          <Badge
            key={index}
            variant="default"
            className="text-xs font-normal truncate"
          >
            {role}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs font-normal">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    )
  }

  const renderStatus = (status: string) => {
    const isOnboarded = status === 'Onboarded'
    return (
      <Badge
        variant={isOnboarded ? 'default' : 'secondary'}
        className={
          isOnboarded
            ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-100'
            : ''
        }
      >
        {status}
      </Badge>
    )
  }

  return (
    <div className={className}>
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-450 w-[280px]">Name</TableHead>
              <TableHead className="font-450 w-[280px]">Email Address</TableHead>
              <TableHead className="font-450">Role</TableHead>
              <TableHead className="font-450 w-[160px]">Added On</TableHead>
              <TableHead className="font-450 w-[180px]">Status</TableHead>
              <TableHead className="w-[180px] font-450"></TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {data.map((member) => (
            <TableRow
              key={member.id}
              className="group transition-colors hover:bg-gray-50"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-450 text-gray-600">
                      {getInitials(member.name)}
                    </span>
                  </div>
                  <span className="text-[13px] font-450 text-gray-900">
                    {member.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-gray-900">
                  {member.email}
                </span>
              </TableCell>
              <TableCell>
                {renderRoleBadges(member.roles)}
              </TableCell>
              <TableCell>
                <span className="text-[13px] text-gray-900">
                  {formatDate(member.addedOn)}
                </span>
              </TableCell>
              <TableCell>
                {renderStatus(member.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end">
                  {member.status === 'Onboarded' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('manage', member)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      <Edit className="h-3.5 w-3.5 mr-2" />
                      Manage User
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction('resend', member)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Send className="h-3.5 w-3.5 mr-2" />
                      Resend Invite
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No team members found.
          </div>
        )}
      </div>
    </div>
  )
}