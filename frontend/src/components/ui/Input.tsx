import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(

  ({ className, label, error, helperText, leftIcon, rightAction, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400',
              'transition-colors py-2 px-3 focus:outline-none focus:ring-2 focus:ring-offset-1',
              leftIcon && 'pl-9',
              rightAction && 'pr-10',
              error
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500',
              className
            )}
            {...props}
          />
          {rightAction && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightAction}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
