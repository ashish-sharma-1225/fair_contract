import { AlertOctagon, RefreshCw } from 'lucide-react';

import { Button } from './Button';
import { cn } from '../../lib/utils';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error while retrieving data. Please check your connection and try again.',
  errorCode,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-red-200 bg-red-50/40',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3.5">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs text-slate-600 leading-relaxed">
        {message}
      </p>
      {errorCode && (
        <span className="mt-2 text-xs font-mono bg-red-100 text-red-800 px-2.5 py-1 rounded-sm">
          Code: {errorCode}
        </span>
      )}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-5 border-slate-300"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
