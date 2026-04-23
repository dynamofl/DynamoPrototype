/**
 * PolicyViewSheet component for viewing policy details
 */

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'

export interface PolicyViewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: TableRow | null
  onEdit?: (policy: TableRow) => void
}

export function PolicyViewSheet({
  open,
  onOpenChange,
  policy,
  onEdit
}: PolicyViewSheetProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'draft':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Draft</Badge>
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const handleEdit = () => {
    if (policy && onEdit) {
      onEdit(policy)
      onOpenChange(false)
    }
  }

  if (!policy) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Policy Details"
      size="lg"
      footer={
        onEdit && (
          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              className="flex-1"
            >
              Edit Policy
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        <div className='space-y-2'>
          <p className='font-lg'>{policy.name}</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="default">{policy.category}</Badge>
            <Badge variant="default">{policy.type}</Badge>
            {getStatusBadge(policy.status)}
            {policy.version && (
              <Badge variant="outline">v{policy.version}</Badge>
            )}
            {policy.updatedAt && policy.updatedAt !== policy.createdAt && (
              <Badge variant="default">Last Updated On: {policy.updatedAt}</Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[0.8125rem] font-450 text-gray-600">Description</Label>
          <p className="text-[0.8125rem] text-gray-900 whitespace-pre-wrap">{policy.description || 'No description provided'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[0.8125rem] font-450 text-gray-600">Owner</Label>
            <p className="text-[0.8125rem] text-gray-900">{policy.owner || '-'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-[0.8125rem] font-450 text-gray-600">Effective Date</Label>
            <p className="text-[0.8125rem] text-gray-900">
              {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[0.8125rem] font-450 text-gray-600">Policy Rules</Label>
          <div className="p-3 rounded-md border border-gray-200">
            {policy.content ? (
              <div className="text-[0.8125rem] text-gray-900 whitespace-pre-wrap">
                {policy.content}
              </div>
            ) : (
              <p className="text-[0.8125rem] text-gray-500">No policy rules defined</p>
            )}
          </div>
        </div>
      </div>
    </ViewEditSheet>
  )
}
