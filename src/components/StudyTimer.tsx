"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyTimer, formatTime } from "@/hooks/useStudyTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressBar } from "@/components/ProgressBar";
import { TimerDisplay } from "@/components/TimerDisplay";
import { ControlButtons } from "@/components/ControlButtons";
import { SessionSummary } from "@/components/SessionSummary";
import { InlineGoalSetter } from "@/components/InlineGoalSetter";
import { WarmGlow, CoolGlow } from "@/components/GlowEffects";
import { StatsModal } from "@/components/StatsModal";
import { IdleHorizontalTimeline, ActiveExamLayout, CurrentSubjectFocus, CompactCountdown } from "@/components/ExamCountdown";

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

    const [showStats, setShowStats] = useState(false);
    const isStudy = state.mode === "study";
    const isBreak = state.mode === "break";
    const isEnded = state.mode === "ended";
    const isIdle = state.mode === "idle";
    const isActive = isStudy || isBreak;

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                if (state.mode === "idle") startStudy();
                else if (state.mode === "study") pauseStudy();
                else if (state.mode === "break") resumeStudy();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [state.mode, startStudy, pauseStudy, resumeStudy]);

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
                    <CompactCountdown />
                    {/* View Stats button */}
                    <motion.button
                        id="btn-view-stats"
                        onClick={() => setShowStats(true)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                        aria-label="View analytics"
                        title="View Stats"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 dark:hover:bg-amber-400/10 transition-all duration-200 cursor-pointer text-sm relative group"
                    >
                        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "0 0 12px rgba(251,191,36,0.35)" }} />
                        <span>📊</span>
                    </motion.button>
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
                    onGoalClick={() => {}}
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

                            {/* Stats Row — only while active */}
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

                            {/* Exam Info / Smart Nudge during active timer */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        key="smart-nudge"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="w-full overflow-hidden"
                                    >
                                        <CurrentSubjectFocus />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Exam Timeline — only when idle */}
                            <AnimatePresence>
                                {isIdle && (
                                    <motion.div
                                        key="exam-timeline"
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full pt-4 pb-2"
                                    >
                                        <IdleHorizontalTimeline />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Inline Goal Setter — only when idle */}
                            <AnimatePresence>
                                {isIdle && (
                                    <motion.div
                                        key="inline-goal"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <InlineGoalSetter
                                            goalMinutes={Math.floor(state.totalStudyGoalSeconds / 60)}
                                            onGoalChange={setGoal}
                                            isBreak={false}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                                </motion.p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Active Exam Layout (Left/Right desktop, scroll row mobile) */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        key="active-exam-layout"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 pointer-events-none z-0"
                    >
                        <ActiveExamLayout />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Modal */}
            <AnimatePresence>
                {showStats && (
                    <StatsModal onClose={() => setShowStats(false)} />
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
