"use client";

export interface SessionRecord {
    date: string;       // "YYYY-MM-DD"
    study: number;      // seconds
    break: number;      // seconds
    timestamp: number;  // epoch ms (session end time)
}

export interface DayStats {
    date: string;
    totalStudy: number;
    totalBreak: number;
    sessions: SessionRecord[];
    focusRatio: number;
}

const ANALYTICS_KEY = "deep-work-analytics";

// ── Read / Write ────────────────────────────────────────────────────────────

export function loadSessions(): SessionRecord[] {
    try {
        const raw = localStorage.getItem(ANALYTICS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed.sessions) ? parsed.sessions : [];
    } catch {
        return [];
    }
}

export function saveSession(studySeconds: number, breakSeconds: number): void {
    if (studySeconds <= 0) return; // Skip trivial sessions
    try {
        const sessions = loadSessions();
        const now = Date.now();
        const date = toDateString(new Date(now));
        const record: SessionRecord = {
            date,
            study: studySeconds,
            break: breakSeconds,
            timestamp: now,
        };
        sessions.push(record);
        localStorage.setItem(ANALYTICS_KEY, JSON.stringify({ sessions }));
    } catch {
        // silently fail
    }
}

// ── Utilities ────────────────────────────────────────────────────────────────

export function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function todayString(): string {
    return toDateString(new Date());
}

export function groupSessionsByDate(sessions: SessionRecord[]): Record<string, SessionRecord[]> {
    return sessions.reduce<Record<string, SessionRecord[]>>((acc, s) => {
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
    }, {});
}

// ── Aggregates ────────────────────────────────────────────────────────────────

export function getTodayStats(): DayStats {
    const today = todayString();
    const sessions = loadSessions().filter((s) => s.date === today);
    return buildDayStats(today, sessions);
}

export function getWeeklyStats(): DayStats[] {
    const sessions = loadSessions();
    const grouped = groupSessionsByDate(sessions);
    const result: DayStats[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = toDateString(d);
        result.push(buildDayStats(ds, grouped[ds] ?? []));
    }
    return result;
}

function buildDayStats(date: string, sessions: SessionRecord[]): DayStats {
    const totalStudy = sessions.reduce((a, s) => a + s.study, 0);
    const totalBreak = sessions.reduce((a, s) => a + s.break, 0);
    const focusRatio =
        totalStudy + totalBreak > 0
            ? Math.round((totalStudy / (totalStudy + totalBreak)) * 100)
            : 0;
    return { date, totalStudy, totalBreak, sessions, focusRatio };
}

// ── Streak ────────────────────────────────────────────────────────────────────

export function getFocusStreak(): number {
    const sessions = loadSessions();
    if (!sessions.length) return 0;

    const grouped = groupSessionsByDate(sessions);
    let streak = 0;

    for (let i = 0; ; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = toDateString(d);
        if (grouped[ds] && grouped[ds].length > 0) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatSeconds(s: number): string {
    if (s <= 0) return "0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
}

export function formatTimestamp(ts: number): string {
    const d = new Date(ts);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

export function shortDay(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short" });
}
