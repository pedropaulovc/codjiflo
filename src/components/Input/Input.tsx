import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
    label: string;
    error?: string;
    hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hideLabel = false, className, ...props }, ref) => {
        const id = useId();
        const errorId = `${id}-error`;

        return (
            <div className="w-full">
                <label
                    htmlFor={id}
                    className={cn(
                        'block text-sm font-medium text-gray-700 mb-1',
                        hideLabel && 'sr-only'
                    )}
                >
                    {label}
                </label>
                <input
                    ref={ref}
                    id={id}
                    aria-describedby={error ? errorId : undefined}
                    aria-invalid={error ? 'true' : undefined}
                    className={cn(
                        'block w-full px-3 py-2 border rounded-md shadow-sm',
                        'focus:outline-none focus:ring-2 focus:ring-offset-0',
                        'disabled:bg-gray-100 disabled:cursor-not-allowed',
                        error
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p
                        id={errorId}
                        className="mt-1 text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
