// src/app/dashboard/content/create/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Container, CircularProgress } from "@mui/material";

export default function CreateContentPage() {
  const router = useRouter();

  // Simply redirect to the content editor with "create" as ID
  React.useEffect(() => {
    router.replace("/dashboard/content/create");
  }, [router]);

  return (
    <Container sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress />
    </Container>
  );
}
