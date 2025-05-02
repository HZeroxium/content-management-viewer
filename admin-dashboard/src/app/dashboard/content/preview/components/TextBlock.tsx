"use client";

import React from "react";
import { Paper, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ContentBlockDto } from "@/lib/types/content";

interface TextBlockProps {
  block: ContentBlockDto;
  index: number;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, index }) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <div
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: block.text || "" }}
          style={{
            lineHeight: 1.8,
          }}
        />
      </Paper>
    </motion.div>
  );
};

export default TextBlock;
