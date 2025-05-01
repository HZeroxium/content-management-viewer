// src/app/dashboard/content/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useContent,
  useSaveContent,
  useDeleteContent,
} from "@/lib/query/content.queries";
import { Content } from "@/types/content";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;
  const isEditMode = id !== "create";

  const [content, setContent] = useState<Content | null>(null);
  const { data, isLoading } = useContent(isEditMode ? id : "");

  const saveContentMutation = useSaveContent();
  const deleteContentMutation = useDeleteContent();

  useEffect(() => {
    if (data && isEditMode) {
      setContent(data);
    } else if (!isEditMode) {
      // Initialize new content object when in create mode
      setContent({
        id: "",
        title: "",
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [data, isEditMode]);

  const handleSave = async () => {
    if (!content) return;

    try {
      await saveContentMutation.mutateAsync(content);
      router.push("/dashboard/content");
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleDelete = async () => {
    if (!content?.id) return;

    if (window.confirm("Are you sure you want to delete this content?")) {
      try {
        await deleteContentMutation.mutateAsync(content.id);
        router.push("/dashboard/content");
      } catch (error) {
        console.error("Error deleting content:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5">
            {isEditMode
              ? `Edit Content: ${content?.title}`
              : "Create New Content"}
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saveContentMutation.isPending}
              sx={{ mr: 1 }}
            >
              {saveContentMutation.isPending ? "Saving..." : "Save"}
            </Button>
            {isEditMode && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={deleteContentMutation.isPending}
              >
                {deleteContentMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Title"
              fullWidth
              value={content?.title || ""}
              onChange={(e) =>
                setContent((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
            />
          </Grid>

          {/* Add more form fields for content editing as needed */}
          {/* Content blocks editing would go here */}
        </Grid>
      </Paper>
    </Container>
  );
}
