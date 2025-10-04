import { 
  CheckCircle, 
  AlertTriangle,
  File,
  X,
  Trash2
} from 'lucide-react';
import type { FileState } from '@/types/csv';

// Reusable FileItem Component
interface FileItemProps {
  file: FileState;
  variant: 'in-progress' | 'invalid' | 'validated';
  onRemove: (fileId: string) => void;
}

export const FileItem = ({ file, variant, onRemove }: FileItemProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'in-progress':
        return {
          container: "bg-gray-50 rounded-lg p-2 flex items-start gap-2",
          badge: "bg-green-600",
          badgeText: "text-[8px] font-450 font-mono text-white leading-[14.545px]"
        };
      case 'invalid':
        return {
          container: " rounded-lg p-2 flex items-start gap-2 border border-red-500 shadow-[0px_0px_0px_2px_rgba(249,137,137,0.25)]",
          badge: "bg-green-600",
          badgeText: "text-[10px] font-450 font-mono text-white leading-[14.545px]"
        };
      case 'validated':
        return {
          container: " rounded-lg border border-gray-300 p-2 flex items-start gap-2",
          badge: "bg-green-600",
          badgeText: "text-[10px] font-450 font-mono text-white leading-[14.545px]"
        };
    }
  };

  const getStatusContent = () => {
    switch (variant) {
      case 'in-progress':
        if (file.isUploading && !file.isParsing) {
          return (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-[0.8125rem]  italic text-gray-600">
                Uploading ({(file.uploadProgress / 100 * file.file.size / (1024 * 1024)).toFixed(1)} MB of {(file.file.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>
          );
        }
        if (file.isParsing) {
          return (
            <div className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-[0.8125rem]  italic text-gray-600">Validating the csv file</span>
            </div>
          );
        }
        return null;
      case 'invalid':
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-[0.8125rem]  italic text-red-600">
              All rows are invalid. Please check the file format.
            </span>
          </div>
        );
      case 'validated':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-[0.8125rem]  italic text-gray-600">
              {file.parseResult?.validCount} Valid Rows • {(file.file.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>
        );
    }
  };

  const getRemoveIcon = () => {
    return variant === 'validated' ? <Trash2 /> : <X />;
  };

  const styles = getVariantStyles();

  return (
    <div className={styles.container}>
      <div className="relative">
        <File className="h-12 w-12 text-gray-600" />
        <div className={`absolute left-1 bottom-1 ${styles.badge} px-[2.909px] rounded-[2.909px]`}>
          <span className={styles.badgeText}>CSV</span>
        </div>
      </div>
      <div className="flex-1 min-h-[48px] flex flex-col justify-center gap-0.5">
        <p className="text-[0.8125rem]  text-black leading-5">{file.file.name}</p>
        {getStatusContent()}
      </div>
      <button
        onClick={() => onRemove(file.id)}
        className="h-5 w-5 text-gray-600 hover:text-gray-900"
      >
        {getRemoveIcon()}
      </button>
    </div>
  );
};


