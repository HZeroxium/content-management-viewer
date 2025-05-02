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
  const imageUrl = block.url || (block.metadata?.src as string) || "";

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: loaded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: "100%",
            height: block.metadata?.height
              ? Number(block.metadata.height)
              : "auto",
            minHeight: 200,
            maxHeight: 600,
            position: "relative",
          }}
        >
          <Image
            src={imageUrl}
            alt={(block.metadata?.alt as string) || "Content image"}
            fill
            style={{
              objectFit:
                (block.metadata?.objectFit as
                  | "cover"
                  | "contain"
                  | undefined) || "cover",
              objectPosition:
                (block.metadata?.objectPosition as string) || "center",
            }}
            onLoad={() => setLoaded(true)}
          />
        </motion.div>

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
