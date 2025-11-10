import { type ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ViewEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  footer?: ReactNode;
  disableInitialFocus?: boolean;
  disableClose?: boolean;
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-full'
};

export function ViewEditSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  size = 'lg',
  footer,
  disableInitialFocus = true,
  disableClose = false
}: ViewEditSheetProps) {
  const handleSheetOpenChange = (isOpen: boolean) => {
    // If disableClose is true and user is trying to close, prevent it
    if (!isOpen && disableClose) {
      return;
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent side={side} className={`${sizeClasses[size]} flex flex-col`} onOpenAutoFocus={(e) => disableInitialFocus && e.preventDefault()}>
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 border-b border-gray-200">
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        
        {/* Scrollable Content Slot */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {children}
        </div>
        
        {/* Fixed Footer with Actions */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

