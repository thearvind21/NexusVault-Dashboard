"use client";

import { motion } from "framer-motion";
import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    padding?: string;
}

export default function GlassCard({
    children,
    className = "",
    hover = true,
    onClick,
    padding = "p-6",
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
            onClick={onClick}
            className={`
        rounded-2xl ${padding}
        bg-white/[0.04] backdrop-blur-xl
        border border-white/[0.08]
        ${hover ? "transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.15] hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer" : ""}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
}
