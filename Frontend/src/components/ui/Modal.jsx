import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { MdClose } from 'react-icons/md';

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  '3xl':'max-w-3xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  className,
}) => {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape' && closable) onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, closable, onClose]);

  // Click outside
  const handleOverlayClick = (e) => {
    if (closable && e.target === overlayRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className={clsx(
              'relative w-full bg-surface rounded-xl shadow-modal overflow-hidden flex flex-col max-h-[90vh]',
              sizes[size] ?? sizes.md,
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            {(title || closable) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
                {closable && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-lg hover:bg-surface-overlay text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Close modal"
                  >
                    <MdClose size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-raised">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Confirm Dialog
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm"
    footer={
      <>
        <button onClick={onClose} className="btn-ghost" disabled={loading}>Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'}
        >
          {loading ? 'Processing…' : confirmText}
        </button>
      </>
    }
  >
    <p className="text-text-secondary text-sm">{message}</p>
  </Modal>
);

export default Modal;
