"use client";

import React from "react";

export function WarmGlow() {
    return (
        <svg
            className="absolute inset-0 w-full h-full animate-glow-breathe"
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id="warm-core" cx="50%" cy="45%" r="38%">
                    <stop offset="0%" stopColor="#fde68a" stopOpacity="0.55" />
                    <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.30" />
                    <stop offset="65%" stopColor="#f97316" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0.04" />
                </radialGradient>
                <radialGradient id="warm-outer" cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.20" />
                    <stop offset="70%" stopColor="#fed7aa" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="800" height="800" fill="url(#warm-outer)" />
            <ellipse cx="400" cy="360" rx="280" ry="240" fill="url(#warm-core)" />
        </svg>
    );
}

export function CoolGlow() {
    return (
        <svg
            className="absolute inset-0 w-full h-full animate-glow-breathe"
            viewBox="0 0 800 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id="cool-core" cx="50%" cy="45%" r="38%">
                    <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.50" />
                    <stop offset="35%" stopColor="#818cf8" stopOpacity="0.28" />
                    <stop offset="65%" stopColor="#67e8f9" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.04" />
                </radialGradient>
                <radialGradient id="cool-outer" cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.18" />
                    <stop offset="70%" stopColor="#ddd6fe" stopOpacity="0.07" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="800" height="800" fill="url(#cool-outer)" />
            <ellipse cx="400" cy="360" rx="280" ry="240" fill="url(#cool-core)" />
        </svg>
    );
}
