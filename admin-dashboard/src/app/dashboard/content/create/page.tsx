// src/app/dashboard/content/create/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, CircularProgress } from "@mui/material";

export default function CreateContentPage() {
  const router = useRouter();

  // Redirect to the content detail page with "new" as ID
  // This avoids the conflict with the static "create" route
  useEffect(() => {
    router.replace("/dashboard/content/new");
  }, [router]);

  return (
    <Container sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress />
    </Container>
  );
}
