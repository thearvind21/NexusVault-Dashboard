"use client";

import { motion } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import AnimatedButton from "./AnimatedButton";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({
    title = "No tasks yet",
    description = "Start organizing your work by creating your first task",
    actionLabel = "Create your first task",
    onAction,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]"
            >
                <Inbox className="w-10 h-10 text-blue-400/60" strokeWidth={1.5} />
            </motion.div>

            <h3 className="text-xl font-semibold text-white/80 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>

            {onAction && (
                <AnimatedButton onClick={onAction} size="md">
                    <Plus className="w-4 h-4" />
                    {actionLabel}
                </AnimatedButton>
            )}
        </motion.div>
    );
}
