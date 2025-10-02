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
  footer
}: ViewEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={`${sizeClasses[size]} flex flex-col`}>
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
        <div className="flex-1 overflow-y-auto p-4">
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

