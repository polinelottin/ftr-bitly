import { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconName = 'copy' | 'download-simple' | 'link' | 'trash' | 'warning';

// SVG paths para cada ícone
const iconSvgs: Record<IconName, string> = {
  'copy': '<path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>',
  'download-simple': '<path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path>',
  'link': '<path d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z"></path>',
  'trash': '<path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>',
  'warning': '<path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path>',
};

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

function Icon({ name, className = '', size = 20 }: IconProps) {
  const iconPath = iconSvgs[name];
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: iconPath }}
    />
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children?: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
}

// Helper para verificar se children está vazio
function isEmptyChildren(children: ReactNode): boolean {
  if (children == null || children === false || children === '') return true;
  if (typeof children === 'string') return children.trim() === '';
  if (Array.isArray(children)) return children.length === 0;
  return false;
}

export function Button({
  variant = 'primary',
  disabled = false,
  type = 'button',
  children,
  className = '',
  ariaLabel,
  icon,
  iconPosition = 'left',
  ...props
}: ButtonProps) {
  // Infere iconOnly: se tem icon mas não tem children (ou children vazio)
  const iconOnly = icon !== undefined && isEmptyChildren(children);
  
  const paddingClasses = iconOnly ? 'p-2' : 'px-6 py-2';
  const textClasses = iconOnly ? '' : 'font-semibold text-md';
  // Usa flex quando for iconOnly ou quando tiver ícone com texto
  const flexClasses = iconOnly || icon ? 'flex items-center justify-center' : '';
  
  // Se tiver ícone e não for iconOnly, adiciona gap
  const gapClass = icon && !iconOnly ? 'gap-2' : '';
  
  const baseClasses = `${paddingClasses} rounded-lg transition-colors ${textClasses} ${flexClasses} ${gapClass} focus:outline-none focus:ring-2 focus:ring-offset-2`.trim().replace(/\s+/g, ' ');
  
  const variantClasses = {
    primary: disabled
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : 'bg-blue-base hover:bg-blue-dark text-white focus:ring-blue-base',
    secondary: disabled
      ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed'
      : 'bg-white border-2 border-blue-base text-blue-base hover:bg-gray-100 focus:ring-blue-base',
  };

  // Determina a cor do ícone baseado na variant e estado disabled
  const iconColorClass = disabled
    ? variant === 'primary' ? 'text-gray-500' : 'text-gray-400'
    : variant === 'primary' ? 'text-white' : 'text-blue-base';

  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {iconOnly && icon ? (
        <Icon name={icon} className={iconColorClass} size={20} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon name={icon} className={iconColorClass} size={18} />
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <Icon name={icon} className={iconColorClass} size={18} />
          )}
        </>
      )}
    </button>
  );
}
