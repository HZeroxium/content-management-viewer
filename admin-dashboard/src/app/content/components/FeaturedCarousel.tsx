// /src/app/content/components/FeaturedCarousel.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ContentResponseDto } from "@/lib/types/content";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { motion, AnimatePresence } from "framer-motion";

interface FeaturedCarouselProps {
  items: ContentResponseDto[];
}

export default function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Get a representative image for a content item
  const getContentImage = (content: ContentResponseDto): string => {
    const imageBlock = content.blocks?.find(
      (block) => block.type === "image" && (block.url || block.metadata?.src)
    );

    return (
      imageBlock?.url ||
      (imageBlock?.metadata?.src as string) ||
      "/placeholder-image.svg"
    );
  };

  // Generate a short excerpt from content
  const getContentExcerpt = (
    content: ContentResponseDto,
    maxLength = 160
  ): string => {
    // Use description if available
    if (content.description) {
      return content.description.length > maxLength
        ? `${content.description.substring(0, maxLength)}...`
        : content.description;
    }

    // Otherwise, try to get text from the first text block
    const textBlock = content.blocks?.find((block) => block.type === "text");
    if (textBlock?.text) {
      const plainText = textBlock.text.replace(/<[^>]+>/g, ""); // Strip HTML tags
      return plainText.length > maxLength
        ? `${plainText.substring(0, maxLength)}...`
        : plainText;
    }

    return "No description available";
  };

  // Autoplay functionality
  useEffect(() => {
    if (!autoplayEnabled || items.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, items.length, autoplayEnabled]);

  // Function to move to the next slide
  const nextSlide = () => {
    if (items.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setAutoplayEnabled(false);
  };

  // Function to move to the previous slide
  const prevSlide = () => {
    if (items.length <= 1) return;
    setDirection(-1);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + items.length) % items.length
    );
    setAutoplayEnabled(false);
  };

  const slideVariants = {
    incomingRight: {
      x: "100%",
      opacity: 0,
    },
    incomingLeft: {
      x: "-100%",
      opacity: 0,
    },
    active: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exitingLeft: {
      x: "-100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exitingRight: {
      x: "100%",
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
  };

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: 300, sm: 350, md: 450, lg: 500 },
        backgroundColor: "black",
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={direction > 0 ? "incomingRight" : "incomingLeft"}
          animate="active"
          exit={direction > 0 ? "exitingLeft" : "exitingRight"}
          variants={slideVariants}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%), url(${getContentImage(
              currentItem
            )})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Content Overlay */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: { xs: 3, md: 5 },
              color: "white",
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h3"}
              component="h2"
              sx={{
                fontWeight: "bold",
                textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                mb: 1,
              }}
            >
              {currentItem.title}
            </Typography>

            {!isMobile && (
              <Typography
                variant="body1"
                sx={{
                  maxWidth: "70%",
                  textShadow: "0px 1px 2px rgba(0,0,0,0.7)",
                  mb: 3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {getContentExcerpt(currentItem)}
              </Typography>
            )}

            <Button
              component={Link}
              href={`/content/${currentItem.id}`}
              variant="contained"
              color="primary"
              size={isMobile ? "small" : "medium"}
              startIcon={<VisibilityIcon />}
              sx={{
                borderRadius: 6,
                px: 3,
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Read more
            </Button>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 1, sm: 2 },
        }}
      >
        {items.length > 1 && (
          <>
            <Tooltip title="Previous slide">
              <IconButton
                onClick={prevSlide}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.5)",
                  },
                }}
                aria-label="previous slide"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Next slide">
              <IconButton
                onClick={nextSlide}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.5)",
                  },
                }}
                aria-label="next slide"
              >
                <ArrowForwardIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Pagination Indicators */}
      {items.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            zIndex: 2,
          }}
        >
          {items.map((_, index) => (
            <Box
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
                setAutoplayEnabled(false);
              }}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  index === currentIndex
                    ? theme.palette.primary.main
                    : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor:
                    index === currentIndex
                      ? theme.palette.primary.dark
                      : "rgba(255,255,255,0.8)",
                  transform: "scale(1.2)",
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
