import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { UploadSheet } from '../../components/patterns/ui-patterns/upload-sheet';
import type { CSVParseResult, FileState } from '@/types/csv';
import type { EvaluationPrompt } from '@/features/evaluation/types/evaluation';

// Mock data
const mockCSVResult: CSVParseResult = {
  validRows: [
    {
      id: '1',
      prompt: 'What is the capital of France?',
      expectedResponse: 'Paris',
      category: 'Geography',
      difficulty: 'Easy'
    },
    {
      id: '2',
      prompt: 'Explain quantum computing',
      expectedResponse: 'Quantum computing uses quantum mechanics...',
      category: 'Technology',
      difficulty: 'Hard'
    }
  ],
  invalidRows: [
    {
      id: '3',
      prompt: '',
      expectedResponse: 'Some response',
      errors: ['Prompt is required'],
      category: 'Test',
      difficulty: 'Medium'
    }
  ],
  totalRows: 3,
  validCount: 2,
  invalidCount: 1
};

const mockFileState: FileState = {
  id: '1',
  file: new File([''], 'test.csv'),
  parseResult: mockCSVResult,
  isUploading: false,
  isParsing: false,
  uploadProgress: 100
};

// Wrapper component to manage state
const UploadSheetWrapper = () => {
  const [files, setFiles] = React.useState<FileState[]>([]);

  return (
    <UploadSheet
      files={files}
      onFilesChange={setFiles}
      onImport={(result: CSVParseResult) => {
        console.log('Import result:', result);
      }}
      onError={(error: string) => {
        console.log('Error:', error);
      }}
    />
  );
};

const meta: Meta<typeof UploadSheet> = {
  title: 'Patterns/UploadSheet',
  component: UploadSheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A sheet component for uploading and managing CSV files with validation and import functionality.',
      },
    },
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <UploadSheetWrapper />,
};

export const WithFiles: Story = {
  render: () => {
    const [files, setFiles] = React.useState<FileState[]>([mockFileState]);

    return (
      <UploadSheet
        files={files}
        onFilesChange={setFiles}
        onImport={(result: CSVParseResult) => {
          console.log('Import result:', result);
        }}
        onError={(error: string) => {
          console.log('Error:', error);
        }}
      />
    );
  },
};

export const WithInvalidFiles: Story = {
  render: () => {
    const invalidFile: FileState = {
      ...mockFileState,
      parseResult: {
        ...mockCSVResult,
        validCount: 0,
        invalidCount: 3,
        validRows: [],
        invalidRows: [
          {
            id: '1',
            prompt: '',
            expectedResponse: '',
            errors: ['Missing required fields'],
            category: '',
            difficulty: ''
          },
          {
            id: '2',
            prompt: 'Valid prompt',
            expectedResponse: '',
            errors: ['Expected response is required'],
            category: 'Test',
            difficulty: 'Easy'
          }
        ]
      }
    };

    const [files, setFiles] = React.useState<FileState[]>([invalidFile]);

    return (
      <UploadSheet
        files={files}
        onFilesChange={setFiles}
        onImport={(result: CSVParseResult) => {
          console.log('Import result:', result);
        }}
        onError={(error: string) => {
          console.log('Error:', error);
        }}
      />
    );
  },
};

export const Empty: Story = {
  render: () => {
    const [files, setFiles] = React.useState<FileState[]>([]);

    return (
      <UploadSheet
        files={files}
        onFilesChange={setFiles}
        onImport={(result: CSVParseResult) => {
          console.log('Import result:', result);
        }}
        onError={(error: string) => {
          console.log('Error:', error);
        }}
      />
    );
  },
};
