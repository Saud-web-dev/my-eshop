import { clsx } from 'clsx';

const sizes = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };

const Spinner = ({ size = 'md', color = 'accent', className }) => {
  const colorClass =
    color === 'accent'  ? 'border-accent'   :
    color === 'white'   ? 'border-white'    :
    color === 'current' ? 'border-current'  :
    'border-accent';

  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block rounded-full border-2 border-t-transparent animate-spin',
        sizes[size] ?? sizes.md,
        colorClass,
        className
      )}
    />
  );
};

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-text-muted text-sm animate-pulse">Loading…</p>
    </div>
  </div>
);

export default Spinner;
