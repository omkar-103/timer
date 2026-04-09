"use client";

import dynamic from "next/dynamic";

const StudyTimer = dynamic(() => import("@/components/StudyTimer"), {
  ssr: false,
});

export default function HomePage() {
  return <StudyTimer />;
}
