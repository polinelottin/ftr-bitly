import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  iconOnly?: boolean;
  ariaLabel?: string;
}

export function Button({
  variant = 'primary',
  disabled = false,
  type = 'button',
  children,
  className = '',
  iconOnly = false,
  ariaLabel,
  ...props
}: ButtonProps) {
  const paddingClasses = iconOnly ? 'p-2' : 'px-6 py-2';
  const textClasses = iconOnly ? '' : 'font-semibold text-md';
  const flexClasses = iconOnly ? 'flex items-center justify-center' : '';
  
  const baseClasses = `${paddingClasses} rounded-lg transition-colors ${textClasses} ${flexClasses} focus:outline-none focus:ring-2 focus:ring-offset-2`.trim();
  
  const variantClasses = {
    primary: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-blue-base hover:bg-blue-dark text-white focus:ring-blue-base',
    secondary: disabled
      ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
      : 'bg-white border-2 border-blue-base text-blue-base hover:bg-gray-100 focus:ring-blue-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
