import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/utils';

export function LoadingState({
  message = 'Loading data...',
  description,
  className,
}: {
  message?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl bg-white/50 border border-slate-100',
        className
      )}
    >
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-semibold text-slate-800">{message}</p>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center space-x-4 py-3 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded-sm"
          style={{ width: `${Math.max(20, 100 / cols - 5)}%` }}
        />
      ))}
    </div>
  );
}
