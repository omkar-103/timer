// Exam schedule data + smart helper functions
export interface Exam {
    date: string;          // "YYYY-MM-DD"
    subject: string;       // Full name
    short: string;         // Abbreviation for timeline
    isHoliday?: boolean;
}

// ── Schedule ──────────────────────────────────────────────────────────────────
export const EXAM_SCHEDULE: Exam[] = [
    { date: "2026-04-16", subject: "Information Retrieval",         short: "IR"   },
    { date: "2026-04-17", subject: "Cloud Computing",               short: "CC"   },
    { date: "2026-04-18", subject: "Customer Relationship Mgmt",    short: "CRM"  },
    { date: "2026-04-19", subject: "Holiday",                       short: "—",   isHoliday: true },
    { date: "2026-04-20", subject: "Ethical Hacking",               short: "EH"   },
    { date: "2026-04-21", subject: "Data Science",                  short: "DS"   },
];

// ── Core Logic ────────────────────────────────────────────────────────────────

// Exams are at 11:00 AM
export function getExamTargetDate(dateStr: string): Date {
    return new Date(`${dateStr}T11:00:00`);
}

export type ExamStatus = "past" | "current" | "upcoming";

export interface ExamWithDetails extends Exam {
    status: ExamStatus;
    msRemaining: number;
}

export function getExamsWithDetails(now: Date = new Date()): ExamWithDetails[] {
    const list: ExamWithDetails[] = EXAM_SCHEDULE.map((e) => {
        const target = getExamTargetDate(e.date);
        const msRemaining = target.getTime() - now.getTime();
        
        let status: ExamStatus = "upcoming";
        // It becomes "past" exactly after its 11:00 AM passes
        if (msRemaining < 0) {
            status = "past";
        }
        return { ...e, status, msRemaining };
    });

    // Mark the VERY FIRST non-holiday "upcoming" exam as "current"
    let foundCurrent = false;
    return list.map(exam => {
        if (!foundCurrent && exam.status === "upcoming" && !exam.isHoliday) {
            exam.status = "current";
            foundCurrent = true;
        } else if (exam.isHoliday && exam.status !== "past") {
            // keep holidays as upcoming to fade them or keep them neutral
            exam.status = "upcoming";
        }
        return exam;
    });
}

export function getCurrentSubject(now: Date = new Date()): ExamWithDetails | null {
    const all = getExamsWithDetails(now);
    return all.find(e => e.status === "current") ?? null;
}

// ── Smart Time Formatter ──────────────────────────────────────────────────────

export function formatSmartCountdown(msRemaining: number): string {
    const clampedMs = Math.max(0, msRemaining);
    const days = Math.floor(clampedMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((clampedMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((clampedMs % (1000 * 60 * 60)) / (1000 * 60));

    // STRICT FORMAT RULE: Always show days + hours + minutes. No shortcuts.
    return `${days}d ${hours}h ${mins}m left`;
}

export function isExamUrgent(msRemaining: number): boolean {
    // Glow/warn if less than 2 days
    return msRemaining < 2 * 24 * 60 * 60 * 1000;
}

/** Format a date string to readable "16 April" */
export function formatExamDate(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
