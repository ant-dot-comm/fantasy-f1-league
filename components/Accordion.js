import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Accordion({ title, children, initialOpen = false }) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    return (
        <div className="border-b-8 border-neutral-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left flex justify-between items-center py-4 text-lg font-bold"
            >
                <p className="font-display">{title}</p>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-neutral-500"
                >
                    <ChevronDown size={32} strokeWidth={2.5} />
                </motion.span>
            </button>

            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="pb-4">{children}</div>
            </motion.div>
        </div>
    );
}