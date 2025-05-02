// /src/app/dashboard/content/preview/components/BlockRenderer.tsx

"use client";

import React from "react";
import { Paper, Typography } from "@mui/material";
import { ContentBlockDto } from "@/lib/types/content";
import TextBlock from "./TextBlock";
import ImageBlock from "./ImageBlock";
import VideoBlock from "./VideoBlock";

interface BlockRendererProps {
  block: ContentBlockDto;
  index: number;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, index }) => {
  if (!block) return null;

  // Generate a stable key for React rendering
  const blockKey = `${block.type}-${index}`;

  switch (block.type) {
    case "text":
      return <TextBlock block={block} index={index} key={blockKey} />;
    case "image":
      return <ImageBlock block={block} index={index} key={blockKey} />;
    case "video":
      return <VideoBlock block={block} index={index} key={blockKey} />;
    default:
      return (
        <Paper sx={{ p: 3, mb: 2 }} key={blockKey}>
          <Typography variant="body1">
            Unsupported block type: {block.type}
          </Typography>
        </Paper>
      );
  }
};

export default BlockRenderer;
