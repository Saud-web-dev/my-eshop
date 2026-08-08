import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconRight,
  onIconRightClick,
  className,
  wrapperClassName,
  required,
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'input-base',
            icon && 'pl-10',
            iconRight && 'pr-10',
            error && 'border-red-400 focus:ring-red-400/40 focus:border-red-400',
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {iconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            tabIndex={-1}
          >
            {iconRight}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, hint, className, wrapperClassName, required, ...props }, ref) => (
  <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
    {label && (
      <label className="text-sm font-medium text-text-secondary">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      className={clsx('input-base resize-none', error && 'border-red-400 focus:ring-red-400/40', className)}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, hint, className, wrapperClassName, required, children, ...props }, ref) => (
  <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
    {label && (
      <label className="text-sm font-medium text-text-secondary">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={clsx('input-base bg-surface cursor-pointer', error && 'border-red-400', className)}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
    {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
  </div>
));
Select.displayName = 'Select';

export default Input;
