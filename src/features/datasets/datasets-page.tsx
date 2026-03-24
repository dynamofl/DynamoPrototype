import { useState } from 'react'
import { DatasetsHeader, DatasetsTableDirect } from './components'
import type { Dataset } from './types'

const MOCK_DATASETS: Dataset[] = [
  {
    id: '1',
    name: 'Customer Support Conversations',
    description: 'Labeled conversations from customer support channels for tone and resolution analysis.',
    format: 'JSONL',
    size: '128 MB',
    rowCount: 52400,
    status: 'active',
    tags: ['support', 'labeled', 'production'],
    createdAt: '2025-10-12',
    updatedAt: '2025-12-01',
  },
  {
    id: '2',
    name: 'Safety Red-Team Prompts',
    description: 'Adversarial prompts used for safety evaluation and red-teaming exercises.',
    format: 'CSV',
    size: '4.2 MB',
    rowCount: 8750,
    status: 'active',
    tags: ['safety', 'red-team', 'evaluation'],
    createdAt: '2025-09-03',
    updatedAt: '2025-11-20',
  },
  {
    id: '3',
    name: 'Product Q&A Benchmark',
    description: 'Curated product-related questions with ground-truth answers for accuracy benchmarking.',
    format: 'JSON',
    size: '22 MB',
    rowCount: 15200,
    status: 'active',
    tags: ['benchmark', 'qa', 'product'],
    createdAt: '2025-08-18',
    updatedAt: '2025-10-05',
  },
  {
    id: '4',
    name: 'Hallucination Test Suite',
    description: 'Prompts specifically designed to elicit and measure hallucination in LLM responses.',
    format: 'JSONL',
    size: '9.8 MB',
    rowCount: 3300,
    status: 'active',
    tags: ['hallucination', 'evaluation', 'research'],
    createdAt: '2025-11-01',
    updatedAt: '2026-01-15',
  },
  {
    id: '5',
    name: 'Legacy Chat Logs v1',
    description: 'Archived chat logs from the previous platform version. Used for historical comparisons.',
    format: 'CSV',
    size: '340 MB',
    rowCount: 210000,
    status: 'archived',
    tags: ['legacy', 'chat', 'archived'],
    createdAt: '2024-04-22',
    updatedAt: '2024-12-31',
  },
  {
    id: '6',
    name: 'Multilingual Evaluation Set',
    description: 'Prompts and responses in 12 languages for multilingual model performance evaluation.',
    format: 'Parquet',
    size: '67 MB',
    rowCount: 28900,
    status: 'active',
    tags: ['multilingual', 'evaluation', 'i18n'],
    createdAt: '2025-07-14',
    updatedAt: '2026-02-10',
  },
  {
    id: '7',
    name: 'Toxicity Classification Dataset',
    description: 'Human-labeled samples for training and evaluating toxicity detection models.',
    format: 'TSV',
    size: '18 MB',
    rowCount: 44600,
    status: 'active',
    tags: ['toxicity', 'classification', 'labeled'],
    createdAt: '2025-05-30',
    updatedAt: '2025-09-22',
  },
  {
    id: '8',
    name: 'Code Generation Benchmark',
    description: 'Programming problems with expected outputs for evaluating code generation quality.',
    format: 'JSON',
    size: '11 MB',
    rowCount: 6800,
    status: 'archived',
    tags: ['code', 'benchmark', 'generation'],
    createdAt: '2025-03-07',
    updatedAt: '2025-08-01',
  },
]

export function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const handleAddDataset = () => {
    // Placeholder — add dataset dialog/sheet can be wired up here
    console.log('Add dataset clicked')
  }

  const handleEdit = (dataset: Dataset) => {
    console.log('Edit dataset:', dataset.name)
  }

  const handleDelete = (dataset: Dataset) => {
    if (confirm(`Are you sure you want to delete "${dataset.name}"?`)) {
      setDatasets((prev) => prev.filter((d) => d.id !== dataset.id))
    }
  }

  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows((prev) =>
      selected ? [...prev, id] : prev.filter((rowId) => rowId !== id)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? datasets.map((d) => d.id) : [])
  }

  return (
    <div className="">
      <main className="mx-auto">
        <div className="space-y-3 py-3">
          {/* Page Header */}
          <DatasetsHeader onAddDataset={handleAddDataset} />

          {/* Table */}
          <div className="">
            <DatasetsTableDirect
              data={datasets}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
