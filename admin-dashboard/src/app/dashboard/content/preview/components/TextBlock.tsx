"use client";

import React from "react";
import { Paper, Typography, useTheme } from "@mui/material";
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
        <Typography
          dangerouslySetInnerHTML={{ __html: block.text || "" }}
          sx={{
            lineHeight: 1.8,
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              color: theme.palette.primary.main,
              mt: 2,
              mb: 1,
            },
            "& p": {
              mb: 1.5,
            },
            "& a": {
              color: theme.palette.secondary.main,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            "& ul, & ol": {
              ml: 3,
              mb: 2,
            },
            "& li": {
              mb: 0.5,
            },
            "& blockquote": {
              borderLeft: `4px solid ${theme.palette.primary.light}`,
              pl: 2,
              py: 0.5,
              fontStyle: "italic",
            },
          }}
        />
      </Paper>
    </motion.div>
  );
};

export default TextBlock;
