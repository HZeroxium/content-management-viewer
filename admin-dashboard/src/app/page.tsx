// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Using replace to avoid having login page in history
    router.replace("/login");
  }, [router]);

  return null;
}
