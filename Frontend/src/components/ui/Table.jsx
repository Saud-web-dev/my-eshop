import { clsx } from 'clsx';
import Spinner from './Spinner';

const Table = ({ columns, data, loading, emptyMessage = 'No records found.', className }) => {
  return (
    <div className={clsx('overflow-x-auto rounded-card border border-border', className)}>
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-raised border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 font-semibold text-text-secondary whitespace-nowrap',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center',
                  col.className
                )}
                style={col.width ? { width: col.width } : {}}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <div className="flex justify-center">
                  <Spinner size="lg" />
                </div>
              </td>
            </tr>
          ) : data?.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data?.map((row, rowIdx) => (
              <tr
                key={row._id ?? rowIdx}
                className="border-b border-border last:border-0 hover:bg-surface-raised/60 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3 text-text-primary',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      col.cellClassName
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
