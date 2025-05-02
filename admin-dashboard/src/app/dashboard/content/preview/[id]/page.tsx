"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useContent } from "@/lib/hooks/api/useContents";
import { useSocketSubscription } from "@/lib/hooks/useSocket";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";
import ContentHeader from "../components/ContentHeader";
import PreviewControls, { ViewMode } from "../components/PreviewControls";
import BlockRenderer from "../components/BlockRenderer";

export default function ContentPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { isConnected } = useSocketSubscription(id);

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousTitle, setPreviousTitle] = useState("");
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);

  // Fetch content data
  const { data: content, isLoading, error } = useContent(id);

  // Track content changes for animation triggers
  useEffect(() => {
    if (content && content.title !== previousTitle && previousTitle !== "") {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timer);
    }

    if (content) {
      setPreviousTitle(content.title);
    }
  }, [content, previousTitle]);

  useEffect(() => {
    // Show connection status briefly when it changes
    if (isConnected !== undefined) {
      setShowConnectionStatus(true);
      const timer = setTimeout(() => setShowConnectionStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  // Format date for display
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPreviewWidth = (): string => {
    switch (viewMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
        return "1024px";
      case "full":
      default:
        return "100%";
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: "medium" }}>
          Loading content preview...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          p: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Failed to load content preview
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ mb: 3, maxWidth: 500 }}
        >
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/content")}
        >
          Back to Content List
        </Button>
      </Box>
    );
  }

  if (!content) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          p: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
        <Typography variant="h5" color="warning.main" gutterBottom>
          Content Not Found
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          The content you are looking for does not exist or has been removed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/content")}
        >
          Back to Content List
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Header with controls */}
      <Box
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          boxShadow: 1,
          p: 2,
        }}
      >
        <Container maxWidth="xl">
          <PreviewControls
            contentId={id}
            contentTitle={content.title}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isMobile={isMobile}
            formattedDate={formatDate(content.updatedAt)}
          />
        </Container>
      </Box>

      {/* Connection status indicator */}
      <AnimatePresence>
        {showConnectionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 70,
              right: 20,
              zIndex: 1000,
            }}
          >
            <Paper
              elevation={2}
              sx={{
                py: 0.5,
                px: 1.5,
                backgroundColor: isConnected
                  ? theme.palette.success.light
                  : theme.palette.error.light,
                color: isConnected
                  ? theme.palette.success.contrastText
                  : theme.palette.error.contrastText,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 8,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: isConnected
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                }}
              />
              <Typography variant="caption" fontWeight="medium">
                {isConnected
                  ? "Real-time updates active"
                  : "Connecting to server..."}
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content preview */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <motion.div
            layout
            animate={{ width: getPreviewWidth() }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            style={{
              maxWidth: "100%",
              boxShadow: viewMode !== "full" ? theme.shadows[3] : "none",
              backgroundColor: theme.palette.background.paper,
              borderRadius: viewMode !== "full" ? 8 : 0,
              overflow: "hidden",
            }}
          >
            {/* Add highlight effect when content updates */}
            {isUpdating && (
              <motion.div
                initial={{
                  opacity: 0.8,
                  backgroundColor: theme.palette.primary.light,
                }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />
            )}

            {/* Content header */}
            <ContentHeader content={content} />

            {/* Content blocks with keyed AnimatePresence for smooth transitions */}
            <Box sx={{ p: { xs: 2, md: 4 }, pt: 2 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={content?.updatedAt || "content"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {content?.blocks && content.blocks.length > 0 ? (
                    content.blocks.map((block, index) => (
                      <BlockRenderer
                        key={`block-${block.localId || index}-${
                          content.updatedAt || ""
                        }`}
                        block={block}
                        index={index}
                      />
                    ))
                  ) : (
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: "center",
                        backgroundColor: "rgba(0,0,0,0.02)",
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        This content has no blocks to display.
                      </Typography>
                    </Paper>
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          </motion.div>
        </Box>

        {/* Add toast notification area for updates */}
        <AnimatePresence>
          {isUpdating && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="body2">
                  Content updated in real-time
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}
