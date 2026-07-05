import { motion, AnimatePresence } from "framer-motion";
import { IoWarning } from "react-icons/io5";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-b from-[rgba(17,24,56,0.98)] to-[rgba(8,11,24,0.98)] border border-[rgba(239,68,68,0.2)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-md mx-4 pointer-events-auto">
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center">
                  <IoWarning className="text-3xl text-[#fc8181]" />
                </div>
                <h3 className="text-xl font-semibold text-[#e2e8f0] mb-2">{title}</h3>
                <p className="text-[#8892b0] text-sm mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl border border-[rgba(99,102,241,0.2)] text-[#a8b4d0] text-sm font-medium hover:bg-[rgba(99,102,241,0.1)] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white text-sm font-medium hover:shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all duration-200 hover:scale-105"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;