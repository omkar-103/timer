"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GoalSetterProps {
    currentGoal: number;
    onSave: (minutes: number) => void;
    onClose: () => void;
}

const PRESET_MINUTES = [25, 45, 60, 90, 120];

export function GoalSetter({ currentGoal, onSave, onClose }: GoalSetterProps) {
    const [value, setValue] = useState(currentGoal);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />

            {/* Sheet */}
            <motion.div
                className="relative z-10 w-full max-w-sm mx-auto glass-card rounded-t-3xl sm:rounded-3xl p-6 m-0 sm:m-4"
                initial={{ y: "100%", scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: "100%", scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-foreground">Set Study Goal</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none transition-colors">×</button>
                </div>

                {/* Presets */}
                <div className="flex gap-2 flex-wrap mb-5">
                    {PRESET_MINUTES.map((m) => (
                        <button
                            key={m}
                            onClick={() => setValue(m)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer ${value === m
                                    ? "bg-amber-500 border-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                                    : "border-border text-muted-foreground hover:border-amber-400 hover:text-amber-500"
                                }`}
                        >
                            {m}m
                        </button>
                    ))}
                </div>

                {/* Custom slider */}
                <div className="mb-6">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">
                        Custom — {value} minutes
                    </label>
                    <input
                        type="range"
                        min={10}
                        max={240}
                        step={5}
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>10m</span>
                        <span>240m</span>
                    </div>
                </div>

                <motion.button
                    id="btn-save-goal"
                    onClick={() => onSave(value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_32px_rgba(245,158,11,0.5)] transition-all duration-300 cursor-pointer"
                >
                    Save Goal
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
