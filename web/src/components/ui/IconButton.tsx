import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'secondary';
  ariaLabel: string;
  children: ReactNode; // Ícone
}

export function IconButton({
  variant = 'primary',
  disabled = false,
  type = 'button',
  ariaLabel,
  children,
  className = '',
  ...props
}: IconButtonProps) {
  const baseClasses = 'p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
  
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
