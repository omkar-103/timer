"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [25, 45, 60, 90, 120];

interface InlineGoalSetterProps {
    goalMinutes: number;
    onGoalChange: (minutes: number) => void;
    isBreak?: boolean;
}

// ---------- Orbit Ring ----------
// A slowly-rotating dashed SVG ring that wraps the active circle
function OrbitRing({ accent }: { accent: string }) {
    return (
        <motion.span
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
                opacity: { duration: 0.3 },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            }}
            style={{ position: "absolute", inset: -6 }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: "absolute", inset: 0 }}
            >
                <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke={accent}
                    strokeWidth="1.2"
                    strokeDasharray="6 8"
                    strokeLinecap="round"
                    opacity="0.55"
                />
            </svg>
        </motion.span>
    );
}

// ---------- Pulse Ring ----------
// A slow breathing glow ring underneath the active circle
function PulseRing({ accent }: { accent: string }) {
    return (
        <motion.span
            className="absolute rounded-full pointer-events-none"
            style={{
                inset: -4,
                background: "transparent",
                boxShadow: `0 0 0 1.5px ${accent}44`,
            }}
            animate={{
                boxShadow: [
                    `0 0 0 2px ${accent}44, 0 0 16px 4px ${accent}22`,
                    `0 0 0 4px ${accent}22, 0 0 26px 8px ${accent}11`,
                    `0 0 0 2px ${accent}44, 0 0 16px 4px ${accent}22`,
                ],
                scale: [1, 1.06, 1],
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
    );
}

// ---------- Circle Button ----------
interface CircleButtonProps {
    minutes: number;
    active: boolean;
    accent: string;
    onSelect: (m: number) => void;
    index: number;
}

function CircleButton({ minutes, active, accent, onSelect, index }: CircleButtonProps) {
    return (
        <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            style={{ width: 60, height: 60 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.07, type: "spring", stiffness: 300, damping: 22 }}
        >
            {/* Orbit ring around active */}
            <AnimatePresence>
                {active && <OrbitRing accent={accent} key="orbit" />}
            </AnimatePresence>

            {/* Pulse glow under active */}
            <AnimatePresence>
                {active && <PulseRing accent={accent} key="pulse" />}
            </AnimatePresence>

            {/* The circle itself */}
            <motion.button
                id={`btn-preset-${minutes}`}
                aria-label={`Set goal to ${minutes} minutes`}
                onClick={() => onSelect(minutes)}
                whileHover={{ scale: active ? 1.08 : 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 450, damping: 18 }}
                animate={{
                    scale: active ? 1.06 : 1,
                    backgroundColor: active ? accent : "transparent",
                }}
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: active ? `1.5px solid ${accent}` : "1.5px solid rgba(128,128,128,0.2)",
                    boxShadow: active
                        ? `0 0 0 2px ${accent}28, 0 0 24px 4px ${accent}38, 0 4px 16px ${accent}30`
                        : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                }}
                className="no-select"
            >
                <motion.span
                    animate={{
                        color: active ? "#fff" : undefined,
                        fontWeight: active ? 700 : 500,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-[11px] tracking-wide text-muted-foreground"
                    style={active ? { color: "#fff" } : {}}
                >
                    {minutes}m
                </motion.span>
            </motion.button>
        </motion.div>
    );
}

// ---------- Main Component ----------
export function InlineGoalSetter({ goalMinutes, onGoalChange, isBreak = false }: InlineGoalSetterProps) {
    const accent = isBreak ? "#8b5cf6" : "#f59e0b";
    const isPreset = PRESETS.includes(goalMinutes);
    const sliderPct = ((goalMinutes - 10) / (240 - 10)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="w-full max-w-sm mx-auto flex flex-col items-center gap-5"
        >
            {/* Section label */}
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">
                Study Goal
            </p>

            {/* Circular preset buttons */}
            <div className="flex items-center justify-center gap-3">
                {PRESETS.map((m, i) => (
                    <CircleButton
                        key={m}
                        minutes={m}
                        active={goalMinutes === m}
                        accent={accent}
                        onSelect={onGoalChange}
                        index={i}
                    />
                ))}
            </div>

            {/* Slider + label */}
            <div className="w-full space-y-2.5 px-1">
                <div className="relative w-full">
                    {/* Filled track overlay */}
                    <div
                        className="absolute top-1/2 left-0 h-[3px] rounded-full pointer-events-none"
                        style={{
                            width: `${sliderPct}%`,
                            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
                            transform: "translateY(-50%)",
                            transition: "width 0.08s ease",
                        }}
                    />
                    <input
                        id="goal-slider"
                        type="range"
                        min={10}
                        max={240}
                        step={5}
                        value={goalMinutes}
                        onChange={(e) => onGoalChange(Number(e.target.value))}
                        className="goal-slider w-full cursor-pointer"
                        style={{ "--slider-accent": accent } as React.CSSProperties}
                    />
                </div>

                {/* Dynamic label row */}
                <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground/40">10m</span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={goalMinutes}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.14 }}
                            className="text-[10px] font-semibold tracking-wider"
                            style={{ color: isPreset ? "var(--muted-foreground)" : accent }}
                        >
                            {isPreset ? `${goalMinutes} min` : `Custom · ${goalMinutes} min`}
                        </motion.span>
                    </AnimatePresence>
                    <span className="text-[9px] text-muted-foreground/40">240m</span>
                </div>
            </div>
        </motion.div>
    );
}
