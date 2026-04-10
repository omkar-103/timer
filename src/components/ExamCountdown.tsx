"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getExamsWithDetails,
    formatSmartCountdown,
    ExamWithDetails,
} from "@/lib/examSchedule";

// ── Shared Hook for Live Tick ─────────────────────────────────────────────────

export function useExamTick() {
    const [exams, setExams] = useState<ExamWithDetails[]>([]);
    const [current, setCurrent] = useState<ExamWithDetails | null>(null);

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const all = getExamsWithDetails(now);
            setExams(all);
            setCurrent(all.find((e) => e.status === "current") ?? null);
        };
        update();
        const interval = setInterval(update, 30000); // 30s ensures minutes update reliably
        return () => clearInterval(interval);
    }, []);

    return { exams, current };
}

// ── Node Design ───────────────────────────────────────────────────────────────

interface ExamNodeProps {
    exam: ExamWithDetails;
    forceFaded?: boolean;
    isHorizontal?: boolean;
}

function ExamNode({ exam, forceFaded = false, isHorizontal = false }: ExamNodeProps) {
    const isCurrent = exam.status === "current";
    const visuallyPast = forceFaded || exam.status === "past";

    const nodeColor = isCurrent
        ? "#f59e0b"
        : visuallyPast
        ? "rgba(128,128,128,0.25)"
        : "rgba(148,163,184,0.45)";

    const textColor = isCurrent
        ? "#fbbf24" // Bright popup text for current
        : visuallyPast
        ? "rgba(128,128,128,0.6)"
        : "rgba(148,163,184,0.9)";

    const timeStr = formatSmartCountdown(exam.msRemaining);

    // Strict Opacity Rule: 50% for left side, 100% for right side
    const OPACITY = visuallyPast ? 0.5 : 1;

    // Shift current subject slightly closer to center on the right side
    // Since right side pulls from right, a negative translate X pulls it leftwards (towards center)
    const shiftToCenter = isCurrent && !isHorizontal ? "-24px" : "0px";

    return (
        <motion.div
            layout
            className="flex flex-col items-center flex-shrink-0"
            style={{ 
                opacity: OPACITY,
                x: shiftToCenter, // Moves current subject toward the timer
            }}
        >
            {/* The Huge Floating Circle */}
            <motion.div
                className={`
                    flex items-center justify-center relative rounded-full 
                    ${isHorizontal
                        ? (isCurrent ? 'w-[74px] h-[74px]' : 'w-[64px] h-[64px]')
                        : (isCurrent ? 'w-[100px] h-[100px] lg:w-[130px] lg:h-[130px]' : 'w-[80px] h-[80px] lg:w-[110px] lg:h-[110px]')
                    }
                `}
                animate={{
                    scale: isCurrent ? [1, 1.04, 1] : 1,
                    boxShadow: isCurrent
                        ? [
                              `0 0 0 2px rgba(245,158,11,0.5), 0 0 32px 6px rgba(245,158,11,0.3)`,
                              `0 0 0 3px rgba(245,158,11,0.7), 0 0 48px 12px rgba(245,158,11,0.15)`,
                              `0 0 0 2px rgba(245,158,11,0.5), 0 0 32px 6px rgba(245,158,11,0.3)`,
                          ]
                        : `0 0 0 1.5px ${nodeColor}`,
                }}
                transition={
                    isCurrent
                        ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.2 }
                }
                whileHover={{ scale: 1.05 }}
                style={{
                    background: isCurrent
                        ? "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.05) 100%)"
                        : "transparent",
                    backdropFilter: isCurrent ? "blur(12px)" : "none",
                }}
            >
                {/* Subject Code inside Circle */}
                <span
                    className={`
                        font-bold tracking-tight text-center leading-none
                        ${isHorizontal
                          ? (isCurrent ? 'text-xl' : 'text-lg')
                          : (isCurrent ? 'text-3xl lg:text-4xl' : 'text-2xl lg:text-3xl')
                        }
                    `}
                    style={{ color: textColor }}
                >
                    {exam.short}
                </span>

                {/* Intense Glowing Pulse Ring for Current Focus */}
                {isCurrent && (
                    <motion.span
                        style={{ position: "absolute", inset: -14, borderRadius: "50%" }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    >
                        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
                            <circle cx="50" cy="50" r="48" stroke="#fbbf24" strokeWidth="2" strokeDasharray="8 20" strokeLinecap="round" opacity="0.6" fill="none" />
                        </svg>
                    </motion.span>
                )}
            </motion.div>

            <div className={`flex flex-col items-center justify-center gap-1.5 ${isHorizontal ? 'mt-2' : 'mt-4'}`}>
                {/* Date Label EX: 04/16 */}
                <span
                    className="tracking-widest uppercase font-semibold"
                    style={{
                        fontSize: isHorizontal ? 10 : 13,
                        color: isCurrent ? "#fbbf24" : "rgba(128,128,128,0.55)",
                        letterSpacing: "0.1em"
                    }}
                >
                    {exam.date.slice(5).replace("-", "/")}
                </span>
                
                {/* FULL Countdown */}
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`tabular-nums whitespace-nowrap font-bold ${isCurrent ? 'text-sm lg:text-[15px]' : 'text-xs lg:text-[13px]'}`}
                    style={{ color: isCurrent ? "#fbbf24" : "rgba(203,213,225,0.7)" }}
                >
                    {timeStr}
                </motion.span>
            </div>
        </motion.div>
    );
}

// ── Smart Center Text Below Timer ─────────────────────────────────────────────

export function CurrentSubjectFocus() {
    const { current } = useExamTick();
    if (!current) return null; // Wait for data

    const timeStr = formatSmartCountdown(current.msRemaining);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center pt-5 pb-2"
        >
            <div className="text-[12px] lg:text-[14px] text-muted-foreground tracking-wide flex items-center justify-center flex-wrap gap-x-3 gap-y-1">
                <span className="opacity-70 uppercase tracking-widest text-[11px] lg:text-[12px]">Focus:</span>
                <span className="text-foreground font-bold">{current.subject}</span>
                <span className="opacity-40 mx-0.5">•</span>
                <span className="text-amber-400 font-bold tabular-nums">
                    {timeStr}
                </span>
            </div>
        </motion.div>
    );
}

// ── Idle Full Horizontal Timeline (Before starting focus) ─────────────────────

export function IdleHorizontalTimeline() {
    const { exams } = useExamTick();
    if (!exams.length) return null;

    return (
        <div className="w-full overflow-x-auto pb-6 pt-4 no-scrollbar">
            <div className="flex items-center justify-center min-w-max mx-auto px-4 gap-8">
                {exams.map((exam, i) => (
                    <React.Fragment key={`idle-${exam.date}`}>
                        <ExamNode exam={exam} isHorizontal />
                        {i < exams.length - 1 && (
                            <div className="w-10 h-[2px]" style={{ background: "rgba(128,128,128,0.15)", transform: "translateY(-22px)", borderRadius: "2px" }} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

// ── Active Mode 3 Fixed Zones (Desktop/Tablet) + Row (Mobile) ─────────────

export function ActiveExamLayout() {
    const { exams, current } = useExamTick();
    if (exams.length !== 6) return null; // Strict rule: Total = 6 subjects always visible

    const curIndex = current ? exams.findIndex(e => e.date === current.date) : 0;
    const stableIndex = curIndex === -1 ? 0 : curIndex;

    // Strict Layout: 3 LEFT, 3 RIGHT
    // We treat the current subject as the anchor for the right side
    const rightCount = 3;
    const leftCount = 3; 

    // Extract exact 3 right elements (circular if necessary)
    const right: ExamWithDetails[] = [];
    for (let i = 0; i < rightCount; i++) {
        right.push(exams[(stableIndex + i) % 6]);
    }

    // Extract exact 3 left elements (circular if necessary)
    const left: ExamWithDetails[] = [];
    for (let i = leftCount; i > 0; i--) {
        left.push(exams[(stableIndex - i + 6) % 6]);
    }

    const mobileOrder = [...left, ...right];

    return (
        <>
            {/* ── LEFT SIDE (Past Exams constraint) ── */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="hidden md:flex flex-col items-center justify-center gap-12 absolute left-[8vw] lg:left-[10vw] xl:left-[14vw] top-1/2 -translate-y-1/2 pointer-events-auto"
                >
                    {left.map(exam => <ExamNode key={`left-${exam.date}`} exam={exam} forceFaded={true} />)}
                </motion.div>
            </AnimatePresence>

            {/* ── RIGHT SIDE (Upcoming Exams constraint) ── */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="hidden md:flex flex-col items-center justify-center gap-12 absolute right-[8vw] lg:right-[10vw] xl:right-[14vw] top-1/2 -translate-y-1/2 pointer-events-auto"
                >
                    {right.map(exam => <ExamNode key={`right-${exam.date}`} exam={exam} />)}
                </motion.div>
            </AnimatePresence>

            {/* ── MOBILE FALLBACK ── */}
            <div className="md:hidden w-full overflow-x-auto pb-4 pt-4 no-scrollbar">
                <div className="flex justify-center min-w-max mx-auto px-6">
                    <div className="flex items-center gap-6">
                        {mobileOrder.map((exam) => (
                            <ExamNode key={`mobile-${exam.date}`} exam={exam} isHorizontal forceFaded={left.some(e => e.date === exam.date)} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

// ── Compact Countdown (UNUSED) ────────────────────────────────────────────────
export function CompactCountdown() {
    return null;
}
