"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
    percent: number;
    isStudy: boolean;
    goalMinutes: number;
    onGoalClick: () => void;
}

export function ProgressBar({ percent, isStudy, goalMinutes, onGoalClick }: ProgressBarProps) {
    return (
        <div className="flex flex-col gap-2">
            {/* Labels */}
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
                    Progress
                </span>
                <button
                    onClick={onGoalClick}
                    className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                    Goal: {goalMinutes}m
                </button>
            </div>

            {/* Track */}
            <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                {/* Fill */}
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        background: isStudy
                            ? "linear-gradient(90deg, #f59e0b, #f97316, #fb7185)"
                            : "linear-gradient(90deg, #818cf8, #a78bfa, #67e8f9)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 rounded-full progress-shimmer" />
                </motion.div>
            </div>

            {/* Percent label */}
            <div className="flex justify-between items-center">
                <motion.span
                    key={percent}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-[11px] font-semibold tabular-nums ${isStudy ? "text-amber-600 dark:text-amber-400" : "text-violet-600 dark:text-violet-400"
                        }`}
                >
                    {percent}%
                </motion.span>
                <span className="text-[10px] text-muted-foreground">
                    {percent === 100 ? "🎯 Goal reached!" : "of goal"}
                </span>
            </div>
        </div>
    );
}
