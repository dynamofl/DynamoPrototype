import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProgressSkeletonCellProps {
  width?: string;
  className?: string;
}

export function ProgressSkeletonCell({
  width = 'w-16',
  className = ''
}: ProgressSkeletonCellProps) {
  return (
    <Skeleton className={cn('h-5 rounded', width, className)} />
  );
}
