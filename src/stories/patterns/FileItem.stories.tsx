import type { Meta, StoryObj } from '@storybook/react';
import { FileItem } from '../../components/patterns/ui-patterns/file-item';
import type { FileState } from '@/types/csv';

const meta: Meta<typeof FileItem> = {
  title: 'Patterns/FileItem',
  component: FileItem,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['in-progress', 'invalid', 'validated'],
    },
    onRemove: { action: 'remove' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock file for stories
const createMockFile = (name: string, size: number): File => {
  const file = new File([''], name, { type: 'text/csv' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const createMockFileState = (name: string, size: number, variant: 'in-progress' | 'invalid' | 'validated'): FileState => {
  const file = createMockFile(name, size);
  
  const baseState: FileState = {
    id: '1',
    file,
    isUploading: false,
    isParsing: false,
    uploadProgress: 100,
    parseResult: null,
  };

  switch (variant) {
    case 'in-progress':
      return {
        ...baseState,
        isUploading: true,
        uploadProgress: 45,
      };
    case 'invalid':
      return {
        ...baseState,
        parseResult: {
          validCount: 0,
          invalidCount: 100,
          errors: ['Invalid format'],
        },
      };
    case 'validated':
      return {
        ...baseState,
        parseResult: {
          validCount: 150,
          invalidCount: 5,
          errors: [],
        },
      };
    default:
      return baseState;
  }
};

export const InProgress: Story = {
  args: {
    file: createMockFileState('data.csv', 2.5 * 1024 * 1024, 'in-progress'),
    variant: 'in-progress',
  },
};

export const Invalid: Story = {
  args: {
    file: createMockFileState('invalid-data.csv', 1.2 * 1024 * 1024, 'invalid'),
    variant: 'invalid',
  },
};

export const Validated: Story = {
  args: {
    file: createMockFileState('valid-data.csv', 3.8 * 1024 * 1024, 'validated'),
    variant: 'validated',
  },
};

export const LargeFile: Story = {
  args: {
    file: createMockFileState('large-dataset.csv', 15.7 * 1024 * 1024, 'validated'),
    variant: 'validated',
  },
};

export const LongFileName: Story = {
  args: {
    file: createMockFileState('very-long-filename-that-might-overflow.csv', 2.1 * 1024 * 1024, 'validated'),
    variant: 'validated',
  },
};

export const Uploading: Story = {
  args: {
    file: {
      ...createMockFileState('uploading.csv', 5.2 * 1024 * 1024, 'in-progress'),
      isUploading: true,
      uploadProgress: 75,
    },
    variant: 'in-progress',
  },
};

export const Parsing: Story = {
  args: {
    file: {
      ...createMockFileState('parsing.csv', 1.8 * 1024 * 1024, 'in-progress'),
      isParsing: true,
    },
    variant: 'in-progress',
  },
};

export const FileList: Story = {
  render: () => (
    <div className="space-y-3 w-96">
      <h3 className="text-lg font-medium">Uploaded Files</h3>
      
      <FileItem
        file={createMockFileState('data.csv', 2.5 * 1024 * 1024, 'validated')}
        variant="validated"
        onRemove={(id) => console.log('Remove:', id)}
      />
      
      <FileItem
        file={createMockFileState('invalid.csv', 1.2 * 1024 * 1024, 'invalid')}
        variant="invalid"
        onRemove={(id) => console.log('Remove:', id)}
      />
      
      <FileItem
        file={{
          ...createMockFileState('uploading.csv', 3.1 * 1024 * 1024, 'in-progress'),
          isUploading: true,
          uploadProgress: 60,
        }}
        variant="in-progress"
        onRemove={(id) => console.log('Remove:', id)}
      />
      
      <FileItem
        file={{
          ...createMockFileState('parsing.csv', 1.5 * 1024 * 1024, 'in-progress'),
          isParsing: true,
        }}
        variant="in-progress"
        onRemove={(id) => console.log('Remove:', id)}
      />
    </div>
  ),
};
