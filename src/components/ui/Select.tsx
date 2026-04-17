import React from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className,
  ...props
}) => {
  const baseClasses =
    'block h-12 w-full rounded-2xl border border-white/60 bg-white/80 px-4 text-sm text-ink-900 shadow-soft backdrop-blur transition duration-300 focus:border-accent-300 focus:bg-white focus:ring-4 focus:ring-accent-100 disabled:cursor-not-allowed disabled:opacity-60';
  const errorClasses = error ? 'border-danger-300 focus:border-danger-400 focus:ring-danger-100' : '';

  const classes = clsx(baseClasses, errorClasses, className);

  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-semibold tracking-tight text-ink-800">
          {label}
        </label>
      )}
      <select className={classes} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-danger-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-ink-500">{helperText}</p>}
    </div>
  );
};
