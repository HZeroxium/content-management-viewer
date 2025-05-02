"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { ContentBlockDto } from "@/lib/types/content";

interface VideoBlockProps {
  block: ContentBlockDto;
  index: number;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ block, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Paper
        elevation={1}
        sx={{
          mb: 4,
          overflow: "hidden",
          borderRadius: 2,
          position: "relative",
        }}
      >
        <Box sx={{ position: "relative", width: "100%", pt: "56.25%" }}>
          {block.metadata?.embedUrl ? (
            <Box
              component="iframe"
              src={block.metadata.embedUrl as string}
              title="Video content"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          ) : block.url ? (
            <Box
              component="video"
              controls
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <source
                src={block.url}
                type={(block.metadata?.contentType as string) || "video/mp4"}
              />
              Your browser does not support the video tag.
            </Box>
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.1)",
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 60, opacity: 0.5 }} />
            </Box>
          )}
        </Box>

        {block.metadata?.caption && (
          <Box sx={{ p: 2, backgroundColor: "rgba(0,0,0,0.03)" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              fontStyle="italic"
            >
              {block.metadata.caption as string}
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default VideoBlock;
