import React, { ReactNode } from 'react';
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg', 
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-full'
};

export function ViewEditSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  size = 'lg'
}: ViewEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={sizeClasses[size]}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="mt-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

