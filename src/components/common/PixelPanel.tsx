import React from 'react';
import { cn } from '@/lib/utils';

interface PixelPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'dark' | 'wood';
}

export const PixelPanel: React.FC<PixelPanelProps> = ({
  children,
  title,
  className,
  variant = 'default',
  onClick,
  ...rest
}) => {
  const variantStyles = {
    default: 'bg-stone-800 border-stone-600',
    dark: 'bg-stone-900 border-stone-700',
    wood: 'bg-amber-800 border-amber-600',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-2 border-b-4 border-r-4 border-black',
        'image-rendering-pixelated',
        variantStyles[variant],
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        imageRendering: 'pixelated',
        boxShadow: 'inset -3px -3px 0 0 rgba(0,0,0,0.3), inset 3px 3px 0 0 rgba(255,255,255,0.1)',
      }}
      {...rest}
    >
      {title && (
        <div className="border-b-2 border-black px-4 py-2 bg-stone-700">
          <h3 className="font-pixel text-sm text-white tracking-wider">{title}</h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
