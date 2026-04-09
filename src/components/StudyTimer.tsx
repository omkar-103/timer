"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyTimer, formatTime } from "@/hooks/useStudyTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressBar } from "@/components/ProgressBar";
import { TimerDisplay } from "@/components/TimerDisplay";
import { ControlButtons } from "@/components/ControlButtons";
import { SessionSummary } from "@/components/SessionSummary";
import { GoalSetter } from "@/components/GoalSetter";
import { WarmGlow, CoolGlow } from "@/components/GlowEffects";

export default function StudyTimer() {
    const {
        state,
        hydrated,
        focusRatio,
        progressPercent,
        startStudy,
        pauseStudy,
        resumeStudy,
        endSession,
        resetSession,
        setGoal,
    } = useStudyTimer();

    const [showGoalSetter, setShowGoalSetter] = useState(false);
    const isStudy = state.mode === "study";
    const isBreak = state.mode === "break";
    const isEnded = state.mode === "ended";
    const isIdle = state.mode === "idle";
    const isActive = isStudy || isBreak;

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space" && !showGoalSetter) {
                e.preventDefault();
                if (state.mode === "idle") startStudy();
                else if (state.mode === "study") pauseStudy();
                else if (state.mode === "break") resumeStudy();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [state.mode, startStudy, pauseStudy, resumeStudy, showGoalSetter]);

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-start no-select">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <AnimatePresence mode="wait">
                    {isStudy || isIdle ? (
                        <motion.div
                            key="warm-glow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className="absolute inset-0"
                        >
                            <WarmGlow />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cool-glow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className="absolute inset-0"
                        >
                            <CoolGlow />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Header */}
            <header className="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between px-6 py-5">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
                        Deep Work
                    </p>
                    <h1 className="text-sm font-semibold text-foreground/80 mt-0.5">Study Timer</h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3"
                >
                    {isActive && (
                        <motion.span
                            key={state.mode}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-full ${isStudy
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                                }`}
                        >
                            {isStudy ? "● Focus" : "◎ Break"}
                        </motion.span>
                    )}
                    <ThemeToggle />
                </motion.div>
            </header>

            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 w-full max-w-2xl mx-auto px-6 mb-8"
            >
                <ProgressBar
                    percent={progressPercent}
                    isStudy={isStudy}
                    goalMinutes={Math.floor(state.totalStudyGoalSeconds / 60)}
                    onGoalClick={() => !isActive && setShowGoalSetter(true)}
                />
            </motion.div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto px-6 pb-8">

                {/* Session Ended */}
                <AnimatePresence mode="wait">
                    {isEnded ? (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="w-full"
                        >
                            <SessionSummary
                                studySeconds={state.studySeconds}
                                breakSeconds={state.breakSeconds}
                                focusRatio={focusRatio}
                                onReset={resetSession}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="timer-ui"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="w-full flex flex-col items-center gap-8"
                        >
                            {/* Timer Display */}
                            <TimerDisplay
                                studySeconds={state.studySeconds}
                                breakSeconds={state.breakSeconds}
                                mode={state.mode}
                                isBreak={isBreak}
                            />

                            {/* Stats Row */}
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-6 text-center"
                                >
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Study</p>
                                        <p className="text-sm font-semibold text-foreground/80">{formatTime(state.studySeconds)}</p>
                                    </div>
                                    <div className="w-px h-6 bg-border" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Break</p>
                                        <p className="text-sm font-semibold text-foreground/80">{formatTime(state.breakSeconds)}</p>
                                    </div>
                                    <div className="w-px h-6 bg-border" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Focus</p>
                                        <p className="text-sm font-semibold text-foreground/80">{focusRatio}%</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Controls */}
                            <ControlButtons
                                mode={state.mode}
                                onStart={startStudy}
                                onPause={pauseStudy}
                                onResume={resumeStudy}
                                onEnd={endSession}
                            />

                            {/* Idle hint */}
                            {isIdle && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed"
                                >
                                    Start a focused session. Your progress is saved automatically.
                                    <br />
                                    <button
                                        onClick={() => setShowGoalSetter(true)}
                                        className="underline underline-offset-2 mt-1 hover:text-foreground transition-colors"
                                    >
                                        Set goal ({Math.floor(state.totalStudyGoalSeconds / 60)} min)
                                    </button>
                                </motion.p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Goal Setter Modal */}
            <AnimatePresence>
                {showGoalSetter && (
                    <GoalSetter
                        currentGoal={Math.floor(state.totalStudyGoalSeconds / 60)}
                        onSave={(min) => { setGoal(min); setShowGoalSetter(false); }}
                        onClose={() => setShowGoalSetter(false)}
                    />
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="relative z-10 py-4 text-center">
                <p className="text-[10px] text-muted-foreground/50 tracking-wider uppercase">
                    Silence is the canvas of focus
                </p>
            </footer>
        </main>
    );
}
