import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  const baseClasses =
    'block h-12 w-full rounded-2xl border border-white/60 bg-white/80 px-4 text-sm text-ink-900 shadow-soft backdrop-blur placeholder:text-ink-400 transition duration-300 focus:border-accent-300 focus:bg-white focus:ring-4 focus:ring-accent-100';
  const errorClasses = error ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100' : '';

  const classes = clsx(baseClasses, errorClasses, className);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id} className="mb-2 block text-sm font-semibold tracking-tight text-ink-800">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-ink-500">{helperText}</p>}
    </div>
  );
};
