import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-2xl border text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-300 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:scale-[0.99] disabled:pointer-events-none';

  const variantClasses = {
    primary:
      'border-transparent bg-gradient-to-r from-primary-900 via-primary-700 to-primary-400 text-white shadow-glow hover:-translate-y-0.5 hover:shadow-soft',
    secondary:
      'border-white/70 bg-white/85 text-ink-900 shadow-soft backdrop-blur hover:-translate-y-0.5 hover:bg-white',
    success:
      'border-transparent bg-gradient-to-r from-accent-700 to-accent-400 text-white shadow-soft hover:-translate-y-0.5',
    warning:
      'border-transparent bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-soft hover:-translate-y-0.5',
    danger:
      'border-transparent bg-gradient-to-r from-rose-600 to-red-400 text-white shadow-soft hover:-translate-y-0.5',
    ghost:
      'border-slate-200/70 bg-transparent text-ink-700 hover:border-primary-200 hover:bg-primary-50/80 hover:text-primary-800 hover:backdrop-blur',
  };

  const sizeClasses = {
    sm: 'h-10 px-4',
    md: 'h-12 px-5',
    lg: 'h-14 px-6 text-base',
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    (disabled || loading) && 'cursor-not-allowed opacity-60 shadow-none hover:translate-y-0',
    className
  );

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
