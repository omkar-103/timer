"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type TimerMode = "idle" | "study" | "break" | "ended";

export interface TimerState {
    mode: TimerMode;
    studySeconds: number;
    breakSeconds: number;
    totalStudyGoalSeconds: number;
    sessionStartedAt: number | null;
    pausedAt: number | null;
}

const STORAGE_KEY = "deep-work-timer-state";

const defaultState: TimerState = {
    mode: "idle",
    studySeconds: 0,
    breakSeconds: 0,
    totalStudyGoalSeconds: 90 * 60, // 90 min default goal
    sessionStartedAt: null,
    pausedAt: null,
};

function loadState(): TimerState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState;
        const saved = JSON.parse(raw) as TimerState;

        // Reconstruct elapsed time if timer was running when page was closed
        if (saved.mode === "study" && saved.sessionStartedAt && !saved.pausedAt) {
            const elapsed = Math.floor((Date.now() - saved.sessionStartedAt) / 1000);
            const corrected: TimerState = {
                ...saved,
                studySeconds: saved.studySeconds + elapsed,
                sessionStartedAt: saved.sessionStartedAt + (elapsed * 1000),
            };
            return corrected;
        }
        if (saved.mode === "break" && saved.sessionStartedAt && !saved.pausedAt) {
            const elapsed = Math.floor((Date.now() - saved.sessionStartedAt) / 1000);
            return {
                ...saved,
                breakSeconds: saved.breakSeconds + elapsed,
                sessionStartedAt: saved.sessionStartedAt + (elapsed * 1000)
            };
        }
        return saved;
    } catch {
        return defaultState;
    }
}

function saveState(state: TimerState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // silently fail
    }
}

export function useStudyTimer() {
    const [state, setState] = useState<TimerState>(defaultState);
    const [hydrated, setHydrated] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Hydrate from localStorage
    useEffect(() => {
        const loaded = loadState();
        setState(loaded);
        setHydrated(true);
    }, []);

    // Persist on every change
    useEffect(() => {
        if (hydrated) saveState(state);
    }, [state, hydrated]);

    // Tick interval
    const startTick = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setState((prev) => {
                if (!prev.sessionStartedAt || (prev.mode !== "study" && prev.mode !== "break")) return prev;

                const now = Date.now();
                const deltaMs = now - prev.sessionStartedAt;

                if (deltaMs >= 1000) {
                    const elapsedSeconds = Math.floor(deltaMs / 1000);
                    const newSessionStartedAt = prev.sessionStartedAt + (elapsedSeconds * 1000);

                    if (prev.mode === "study") {
                        return { ...prev, studySeconds: prev.studySeconds + elapsedSeconds, sessionStartedAt: newSessionStartedAt };
                    } else if (prev.mode === "break") {
                        return { ...prev, breakSeconds: prev.breakSeconds + elapsedSeconds, sessionStartedAt: newSessionStartedAt };
                    }
                }
                return prev;
            });
        }, 1000);
    }, []);

    const stopTick = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Manage interval based on mode
    useEffect(() => {
        if (!hydrated) return;
        if ((state.mode === "study" || state.mode === "break") && !state.pausedAt) {
            startTick();
        } else {
            stopTick();
        }
        return stopTick;
    }, [state.mode, state.pausedAt, hydrated, startTick, stopTick]);

    // Actions
    const startStudy = useCallback(() => {
        setState((prev) => ({
            ...prev,
            mode: "study",
            sessionStartedAt: Date.now(),
            pausedAt: null,
        }));
    }, []);

    const pauseStudy = useCallback(() => {
        setState((prev) => ({
            ...prev,
            mode: "break",
            pausedAt: null,
            sessionStartedAt: Date.now(),
        }));
    }, []);

    const resumeStudy = useCallback(() => {
        setState((prev) => ({
            ...prev,
            mode: "study",
            pausedAt: null,
            sessionStartedAt: Date.now(),
        }));
    }, []);

    const endSession = useCallback(() => {
        stopTick();
        setState((prev) => ({ ...prev, mode: "ended", pausedAt: Date.now() }));
    }, [stopTick]);

    const resetSession = useCallback(() => {
        stopTick();
        const fresh: TimerState = { ...defaultState };
        setState(fresh);
        saveState(fresh);
    }, [stopTick]);

    const setGoal = useCallback((minutes: number) => {
        setState((prev) => ({ ...prev, totalStudyGoalSeconds: minutes * 60 }));
    }, []);

    const focusRatio =
        state.studySeconds + state.breakSeconds > 0
            ? Math.round((state.studySeconds / (state.studySeconds + state.breakSeconds)) * 100)
            : 0;

    const progressPercent =
        state.totalStudyGoalSeconds > 0
            ? Math.min(100, Math.round((state.studySeconds / state.totalStudyGoalSeconds) * 100))
            : 0;

    return {
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
    };
}

export function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
