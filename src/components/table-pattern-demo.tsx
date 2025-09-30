/**
 * Demo component showcasing the new table pattern system
 */

import React, { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TablePattern } from '@/components/patterns'
import { 
  AIProvidersTableStorage,
  aiProvidersStorageConfig,
  aiProvidersColumns,
  aiProvidersExpandableConfig,
  aiProvidersPaginationConfig
} from '@/features/ai-providers/lib'
import type { TableColumn } from '@/types/table'
import { ModelsListSlot } from '@/components/patterns/slot'
import { GuardrailsTable } from '@/features/guardrails/components/guardrails-table'
import { EvaluationTable } from '@/features/evaluation/components/evaluation-table'

export function TablePatternDemo() {
  const [activeTab, setActiveTab] = useState('ai-providers-view')
  
  // Create custom storage instance for AI providers
  const aiProvidersStorage = useMemo(() => {
    return new AIProvidersTableStorage(aiProvidersStorageConfig)
  }, [])
  
  // Editable columns for AI providers
  const editableAIProvidersColumns: TableColumn[] = useMemo(() => [
    {
      key: 'expand',
      title: '',
      width: '40px',
      type: 'expand',
      expandIcon: undefined,
      collapseIcon: undefined
    },
    {
      key: 'name',
      title: 'Provider',
      width: '200px',
      type: 'freeText',
      placeholder: 'Enter provider name',
      editMode: 'inline',
      validation: (value) => value && value.trim().length > 0
    },
    {
      key: 'type',
      title: 'Type',
      width: '120px',
      type: 'dropdown',
      options: [
        { value: 'openai', label: 'OpenAI' },
        { value: 'anthropic', label: 'Anthropic' },
        { value: 'google', label: 'Google' },
        { value: 'azure', label: 'Azure' },
        { value: 'aws', label: 'AWS' },
        { value: 'local', label: 'Local' }
      ],
      editMode: 'inline'
    },
    {
      key: 'status',
      title: 'Status',
      width: '120px',
      type: 'dropdown',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'testing', label: 'Testing' }
      ],
      editMode: 'inline'
    },
    {
      key: 'apiKey',
      title: 'API Key',
      width: '200px',
      type: 'freeText',
      placeholder: 'Enter API key',
      editMode: 'dialog',
      validation: (value) => value && value.trim().length > 0
    },
    {
      key: 'models',
      title: 'Models',
      width: '100px',
      type: 'badge',
      format: (value) => Array.isArray(value) ? `${value.length} models` : '0 models'
    },
    {
      key: 'modelsLastFetched',
      title: 'Last Updated',
      width: '140px',
      type: 'date',
      format: (value) => value || 'Never'
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      type: 'button',
      buttonVariant: 'ghost',
      actions: [
        {
          key: 'view',
          label: 'View',
          icon: '👁️',
          variant: 'outline'
        },
        {
          key: 'edit',
          label: 'Edit',
          icon: '✏️',
          variant: 'outline'
        },
        {
          key: 'fetch',
          label: 'Fetch Models',
          icon: '🔄',
          variant: 'outline'
        },
        {
          key: 'delete',
          label: 'Delete',
          icon: '🗑️',
          variant: 'destructive'
        }
      ]
    }
  ], [])
  
  // Custom expandable content renderer for AI providers
  const renderAIProvidersExpandableContent = (row: any) => {
    const models = row.models || []
    
    return (
      <ModelsListSlot
        models={models}
        lastFetched={row.modelsLastFetched}
        emptyMessage="No text models fetched yet"
      />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Table Pattern System Demo</h1>
        <p className="text-gray-600">
          Showcasing the new reusable table pattern with storage, pagination, expandable rows, and inline editing
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Badge variant="outline">View Mode</Badge>
          <Badge variant="outline">Edit Mode</Badge>
          <Badge variant="outline">Inline Editing</Badge>
          <Badge variant="outline">Dialog Editing</Badge>
          <Badge variant="outline">Validation</Badge>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage System</CardTitle>
            <CardDescription>
              Flexible storage with session, persistent, and secure options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline">Session Storage</Badge>
              <Badge variant="outline">Persistent Storage</Badge>
              <Badge variant="outline">Secure Storage</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cell Types</CardTitle>
            <CardDescription>
              Rich cell types for different data and interaction patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline">Free Text</Badge>
              <Badge variant="outline">Dropdown</Badge>
              <Badge variant="outline">Switch</Badge>
              <Badge variant="outline">Button</Badge>
              <Badge variant="outline">Badge</Badge>
              <Badge variant="outline">Date</Badge>
              <Badge variant="outline">Icon</Badge>
              <Badge variant="outline">Expand</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Advanced Features</CardTitle>
            <CardDescription>
              Pagination, expandable rows, and validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline">Pagination</Badge>
              <Badge variant="outline">Expandable Rows</Badge>
              <Badge variant="outline">Data Validation</Badge>
              <Badge variant="outline">Auto-save</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Examples */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-providers-view">AI Providers (View)</TabsTrigger>
          <TabsTrigger value="ai-providers-edit">AI Providers (Edit)</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-providers-view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Providers Table (View Mode)</CardTitle>
              <CardDescription>
                View mode with expandable rows showing model details. Uses secure storage for API keys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TablePattern
                mode="view"
                columns={aiProvidersColumns}
                storageConfig={aiProvidersStorageConfig}
                customStorage={aiProvidersStorage}
                pagination={aiProvidersPaginationConfig}
                expandable={{
                  ...aiProvidersExpandableConfig,
                  renderContent: renderAIProvidersExpandableContent
                }}
                onDataChange={(data) => console.log('Data changed:', data.length)}
                onCellAction={(action, row) => console.log('Action:', action, row)}
                onRowExpand={(rowId, expanded) => console.log('Expand:', rowId, expanded)}
                className="border rounded-lg"
                emptyMessage="No AI providers configured. Add your first provider to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-providers-edit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Providers Table (Edit Mode)</CardTitle>
              <CardDescription>
                Edit mode with inline editing for provider name, type, and status. API key editing opens in a dialog for security.
                <br />
                <strong>Try it:</strong> Click on any cell in the Provider, Type, or Status columns to edit inline. Click on API Key to edit in a dialog.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TablePattern
                mode="edit"
                columns={editableAIProvidersColumns}
                storageConfig={aiProvidersStorageConfig}
                customStorage={aiProvidersStorage}
                pagination={aiProvidersPaginationConfig}
                expandable={{
                  ...aiProvidersExpandableConfig,
                  renderContent: renderAIProvidersExpandableContent
                }}
                defaultEditMode="inline"
                rowEditDialogTitle="Edit AI Provider"
                rowEditDialogDescription="Update the provider configuration below"
                onDataChange={(data) => console.log('Data changed:', data.length)}
                onCellAction={(action, row) => console.log('Action:', action, row)}
                onRowExpand={(rowId, expanded) => console.log('Expand:', rowId, expanded)}
                onRowEdit={(row, index) => console.log('Edit row:', row, index)}
                className="border rounded-lg"
                emptyMessage="No AI providers configured. Add your first provider to get started."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardrails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guardrails Table</CardTitle>
              <CardDescription>
                Mixed editing modes: Dialog editing for name/description/category, inline editing for status. Uses persistent storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GuardrailsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Table</CardTitle>
              <CardDescription>
                Mixed editing modes: Both inline and dialog editing for prompts, dialog for topics, inline for status. Uses session storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvaluationTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
          <CardDescription>
            Key features and benefits of the new table pattern system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Storage System</h4>
              <ul className="text-[13px] text-gray-600 space-y-1">
                <li>• Session storage for temporary data</li>
                <li>• Persistent storage for regular data</li>
                <li>• Secure storage for sensitive data</li>
                <li>• Auto-save and validation support</li>
              </ul>
            </div>
               <div>
                 <h4 className="font-semibold mb-2">Cell Types & Editing Modes</h4>
                 <ul className="text-[13px] text-gray-600 space-y-1">
                   <li>• Free text with multiline support</li>
                   <li>• Dropdown with custom options</li>
                   <li>• Switch for boolean values</li>
                   <li>• Button for actions</li>
                   <li>• Badge for status display</li>
                   <li>• Date picker for dates</li>
                   <li>• Icon display with text</li>
                   <li>• Expand for nested content</li>
                   <li>• <strong>Inline editing</strong> for quick changes</li>
                   <li>• <strong>Dialog editing</strong> for complex forms</li>
                   <li>• <strong>Mixed modes</strong> per column</li>
                 </ul>
               </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced Features</h4>
              <ul className="text-[13px] text-gray-600 space-y-1">
                <li>• Pagination with customizable page sizes</li>
                <li>• Expandable rows with custom content</li>
                <li>• Data validation and error handling</li>
                <li>• Keyboard navigation support</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Configuration</h4>
              <ul className="text-[13px] text-gray-600 space-y-1">
                <li>• Type-safe configuration system</li>
                <li>• Reusable column definitions</li>
                <li>• Flexible storage options</li>
                <li>• Easy to extend and customize</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
