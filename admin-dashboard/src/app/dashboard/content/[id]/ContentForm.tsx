// src/app/dashboard/content/[id]/ContentForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSaveContent } from "@/lib/query/content.queries";
import { Content } from "@/types/content";
import { Box, Button, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";

interface ContentFormProps {
  initialContent?: Content | null;
  onSaved?: () => void;
}

export default function ContentForm({
  initialContent,
  onSaved,
}: ContentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState<Content>({
    id: "",
    title: "",
    blocks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const saveContentMutation = useSaveContent();

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveContentMutation.mutateAsync(content);

      if (onSaved) {
        onSaved();
      } else {
        router.push("/dashboard/content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid size={{xs: 12, md: 6}}>
          <TextField
            required
            id="title"
            name="title"
            label="Title"
            fullWidth
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
          />
        </Grid>

        {/* Additional content fields would go here */}
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={saveContentMutation.isPending}
        >
          {saveContentMutation.isPending ? "Saving..." : "Save Content"}
        </Button>
      </Box>
    </Box>
  );
}
