// /src/app/dashboard/content/[id]/ContentBlockEditor.tsx

"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CardMedia,
  Typography,
  IconButton,
} from "@mui/material";
import { ContentBlockDto } from "@/lib/types/content";
import FileSelector from "./FileSelector";
import EditIcon from "@mui/icons-material/Edit";

interface ContentBlockEditorProps {
  block: ContentBlockDto;
  onChange: (updatedBlock: ContentBlockDto) => void;
}

export default function ContentBlockEditor({
  block,
  onChange,
}: ContentBlockEditorProps) {
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(
    block.type === "image" || block.type === "video"
      ? block.metadata?.fileUrl || null
      : null
  );

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...block,
      content: event.target.value,
    });
  };

  const handleFileSelect = (fileId: string, fileUrl: string) => {
    setSelectedFileUrl(fileUrl);
    onChange({
      ...block,
      metadata: {
        ...block.metadata,
        fileId: fileId,
        fileUrl: fileUrl,
      },
    });
    setFileSelectorOpen(false);
  };

  const renderBlockEditor = () => {
    switch (block.type) {
      case "text":
        return (
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={10}
            value={block.content || ""}
            onChange={handleTextChange}
            variant="outlined"
            placeholder="Enter text content..."
          />
        );

      case "image":
        return (
          <Box>
            {selectedFileUrl ? (
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  image={selectedFileUrl}
                  alt="Content image"
                  sx={{
                    maxHeight: "300px",
                    objectFit: "contain",
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                  }}
                  onClick={() => setFileSelectorOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setFileSelectorOpen(true)}
                fullWidth
                sx={{ height: "120px" }}
              >
                Select Image
              </Button>
            )}
            {block.content && (
              <TextField
                fullWidth
                margin="normal"
                label="Image Caption"
                value={block.content}
                onChange={handleTextChange}
                variant="outlined"
              />
            )}
          </Box>
        );

      case "video":
        return (
          <Box>
            {selectedFileUrl ? (
              <Box sx={{ position: "relative" }}>
                <video
                  controls
                  src={selectedFileUrl}
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    borderRadius: "4px",
                    marginBottom: "8px",
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                  }}
                  onClick={() => setFileSelectorOpen(true)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setFileSelectorOpen(true)}
                fullWidth
                sx={{ height: "120px" }}
              >
                Select Video
              </Button>
            )}
            {block.content && (
              <TextField
                fullWidth
                margin="normal"
                label="Video Caption"
                value={block.content}
                onChange={handleTextChange}
                variant="outlined"
              />
            )}
          </Box>
        );

      default:
        return (
          <Typography color="error">
            Unknown block type: {block.type}
          </Typography>
        );
    }
  };

  return (
    <Box>
      {renderBlockEditor()}
      <FileSelector
        open={fileSelectorOpen}
        onClose={() => setFileSelectorOpen(false)}
        onSelect={handleFileSelect}
        acceptTypes={block.type === "image" ? ["image"] : ["video"]}
      />
    </Box>
  );
}
