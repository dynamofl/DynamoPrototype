export interface Dataset {
  id: string
  name: string
  description: string
  format: 'CSV' | 'JSON' | 'JSONL' | 'Parquet' | 'TSV'
  size: string
  rowCount: number
  status: 'active' | 'archived'
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface DatasetsFilterState {
  status: string[]
  format: string[]
  searchTerm: string
}
