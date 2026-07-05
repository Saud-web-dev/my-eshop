import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-b from-[rgba(17,24,56,0.98)] to-[rgba(8,11,24,0.98)] border border-[rgba(99,102,241,0.15)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto scrollbar-none">
              <div className="flex items-center justify-between p-6 border-b border-[rgba(99,102,241,0.1)]">
                <h2 className="text-xl font-semibold text-[#e2e8f0] tracking-wide">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-[#8892b0] hover:text-[#6366f1] transition-colors duration-200 text-2xl"
                >
                  <IoClose />
                </button>
              </div>
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;