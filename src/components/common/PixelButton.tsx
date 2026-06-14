import React from 'react';
import { cn } from '@/lib/utils';

interface PixelButtonProps {
  children?: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
}

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-stone-600 hover:bg-stone-500 text-white',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  success: 'bg-green-600 hover:bg-green-500 text-white',
  warning: 'bg-amber-600 hover:bg-amber-500 text-white',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const PixelButton: React.FC<PixelButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  icon,
  title,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'font-pixel relative inline-flex items-center justify-center gap-2',
        'border-2 border-b-4 border-r-4 border-black',
        'transition-all duration-75',
        'hover:translate-y-px hover:border-b-2 hover:border-r-2',
        'active:translate-y-1 active:border-b-2 active:border-r-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        'image-rendering-pixelated',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={{
        imageRendering: 'pixelated',
        boxShadow: 'inset -2px -2px 0 0 rgba(0,0,0,0.3), inset 2px 2px 0 0 rgba(255,255,255,0.2)',
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="tracking-wide">{children}</span>
    </button>
  );
};
