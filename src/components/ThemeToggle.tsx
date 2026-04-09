"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <motion.button
            id="btn-theme-toggle"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="Toggle theme"
            className="relative w-9 h-9 rounded-full glass-card flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
        >
            <motion.span
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25 }}
                className="text-base leading-none select-none"
            >
                {isDark ? "☽" : "☀"}
            </motion.span>
        </motion.button>
    );
}
