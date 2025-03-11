import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, user, children, title }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed top-[0] bottom-[0] left-[0] right-[0] pt-8 w-full flex items-end sm:items-center justify-end sm:justify-center bg-neutral-200/50 backdrop-blur-xl z-[500] text-neutral-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            > 
                <motion.div
                    className="w-[95%] max-w-md max-h-[100%] sm:max-h-[80%] overflow-hidden flex flex-col relative"
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
                        <div className="">
                            {user && (<p className="text-xs font-bold text-neutral-500">{user}</p>)}
                            <p className="font-display text-2xl text-neutral-700 leading-none -mb-1.5">{title}</p>
                        </div>
                        <button onClick={onClose} className="pl-4 text-neutral-700 font-bold">
                            <X size={32} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="bg-neutral-700 p-6 pb-20 sm:rounded-2xl overflow-y-auto max-sm:rounded-tl-2xl">
                        {children}
                        <div className="content-fade w-full h-20 absolute left-0 sm:rounded-b-2xl bottom-0 bg-gradient-to-b transparent to-80% to-neutral-700 z-[2] pointer-events-none" />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}