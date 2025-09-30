import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function LoadingState() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div>
            <p className="font-450">Running Evaluation...</p>
            <p className="text-[13px] text-muted-foreground">
              Analyzing prompt and generating response
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


