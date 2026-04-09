"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime, TimerMode } from "@/hooks/useStudyTimer";

interface TimerDisplayProps {
    studySeconds: number;
    breakSeconds: number;
    mode: TimerMode;
    isBreak: boolean;
}

function AnimatedTimerChar({ char, index }: { char: string; index: number }) {
    const isColon = char === ":";
    return (
        <span className="relative inline-flex items-center justify-center overflow-hidden" style={{ width: isColon ? "0.4em" : "0.62em" }}>
            {/* Invisible static character to set natural height naturally without cropping */}
            <span className="invisible select-none" aria-hidden="true">
                {isColon ? ":" : "8"}
            </span>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={char}
                    initial={{ y: isColon ? 0 : -28, opacity: isColon ? 1 : 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: isColon ? 0 : 28, opacity: isColon ? 1 : 0 }}
                    transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    {char}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

interface TimerTextProps {
    seconds: number;
    isStudy: boolean;
    muted?: boolean;
    isDual?: boolean;
}

function TimerText({ seconds, isStudy, muted = false, isDual = false }: TimerTextProps) {
    const timeStr = formatTime(seconds);
    const strokeColor = isStudy ? "#f59e0b" : "#8b5cf6";
    const glowColor = isStudy
        ? "drop-shadow(0 0 32px rgba(245,158,11,0.5)) drop-shadow(0 0 10px rgba(245,158,11,0.3))"
        : "drop-shadow(0 0 32px rgba(139,92,246,0.5)) drop-shadow(0 0 10px rgba(139,92,246,0.3))";

    return (
        <div
            style={{
                fontSize: isDual ? "clamp(2.5rem, 8vw, 4.5rem)" : "clamp(4.5rem, 16vw, 8.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                WebkitTextStroke: `2px ${strokeColor}`,
                color: "transparent",
                filter: muted ? "none" : glowColor,
                opacity: muted ? 0.55 : 1,
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
            }}
        >
            {timeStr.split("").map((char, i) => (
                <AnimatedTimerChar key={`pos-${i}`} char={char} index={i} />
            ))}
        </div>
    );
}

export function TimerDisplay({ studySeconds, breakSeconds, mode, isBreak }: TimerDisplayProps) {
    const isIdle = mode === "idle";
    const isStudy = mode === "study";

    return (
        <div className="relative w-full flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
                {!isBreak ? (
                    <motion.div
                        key="single-timer"
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -12 }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 240, damping: 22 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground font-medium">
                            {isIdle ? "Ready to Focus" : "Deep Focus"}
                        </p>

                        <div className={isStudy ? "animate-pulse-warm" : ""}>
                            <TimerText seconds={studySeconds} isStudy={true} />
                        </div>

                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                            {isIdle ? "Press start when ready" : `${formatTime(studySeconds)} in session`}
                        </p>
                    </motion.div>
                ) : (
                    /* ── Dual timer: Break mode ── */
                    <motion.div
                        key="dual-timer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        {/* Mobile: stacked */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 w-full">
                            {/* Left: Study (frozen) */}
                            <motion.div
                                className="flex flex-col items-center flex-1 min-w-0"
                                initial={{ x: -24, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 22 }}
                            >
                                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium mb-3">
                                    Study · Paused
                                </p>
                                <TimerText seconds={studySeconds} isStudy={true} muted isDual />
                            </motion.div>

                            {/* Divider */}
                            <div className="hidden sm:flex items-center self-stretch px-4">
                                <div className="w-px h-20 bg-gradient-to-b from-transparent via-border to-transparent" />
                            </div>
                            <div className="sm:hidden w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                            {/* Right: Break (running) */}
                            <motion.div
                                className="flex flex-col items-center flex-1 min-w-0"
                                initial={{ x: 24, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 22 }}
                            >
                                <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium mb-3">
                                    Break · Running
                                </p>
                                <div className="animate-pulse-cool">
                                    <TimerText seconds={breakSeconds} isStudy={false} isDual />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
