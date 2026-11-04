import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'leaf';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2 shadow-sm',
    lg: 'text-base px-6 py-3.5 gap-2.5 shadow-md',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-900/20 focus:ring-emerald-500 border border-emerald-500/20',
    secondary:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/90 dark:text-emerald-100 dark:border-emerald-800/80 focus:ring-emerald-500',
    outline:
      'border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50/60 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/50 focus:ring-emerald-500',
    ghost:
      'text-emerald-800 hover:bg-emerald-50/80 dark:text-emerald-200 dark:hover:bg-emerald-950/60 focus:ring-emerald-500',
    leaf:
      'bg-lime-600 hover:bg-lime-700 text-white shadow-lime-900/20 focus:ring-lime-500 border border-lime-500/20',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!isLoading && icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!isLoading && icon}
      <span>{children}</span>
    </button>
  );
}

