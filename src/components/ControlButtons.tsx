"use client";

import React from "react";
import { motion } from "framer-motion";
import { TimerMode } from "@/hooks/useStudyTimer";

interface ControlButtonsProps {
    mode: TimerMode;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onEnd: () => void;
}

interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant: "primary" | "secondary" | "danger";
    id: string;
}

function ActionButton({ onClick, children, variant, id }: ButtonProps) {
    const variantStyles: Record<typeof variant, string> = {
        primary:
            "bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_24px_rgba(245,158,11,0.35)] hover:shadow-[0_0_36px_rgba(245,158,11,0.55)] dark:bg-amber-500 dark:hover:bg-amber-400",
        secondary:
            "bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:shadow-[0_0_36px_rgba(139,92,246,0.55)] dark:bg-violet-600 dark:hover:bg-violet-500",
        danger:
            "bg-transparent border border-foreground/20 text-foreground/60 hover:border-red-400 hover:text-red-500 hover:shadow-[0_0_16px_rgba(248,113,113,0.2)]",
    };

    return (
        <motion.button
            id={id}
            onClick={onClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`
        relative px-8 py-3 rounded-full text-sm font-semibold tracking-wide
        transition-all duration-300 cursor-pointer
        ${variantStyles[variant]}
      `}
        >
            {children}
        </motion.button>
    );
}

export function ControlButtons({ mode, onStart, onPause, onResume, onEnd }: ControlButtonsProps) {
    return (
        <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {mode === "idle" && (
                <ActionButton id="btn-start-study" onClick={onStart} variant="primary">
                    ▶ Start Focus
                </ActionButton>
            )}

            {mode === "study" && (
                <>
                    <ActionButton id="btn-take-break" onClick={onPause} variant="secondary">
                        ◎ Take a Break
                    </ActionButton>
                    <ActionButton id="btn-end-session" onClick={onEnd} variant="danger">
                        End Session
                    </ActionButton>
                </>
            )}

            {mode === "break" && (
                <>
                    <ActionButton id="btn-resume-study" onClick={onResume} variant="primary">
                        ▶ Resume Focus
                    </ActionButton>
                    <ActionButton id="btn-end-session-break" onClick={onEnd} variant="danger">
                        End Session
                    </ActionButton>
                </>
            )}
        </motion.div>
    );
}
