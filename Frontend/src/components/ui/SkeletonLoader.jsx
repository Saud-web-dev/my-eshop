import { clsx } from 'clsx';

export const Skeleton = ({ className, ...props }) => (
  <div className={clsx('skeleton', className)} {...props} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-surface rounded-card border border-border overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-3 w-1/3 rounded" />
      <Skeleton className="h-4 w-4/5 rounded" />
      <Skeleton className="h-4 w-2/5 rounded" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="border-b border-border">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 rounded w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);

export const CardSkeleton = () => (
  <div className="bg-surface rounded-card border border-border p-5 space-y-3">
    <Skeleton className="h-5 w-2/5 rounded" />
    <Skeleton className="h-8 w-3/5 rounded" />
    <Skeleton className="h-3 w-1/4 rounded" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-28 rounded" />
      <Skeleton className="h-3 w-20 rounded" />
    </div>
  </div>
);

export default Skeleton;
