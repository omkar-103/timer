"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DayStats,
    getTodayStats,
    getWeeklyStats,
    getFocusStreak,
    formatSeconds,
    formatTimestamp,
    shortDay,
    todayString,
} from "@/lib/analyticsStore";

// ── Animated Counter ──────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, running = true): number {
    const [val, setVal] = useState(0);
    const rafRef = useRef<number | null>(null);
    useEffect(() => {
        if (!running) { setVal(target); return; }
        let start: number | null = null;
        const from = 0;
        function step(ts: number) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(from + (target - from) * ease));
            if (p < 1) rafRef.current = requestAnimationFrame(step);
        }
        rafRef.current = requestAnimationFrame(step);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration, running]);
    return val;
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    icon: string;
    glowColor: string;
    delay?: number;
}

function StatCard({ label, value, icon, glowColor, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring", stiffness: 280, damping: 24 }}
            className="glass-card rounded-2xl p-4 flex flex-col items-center gap-1.5 relative overflow-hidden group"
        >
            {/* subtle glow hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 80%, ${glowColor}22 0%, transparent 70%)` }}
            />
            <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}>{icon}</span>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground text-center leading-tight">{label}</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: glowColor }}>{value}</p>
        </motion.div>
    );
}

// ── Weekly Bar Chart (pure SVG, zero deps) ─────────────────────────────────────

interface BarChartProps {
    weekly: DayStats[];
    selectedDate: string;
    onSelect: (date: string) => void;
}

function WeeklyBarChart({ weekly, selectedDate, onSelect }: BarChartProps) {
    const maxStudy = Math.max(...weekly.map((d) => d.totalStudy), 1);
    const today = todayString();
    const BAR_H = 80;

    return (
        <div className="space-y-2">
            <div className="flex items-end gap-2 h-[100px]">
                {weekly.map((day, i) => {
                    const pct = day.totalStudy / maxStudy;
                    const barH = Math.max(pct * BAR_H, day.totalStudy > 0 ? 4 : 2);
                    const isToday = day.date === today;
                    const isSelected = day.date === selectedDate;

                    const warmGrad = "linear-gradient(180deg, #fbbf24 0%, #f97316 100%)";
                    const coolGrad = "linear-gradient(180deg, #818cf8 0%, #a78bfa 100%)";
                    const dimGrad = "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)";

                    const grad = isSelected ? warmGrad : isToday ? coolGrad : day.totalStudy > 0 ? warmGrad : dimGrad;

                    return (
                        <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                            onClick={() => onSelect(day.date)}
                            role="button"
                            aria-label={`Select ${day.date}`}
                        >
                            <div className="w-full flex items-end justify-center" style={{ height: `${BAR_H}px` }}>
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: barH, opacity: 1 }}
                                    transition={{ delay: i * 0.06, duration: 0.6, ease: "easeOut" }}
                                    className="w-full rounded-t-md relative overflow-hidden"
                                    style={{
                                        background: grad,
                                        boxShadow: isSelected
                                            ? "0 0 12px rgba(251,191,36,0.6)"
                                            : isToday
                                            ? "0 0 8px rgba(129,140,248,0.4)"
                                            : "none",
                                    }}
                                >
                                    {/* shimmer on selected */}
                                    {isSelected && (
                                        <motion.div
                                            className="absolute inset-0"
                                            style={{
                                                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                                                backgroundSize: "200% 100%",
                                            }}
                                            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                </motion.div>
                            </div>
                            <p className={`text-[9px] tracking-wide transition-colors ${isSelected ? "text-amber-400 font-semibold" : isToday ? "text-violet-400 font-semibold" : "text-muted-foreground"}`}>
                                {shortDay(day.date)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Session Timeline ───────────────────────────────────────────────────────────

interface TimelineProps {
    sessions: DayStats["sessions"];
}

function SessionTimeline({ sessions }: TimelineProps) {
    if (sessions.length === 0) {
        return (
            <p className="text-xs text-muted-foreground text-center py-4">No sessions for this day.</p>
        );
    }

    return (
        <div className="relative pl-5 space-y-3">
            {/* vertical line */}
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-amber-400/60 via-violet-400/30 to-transparent" />

            {sessions.map((s, i) => (
                <motion.div
                    key={s.timestamp}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                    className="relative flex items-start gap-3"
                >
                    {/* dot */}
                    <div className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />

                    <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-3 w-full">
                        <div>
                            <p className="text-[10px] text-muted-foreground">{formatTimestamp(s.timestamp)}</p>
                            <p className="text-xs font-semibold text-foreground/80">
                                <span className="text-amber-400">{formatSeconds(s.study)}</span>
                                <span className="text-muted-foreground mx-1">study</span>
                                {s.break > 0 && (
                                    <>
                                        · <span className="text-violet-400">{formatSeconds(s.break)}</span>
                                        <span className="text-muted-foreground ml-1">break</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

interface StatsModalProps {
    onClose: () => void;
}

export function StatsModal({ onClose }: StatsModalProps) {
    const today = todayString();
    const [todayStats, setTodayStats] = useState<DayStats | null>(null);
    const [weekly, setWeekly] = useState<DayStats[]>([]);
    const [selectedDate, setSelectedDate] = useState(today);
    const [streak, setStreak] = useState(0);

    // Load data once modal opens
    useEffect(() => {
        setTodayStats(getTodayStats());
        setWeekly(getWeeklyStats());
        setStreak(getFocusStreak());
    }, []);

    // Close on backdrop click / Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const selectedDay = weekly.find((d) => d.date === selectedDate) ?? todayStats;

    // Count-up values for today
    const studyMin = Math.floor((todayStats?.totalStudy ?? 0) / 60);
    const breakMin = Math.floor((todayStats?.totalBreak ?? 0) / 60);
    const countStudy = useCountUp(studyMin, 800);
    const countBreak = useCountUp(breakMin, 800);
    const countSessions = useCountUp(todayStats?.sessions.length ?? 0, 600);
    const countFocus = useCountUp(todayStats?.focusRatio ?? 0, 900);

    const isSelectedToday = selectedDate === today;

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                key="stats-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
                onClick={onClose}
            >
                {/* Frosted blur overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                {/* Panel */}
                <motion.div
                    key="stats-panel"
                    initial={{ opacity: 0, y: 60, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="relative z-10 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
                    style={{
                        background: "var(--color-background, oklch(0.10 0.008 260))",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 0 60px rgba(251,191,36,0.06)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Glow strip top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                    <div className="px-6 pt-6 pb-8 space-y-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Analytics</p>
                                <h2 className="text-base font-bold text-foreground">Deep Work Stats</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                {streak > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                                        style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)", boxShadow: "0 0 16px rgba(251,191,36,0.4)" }}
                                    >
                                        <span className="text-xs">🔥</span>
                                        <span className="text-[10px] font-bold text-white">{streak}d Streak</span>
                                    </motion.div>
                                )}
                                <button
                                    id="btn-close-stats"
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors text-sm cursor-pointer"
                                    aria-label="Close stats"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/60" />

                        {/* Today's Summary */}
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                                Today — {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                            <div className="grid grid-cols-4 gap-2">
                                <StatCard label="Study" value={`${countStudy}m`} icon="◉" glowColor="#fbbf24" delay={0.05} />
                                <StatCard label="Break" value={`${countBreak}m`} icon="◎" glowColor="#818cf8" delay={0.1} />
                                <StatCard label="Sessions" value={`${countSessions}`} icon="◈" glowColor="#34d399" delay={0.15} />
                                <StatCard label="Focus" value={`${countFocus}%`} icon="◆" glowColor="#f97316" delay={0.2} />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/60" />

                        {/* Weekly Chart */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Last 7 Days</p>
                                <p className="text-[9px] text-muted-foreground">
                                    {selectedDay && selectedDay.totalStudy > 0
                                        ? `${shortDay(selectedDate)}: ${formatSeconds(selectedDay.totalStudy)}`
                                        : "Click a bar to inspect"}
                                </p>
                            </div>
                            {weekly.length > 0 && (
                                <WeeklyBarChart
                                    weekly={weekly}
                                    selectedDate={selectedDate}
                                    onSelect={setSelectedDate}
                                />
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/60" />

                        {/* Selected Day Detail */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                                    {isSelectedToday ? "Today's Sessions" : `${shortDay(selectedDate)} Sessions`}
                                </p>
                                {selectedDay && selectedDay.totalStudy > 0 && (
                                    <div className="flex gap-3 text-[10px]">
                                        <span className="text-amber-400 font-medium">{formatSeconds(selectedDay.totalStudy)} study</span>
                                        {selectedDay.totalBreak > 0 && (
                                            <span className="text-violet-400 font-medium">{formatSeconds(selectedDay.totalBreak)} break</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <SessionTimeline sessions={selectedDay?.sessions ?? []} />
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
