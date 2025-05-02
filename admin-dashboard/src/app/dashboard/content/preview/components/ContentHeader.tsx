"use client";

import React from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ContentResponseDto } from "@/lib/types/content";

interface ContentHeaderProps {
  content: ContentResponseDto;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ content }) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, pb: 2 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontSize: { xs: "1.75rem", md: "2.5rem" },
            fontWeight: "bold",
            color: theme.palette.text.primary,
          }}
        >
          {content.title}
        </Typography>

        {content.description && (
          <Typography
            variant="h6"
            component="div"
            color="text.secondary"
            sx={{
              mb: 3,
              fontWeight: "normal",
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            {content.description}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />
      </motion.div>
    </Box>
  );
};

export default ContentHeader;
