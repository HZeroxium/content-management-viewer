"use client";

import React, { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";
import { ContentBlockDto } from "@/lib/types/content";

interface ImageBlockProps {
  block: ContentBlockDto;
  index: number;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ block, index }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imageUrl = block.url || (block.metadata?.src as string) || "";

  // Calculate aspect ratio based on metadata if available
  const aspectRatio =
    block.metadata?.width && block.metadata?.height
      ? Number(block.metadata.width) / Number(block.metadata.height)
      : 16 / 9; // Default aspect ratio

  // Get image dimensions from metadata
  // const imgWidth = block.metadata?.width ? Number(block.metadata.width) : 1200;
  // const imgHeight = block.metadata?.height
  //   ? Number(block.metadata.height)
  //   : Math.round(1200 / aspectRatio);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
        {!error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              width: "100%",
              position: "relative",
              // Define height using aspect ratio
              paddingTop: `${(1 / aspectRatio) * 100}%`,
            }}
          >
            <Image
              src={imageUrl}
              alt={(block.metadata?.alt as string) || "Content image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              style={{
                objectFit:
                  (block.metadata?.objectFit as
                    | "cover"
                    | "contain"
                    | undefined) || "contain",
                objectPosition:
                  (block.metadata?.objectPosition as string) || "center",
              }}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              priority={index < 2} // Prioritize loading for the first few images
            />
          </motion.div>
        ) : (
          <Box
            sx={{
              width: "100%",
              paddingTop: `${(1 / aspectRatio) * 100}%`,
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              Image could not be loaded
            </Typography>
          </Box>
        )}

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

export default ImageBlock;
