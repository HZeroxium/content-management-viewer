// /src/app/content/[id]/page.tsx

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
  Tooltip,
  Button,
  Chip,
  Divider,
  IconButton,
  Grid,
  Link as MuiLink,
  Breadcrumbs,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Link from "next/link";
import BlockRenderer from "@/app/dashboard/content/preview/components/BlockRenderer";
import { format } from "date-fns";

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  // Socket connection for real-time updates
  const { isConnected } = useSocketSubscription(id);

  // State management
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousTitle, setPreviousTitle] = useState("");
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [shareTooltipText, setShareTooltipText] =
    useState("Copy link to share");

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

  // Show connection status briefly when it changes
  useEffect(() => {
    if (isConnected !== undefined) {
      setShowConnectionStatus(true);
      const timer = setTimeout(() => setShowConnectionStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  // Update document title when content loads
  useEffect(() => {
    if (content?.title) {
      document.title = `${content.title} | Content Viewer`;
    } else {
      document.title = "Content Viewer";
    }
  }, [content?.title]);

  // Format date for display
  const formatDateTime = (dateString: string): string => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Handle share functionality
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltipText("Link copied!");
    setShowShareTooltip(true);

    setTimeout(() => {
      setShareTooltipText("Copy link to share");
      setShowShareTooltip(false);
    }, 2000);
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
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
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: "medium" }}>
          Loading content...
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
          Error Loading Content
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
          onClick={() => router.push("/content")}
          sx={{ borderRadius: 2 }}
        >
          Back to Home
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
          onClick={() => router.push("/")}
          sx={{ borderRadius: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        pb: 8,
        // Add print-specific styles
        "@media print": {
          backgroundColor: "white",
          color: "black",
          "& .no-print": {
            display: "none !important",
          },
        },
      }}
    >
      {/* Header */}
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
        className="no-print"
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Breadcrumbs
              sx={{
                display: { xs: "none", sm: "flex" },
                "& .MuiBreadcrumbs-ol": { flexWrap: "nowrap" },
              }}
            >
              <Link href="/content" passHref>
                <MuiLink
                  underline="hover"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.primary",
                    textDecoration: "none",
                  }}
                >
                  <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Content</Typography>
                </MuiLink>
              </Link>
              <Typography
                color="text.primary"
                sx={{ fontWeight: "medium" }}
                variant="body2"
              >
                {content.title.length > 30
                  ? `${content.title.slice(0, 30)}...`
                  : content.title}
              </Typography>
            </Breadcrumbs>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Go back" arrow>
                <IconButton
                  onClick={() => router.back()}
                  sx={{ color: theme.palette.text.secondary }}
                  size={isMobile ? "small" : "medium"}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Print this content" arrow>
                <IconButton
                  onClick={handlePrint}
                  sx={{ color: theme.palette.text.secondary }}
                  size={isMobile ? "small" : "medium"}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={shareTooltipText}
                arrow
                open={showShareTooltip}
                onOpen={() => setShowShareTooltip(true)}
                onClose={() => setShowShareTooltip(false)}
              >
                <IconButton
                  onClick={handleShare}
                  sx={{ color: theme.palette.text.secondary }}
                  size={isMobile ? "small" : "medium"}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              {isConnected && (
                <Tooltip title="Real-time updates active" arrow>
                  <Chip
                    icon={
                      <VisibilityIcon sx={{ fontSize: "16px !important" }} />
                    }
                    label="Live"
                    size="small"
                    color="success"
                    sx={{
                      height: 24,
                      display: { xs: "none", md: "flex" },
                      "& .MuiChip-label": { px: 1, py: 0 },
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
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
            className="no-print"
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
                  ? "Content will update in real-time"
                  : "Connecting to server..."}
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <Container maxWidth="lg">
        {/* Content header section */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ mt: 4 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              mb: 3,
            }}
          >
            <Typography
              variant={isMobile ? "h4" : "h2"}
              component="h1"
              sx={{
                fontWeight: "bold",
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              {content.title}
            </Typography>

            {content.description && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mb: 3,
                  fontWeight: "normal",
                  lineHeight: 1.5,
                }}
              >
                {content.description}
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              {content.updatedAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CalendarTodayIcon
                      sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Updated: {formatDateTime(content.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {content.createdAt && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon
                      sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Published: {formatDateTime(content.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>

        {/* Content blocks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              minHeight: 200,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Add highlight effect when content updates */}
            <AnimatePresence>
              {isUpdating && (
                <motion.div
                  initial={{
                    opacity: 0.4,
                    backgroundColor: theme.palette.primary.light,
                  }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
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
            </AnimatePresence>

            {/* Content blocks */}
            <Box>
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
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Typography variant="body1" color="text.secondary">
                        This content has no blocks to display.
                      </Typography>
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>
            </Box>
          </Paper>
        </motion.div>

        {/* Footer with additional information */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          sx={{
            mt: 4,
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
          className="no-print"
        >
          <Typography variant="body2" color="text.secondary">
            {content.metadata?.status === "published"
              ? "Published content"
              : "Preview content"}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Share this content" arrow>
              <Button
                startIcon={<ShareIcon />}
                variant="outlined"
                size="small"
                onClick={handleShare}
                sx={{ borderRadius: 2 }}
              >
                {isMedium ? "" : "Share"}
              </Button>
            </Tooltip>

            <Tooltip title="Print this content" arrow>
              <Button
                startIcon={<PrintIcon />}
                variant="outlined"
                size="small"
                onClick={handlePrint}
                sx={{ borderRadius: 2 }}
              >
                {isMedium ? "" : "Print"}
              </Button>
            </Tooltip>

            <Tooltip title="Copy link to clipboard" arrow>
              <Button
                startIcon={<ContentCopyIcon />}
                variant="contained"
                size="small"
                onClick={handleShare}
                sx={{ borderRadius: 2 }}
              >
                {isMedium ? "" : "Copy Link"}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Container>

      {/* Update notification */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
            className="no-print"
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
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">Content has been updated</Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
