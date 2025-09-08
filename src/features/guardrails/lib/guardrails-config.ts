/**
 * Guardrails table configuration
 */

import type { TableColumn, TableStorageConfig } from '@/types/table'

// Storage configuration for guardrails
export const guardrailsStorageConfig: TableStorageConfig = {
  type: 'persistent',
  storageKey: 'guardrails',
  autoSave: true,
  idGenerator: 'timestamp',
  transform: {
    onSave: (data) => data.map(row => ({
      ...row,
      updatedAt: new Date().toISOString().split('T')[0]
    })),
    onLoad: (data) => data || []
  }
}

// Column definitions for guardrails table
export const guardrailsColumns: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    width: 'w-48',
    type: 'freeText',
    placeholder: 'Enter guardrail name...',
    validation: (value) => value && value.trim().length > 0,
    editMode: 'dialog',
    rowEditTrigger: true,
    rowEditLabel: 'Edit Guardrail',
    rowEditIcon: '✏️'
  },
  {
    key: 'description',
    title: 'Description',
    width: 'w-64',
    type: 'freeText',
    placeholder: 'Enter description...',
    multiline: true,
    editMode: 'dialog'
  },
  {
    key: 'category',
    title: 'Category',
    width: 'w-32',
    type: 'dropdown',
    options: [
      { value: 'Safety', label: 'Safety' },
      { value: 'Privacy', label: 'Privacy' },
      { value: 'Compliance', label: 'Compliance' },
      { value: 'Quality', label: 'Quality' },
      { value: 'Security', label: 'Security' },
      { value: 'Ethics', label: 'Ethics' }
    ],
    placeholder: 'Select category...',
    editMode: 'dialog'
  },
  {
    key: 'status',
    title: 'Status',
    width: 'w-24',
    type: 'switch',
    switchLabel: (value) => value ? 'Active' : 'Inactive',
    editMode: 'inline'
  },
  {
    key: 'createdAt',
    title: 'Created',
    width: 'w-28',
    type: 'date',
    format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
  },
  {
    key: 'actions',
    title: 'Actions',
    width: 'w-28',
    type: 'button',
    buttonVariant: 'ghost'
  }
]

// Pagination configuration for guardrails
export const guardrailsPaginationConfig = {
  enabled: true,
  itemsPerPage: 15,
  showPageInfo: true,
  showPageSizeSelector: true,
  pageSizeOptions: [10, 15, 25, 50]
}

// Default guardrail data structure
export const createDefaultGuardrail = () => ({
  id: Date.now().toString(),
  name: '',
  description: '',
  content: '',
  category: 'Safety',
  status: 'active',
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0]
})

// Validation function for guardrails
export const validateGuardrail = (guardrail: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!guardrail.name || guardrail.name.trim() === '') {
    errors.push('Guardrail name is required')
  }
  
  if (!guardrail.description || guardrail.description.trim() === '') {
    errors.push('Description is required')
  }
  
  if (!guardrail.content || guardrail.content.trim() === '') {
    errors.push('Content is required')
  }
  
  if (!guardrail.category || guardrail.category.trim() === '') {
    errors.push('Category is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Category color mapping for badges
export const guardrailCategoryColors = {
  Safety: { variant: 'default' as const, className: 'bg-red-100 text-red-800 border-red-200' },
  Privacy: { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  Compliance: { variant: 'outline' as const, className: 'bg-purple-100 text-purple-800 border-purple-200' },
  Quality: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
  Security: { variant: 'destructive' as const, className: 'bg-orange-100 text-orange-800 border-orange-200' },
  Ethics: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-200' }
}

// Status color mapping for badges
export const guardrailStatusColors = {
  active: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
  inactive: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' }
}
