"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

interface AnimatedButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    isLoading?: boolean;
    disabled?: boolean;
    variant?: "gradient" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
    fullWidth?: boolean;
}

export default function AnimatedButton({
    children,
    onClick,
    type = "button",
    isLoading = false,
    disabled = false,
    variant = "gradient",
    size = "md",
    className = "",
    fullWidth = false,
}: AnimatedButtonProps) {
    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
    };

    const variants = {
        gradient: "btn-gradient text-white",
        ghost: "bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.1]",
        danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
            className={`
        relative rounded-xl font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="relative z-10">Processing...</span>
                </>
            ) : (
                <span className="relative z-10">{children}</span>
            )}
        </motion.button>
    );
}
