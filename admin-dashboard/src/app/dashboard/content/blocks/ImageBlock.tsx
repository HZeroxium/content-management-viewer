// src/app/dashboard/content/blocks/ImageBlock.tsx
"use client";

import React, { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";
import { ContentBlockDto as ContentBlockProps } from "@/lib/types/content";
import UploadIcon from "@mui/icons-material/Upload";

interface ImageBlockProps extends ContentBlockProps {
  src?: string;
  alt?: string;
  onImageChange?: (file: File) => Promise<void>;
  isEditable?: boolean;
}

export default function ImageBlock({
  src,
  alt = "Image",
  onImageChange,
  isEditable = false,
}: ImageBlockProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(src);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Check if a file was selected
    if (!file) return;

    try {
      setError(null);
      setIsUploading(true);

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Call the onImageChange prop if provided
      if (onImageChange) {
        await onImageChange(file);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
      // Revert to the original image if available
      setPreviewUrl(src);
    } finally {
      setIsUploading(false);
    }
  };

  if (previewUrl) {
    return (
      <Box sx={{ position: "relative", width: "100%" }}>
        <Box sx={{ position: "relative", width: "100%", minHeight: "200px" }}>
          <Image
            src={previewUrl}
            alt={alt}
            fill
            style={{
              objectFit: "contain",
              maxWidth: "100%",
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Box>

        {isEditable && (
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            sx={{ mt: 2 }}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Change Image"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        )}

        {error && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 1, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  // No image case - show upload button
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 3,
        minHeight: 200,
      }}
    >
      {isUploading ? (
        <CircularProgress size={24} sx={{ mb: 2 }} />
      ) : (
        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 2 }}
        >
          No image selected
        </Typography>
      )}

      {isEditable && (
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
      )}

      {error && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
