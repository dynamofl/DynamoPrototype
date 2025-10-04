import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ArrowLeft } from 'lucide-react';

interface CreateDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  maxHeight?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actionFooter?: ReactNode;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl'
};

export function CreateDialog({
  trigger,
  title,
  description,
  open,
  onOpenChange,
  children,
  maxWidth = 'lg',
  maxHeight = '80vh',
  showBackButton = false,
  onBack,
  actionFooter
}: CreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent
        className={`p-0 flex flex-col overflow-hidden ${maxWidthClasses[maxWidth]}`}
        style={{ maxHeight }}
      >
        <DialogHeader className="bg-gray-100 p-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-[0.8125rem]  font-450 text-gray-900 leading-5">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        {description && (
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        )}

        <ScrollArea className="flex-1">
          <div className="px-1.5 py-1.5 space-y-3">
            {children}
          </div>
        </ScrollArea>

        {actionFooter && (
          <div className="border-t border-gray-200 p-4">
            {actionFooter}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

