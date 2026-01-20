import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', required, ...props }, ref) => {
    const hasError = !!error;
    
    const inputBaseClasses = 'w-full px-4 py-2 rounded-lg border-2 transition-colors text-md focus:outline-none focus:ring-2 focus:ring-offset-1';
    
    const inputStateClasses = hasError
      ? 'border-danger focus:border-danger focus:ring-danger'
      : 'border-gray-200 focus:border-blue-base focus:ring-blue-base';
    
    const inputClasses = `${inputBaseClasses} ${inputStateClasses} ${className}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={props.id}
          className="text-xs uppercase font-semibold text-gray-600"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
        
        <input
          ref={ref}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          required={required}
          {...props}
        />
        
        {hasError && (
          <span
            id={props.id ? `${props.id}-error` : 'input-error'}
            className="text-xs text-danger flex items-center gap-1"
            role="alert"
          >
            <span className="inline-block w-1 h-1 bg-danger rounded-full"></span>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
