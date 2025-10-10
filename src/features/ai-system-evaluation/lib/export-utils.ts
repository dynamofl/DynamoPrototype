import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test'

/**
 * Format duration in milliseconds to MM:SS string
 */
function formatDuration(startedAt?: string, completedAt?: string): string {
  if (!startedAt || !completedAt) {
    return '-'
  }

  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()
  const durationMs = end - start
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Format date to readable string
 */
function formatDate(dateString?: string): string {
  if (!dateString) {
    return '-'
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get category label from test type
 */
function getCategoryLabel(test: EvaluationTest): string {
  const category = test.type || 'jailbreak'
  return category === 'compliance' ? 'Compliance' : 'Jailbreak'
}

/**
 * Get status label
 */
function getStatusLabel(test: EvaluationTest): string {
  const statusLabels: Record<string, string> = {
    completed: 'Completed',
    running: 'Running',
    failed: 'Failed',
    pending: 'Pending'
  }
  return statusLabels[test.status] || test.status
}

/**
 * Export evaluations to CSV format
 */
export function exportEvaluationsToCSV(
  evaluations: EvaluationTest[],
  filename?: string
): void {
  // Define CSV headers
  const headers = [
    'Name',
    'Category',
    'Status',
    'Test Runtime',
    'Created At',
    'Started At',
    'Completed At'
  ]

  // Convert evaluations to CSV rows
  const rows = evaluations.map((test) => {
    return [
      test.name,
      getCategoryLabel(test),
      getStatusLabel(test),
      formatDuration(test.startedAt, test.completedAt),
      formatDate(test.createdAt),
      formatDate(test.startedAt),
      formatDate(test.completedAt)
    ]
  })

  // Build CSV content
  const csvContent = [
    headers.map(cell => `"${cell}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `evaluations-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
