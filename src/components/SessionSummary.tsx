"use client";

import React from "react";
import { motion } from "framer-motion";
import { formatTime } from "@/hooks/useStudyTimer";

interface SessionSummaryProps {
    studySeconds: number;
    breakSeconds: number;
    focusRatio: number;
    onReset: () => void;
}

export function SessionSummary({
    studySeconds,
    breakSeconds,
    focusRatio,
    onReset,
}: SessionSummaryProps) {
    const getFocusLabel = (ratio: number) => {
        if (ratio >= 85) return { label: "Deep Flow", color: "text-emerald-500 dark:text-emerald-400" };
        if (ratio >= 70) return { label: "Solid Focus", color: "text-amber-500 dark:text-amber-400" };
        if (ratio >= 50) return { label: "Balanced", color: "text-sky-500 dark:text-sky-400" };
        return { label: "Rest-Heavy", color: "text-violet-500 dark:text-violet-400" };
    };

    const { label: focusLabel, color: focusColor } = getFocusLabel(focusRatio);

    const stats = [
        {
            label: "Total Study",
            value: formatTime(studySeconds),
            icon: "◉",
            color: "text-amber-500 dark:text-amber-400",
        },
        {
            label: "Total Break",
            value: formatTime(breakSeconds),
            icon: "◎",
            color: "text-violet-500 dark:text-violet-400",
        },
        {
            label: "Focus Ratio",
            value: `${focusRatio}%`,
            icon: "◈",
            color: focusColor,
        },
    ];

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Title */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
            >
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Session Complete</p>
                <h2 className="text-2xl font-bold text-foreground">Well done.</h2>
                <p className={`text-sm font-medium mt-1 ${focusColor}`}>{focusLabel}</p>
            </motion.div>

            {/* Stats cards */}
            <motion.div
                className="grid grid-cols-3 gap-3 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                    hidden: {},
                }}
            >
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, y: 16 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="glass-card rounded-2xl p-4 flex flex-col items-center gap-1.5"
                    >
                        <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center leading-tight">
                            {stat.label}
                        </p>
                        <p className={`text-base font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Focus ring visual */}
            <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
            >
                <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18" cy="18" r="15.9"
                            fill="none"
                            stroke="currentColor"
                            className="text-muted/40"
                            strokeWidth="2"
                        />
                        <motion.circle
                            cx="18" cy="18" r="15.9"
                            fill="none"
                            stroke="url(#focus-gradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={`${focusRatio} ${100 - focusRatio}`}
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="focus-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground/80">{focusRatio}%</span>
                    </div>
                </div>
            </motion.div>

            {/* Reset button */}
            <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
            >
                <motion.button
                    id="btn-new-session"
                    onClick={onReset}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold tracking-wide shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.55)] transition-all duration-300 cursor-pointer"
                >
                    ▶ New Session
                </motion.button>
            </motion.div>
        </div>
    );
}
