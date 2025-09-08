import React, { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
        className={`p-0 flex flex-col overflow-hidden ${maxWidthClasses[maxWidth]} max-h-[${maxHeight}]`}
      >
        <DialogHeader className="bg-gray-100 p-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && onBack && (
              <button 
                onClick={onBack}
                className="text-[#404b64] hover:text-[#192c4b] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={() => onOpenChange(false)} 
              className="text-[#404b64] hover:text-[#192c4b] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-sm font-450 text-[#192c4b] leading-5">
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
          <div className="border-t border-[rgba(9,28,66,0.1)] p-4">
            {actionFooter}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

