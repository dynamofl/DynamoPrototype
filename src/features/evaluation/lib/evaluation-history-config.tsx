import type { TableColumn } from '@/types/table';
import type { EvaluationTestSummary } from '../types/evaluation-test';
import { CheckCircle2, Clock, AlertTriangle, Trash2, Eye, Activity } from 'lucide-react';

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
      running: {
        variant: 'secondary',
        className: 'bg-amber-100 text-amber-800',
        icon: <Clock className="h-3.5 w-3.5" />
      },
      pending: {
        variant: 'secondary',
        className: 'bg-amber-100 text-amber-800 animate-pulse',
        icon: <Clock className="h-3.5 w-3.5" />
      },
      failed: {
        variant: 'destructive',
        icon: <AlertTriangle className="h-3.5 w-3.5" />
      }
    },
    format: (value: any, row: any) => {
      if (value === 'completed') return 'Completed';
      if (value === 'running') {
        // Show detailed progress with current/total prompts
        if (row.completedPrompts !== undefined && row.totalPrompts) {
          const percentage = Math.round((row.completedPrompts / row.totalPrompts) * 100);
          return `Running (${row.completedPrompts}/${row.totalPrompts} - ${percentage}%)`;
        }
        return 'Running Evaluation';
      }
      if (value === 'pending') return 'Starting...';
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
    type: 'multiButton',
    width: '200px',
    multiButtonConfig: {
      getActions: (row: EvaluationTestSummary) => {
        const actions = [];

        // View/Progress button based on status
        if (row.status === 'completed') {
          actions.push({
            key: 'view',
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost' as const,
            className: 'text-gray-700'
          });
        } else if (row.status === 'running') {
          actions.push({
            key: 'progress',
            label: 'Progress',
            icon: <Activity className="h-4 w-4" />,
            variant: 'ghost' as const,
            className: 'text-amber-700'
          });
        } else {
          actions.push({
            key: 'details',
            label: 'Details',
            icon: <Eye className="h-4 w-4" />,
            variant: 'ghost' as const,
            className: 'text-gray-700'
          });
        }

        // Delete button
        actions.push({
          key: 'delete',
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          variant: 'ghost' as const,
          className: 'text-red-600 hover:text-red-700'
        });

        return actions;
      }
    }
  },
];
