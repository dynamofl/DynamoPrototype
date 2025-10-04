import type { TableColumn } from '@/types/table';
import type { EvaluationTestSummary } from '../types/evaluation-test';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const EVALUATION_HISTORY_COLUMNS: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    type: 'freeText',
    width: '300px',
    placeholder: 'Enter test name',
  },
  {
    key: 'category',
    title: 'Category',
    type: 'freeText',
    width: '180px',
    format: (value: any, row: any) => {
      // Use candidate model as category
      return row.candidateModel || 'N/A';
    }
  },
  {
    key: 'status',
    title: 'Status',
    type: 'badge',
    width: '220px',
    colorMap: {
      completed: {
        variant: 'default',
        className: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />
      },
      in_progress: {
        variant: 'secondary',
        className: 'bg-amber-100 text-amber-800',
        icon: <Clock className="h-3.5 w-3.5" />
      },
      failed: {
        variant: 'destructive',
        icon: <AlertTriangle className="h-3.5 w-3.5" />
      }
    },
    format: (value: any, row: any) => {
      if (value === 'completed') return 'Completed';
      if (value === 'in_progress') {
        const progress = row.completedPrompts && row.totalPrompts
          ? `Checking Compliance (${Math.round((row.completedPrompts / row.totalPrompts) * 100)}%)`
          : 'Waiting for Resources';
        return progress;
      }
      if (value === 'failed') return 'Evaluation Failed';
      return value;
    },
  },
  {
    key: 'duration',
    title: 'Duration',
    type: 'freeText',
    width: '100px',
    format: (value: any, row: any) => {
      // Calculate duration if completed
      if (row.completedAt && row.createdAt) {
        const start = new Date(row.createdAt).getTime();
        const end = new Date(row.completedAt).getTime();
        const durationMs = end - start;
        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
      }
      return '00:00:15';
    }
  },
  {
    key: 'createdAt',
    title: 'Created At',
    type: 'date',
    width: '180px',
    format: (value: any) => {
      if (!value) return 'N/A';
      const date = new Date(value);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
  {
    key: 'actions',
    title: '',
    type: 'button',
    width: '120px',
    buttonVariant: 'ghost',
    format: (value: any, row: EvaluationTestSummary) => {
      if (row.status === 'completed') return 'View Results';
      if (row.status === 'in_progress') return 'View Progress';
      return 'View Details';
    },
  },
];
