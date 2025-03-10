import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ isOpen, onClose, user, children, title }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 flex items-end sm:items-center justify-end sm:justify-center bg-neutral-200/50 backdrop-blur-xl z-[500] text-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="w-[95%] max-w-md overflow-hidden flex flex-col relative"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                    }}
                >
                    <div className="flex justify-between items-center px-6">
                        <div>
                            {/* {user && (
                                <h3 className="font-bold text-neutral-500 leading-none">{user}</h3>
                            )} */}
                            <p className="font-display text-2xl text-neutral-700 leading-none -mb-1.5">{title}</p>
                        </div>
                        <button onClick={onClose} className="pl-4 text-neutral-700 font-bold">
                            <X size={32} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="bg-neutral-700 p-6 pb-20 sm:rounded-2xl overflow-y-auto h-[90vh] max-sm:rounded-tl-2xl">
                        {children}
                        <div className="content-fade w-full h-1/5 absolute left-0 sm:rounded-b-2xl bottom-0 bg-gradient-to-b transparent to-80% to-neutral-700 z-[2]" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}