// src/app/dashboard/content/[id]/ContentForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateContent,
  useUpdateContent,
} from "@/lib/hooks/api/useContents";
import {
  ContentResponseDto,
  UpdateContentDto,
  CreateContentWithBlocksDto,
} from "@/lib/types/content";
import { Box, Button, TextField, Alert } from "@mui/material";
import Grid from "@mui/material/Grid";

interface ContentFormProps {
  initialContent?: ContentResponseDto | null;
  isEditMode?: boolean;
  contentId?: string;
  onSaved?: () => void;
}

export default function ContentForm({
  initialContent,
  isEditMode = false,
  contentId,
  onSaved,
}: ContentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState<ContentResponseDto>({
    id: "",
    title: "",
    description: "",
    blocks: [],
    metadata: { status: "draft" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "",
    updatedBy: "",
    deletedAt: null,
    deletedBy: null,
  });
  const [error, setError] = useState<string | null>(null);

  // Use the appropriate mutation hook based on whether we're creating or updating
  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent(contentId || "");

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditMode && contentId) {
        // For updating existing content
        const updateDto: UpdateContentDto = {
          title: content.title,
          description: content.description,
          blocks: content.blocks,
          metadata: content.metadata,
        };

        await updateContentMutation.mutateAsync(updateDto);
      } else {
        // For creating new content
        const createDto: CreateContentWithBlocksDto = {
          title: content.title,
          description: content.description,
          blocks: content.blocks || [],
          metadata: content.metadata,
        };

        await createContentMutation.mutateAsync(createDto);
      }

      if (onSaved) {
        onSaved();
      } else {
        router.push("/dashboard/content");
      }
    } catch (err) {
      console.error("Error saving content:", err);
      setError(err instanceof Error ? err.message : "Failed to save content");
    }
  };

  const isPending =
    createContentMutation.isPending || updateContentMutation.isPending;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
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

        <Grid size={{ xs: 12 }}>
          <TextField
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={content.description || ""}
            onChange={(e) =>
              setContent({ ...content, description: e.target.value })
            }
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          color="primary"
        >
          {isPending
            ? "Saving..."
            : isEditMode
            ? "Update Content"
            : "Create Content"}
        </Button>
      </Box>
    </Box>
  );
}
