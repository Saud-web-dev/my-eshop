import { forwardRef } from 'react';
import { clsx } from 'clsx';
import Spinner from './Spinner';

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
  danger:  'btn-danger',
  success: 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-btn bg-green-500 text-white font-semibold text-sm hover:bg-green-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizes = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: '',
  lg: 'px-8 py-3 text-base',
  xl: 'px-10 py-4 text-lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        variants[variant] ?? variants.primary,
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color="current" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
