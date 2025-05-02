// /src/app/content/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useContents } from "@/lib/hooks/api/useContents";
import { ContentResponseDto } from "@/lib/types/content";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Tooltip,
  Pagination,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FeaturedCarousel from "./components/FeaturedCarousel";
import { formatDate } from "@/utils/format";
import { motion } from "framer-motion";

export default function ContentPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [featuredItems, setFeaturedItems] = useState<ContentResponseDto[]>([]);

  // Fetch content with pagination
  const { data, isLoading, error } = useContents({
    page,
    limit: pageSize,
    // title: searchQuery,
  });

  // Extract featured items when data loads
  useEffect(() => {
    if (data?.data) {
      // Select items for the carousel (e.g., most recent or with specific metadata)
      const featured = data.data
        .filter((item) =>
          // Filter criteria for featured items, e.g., items with images
          item.blocks?.some((block) => block.type === "image")
        )
        .slice(0, 5);
      setFeaturedItems(featured);
    }
  }, [data]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchQuery(searchTerm);
    setPage(1); // Reset to first page on new search
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "grid" | "list" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

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
    maxLength = 120
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

  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <Container maxWidth="xl" sx={{ pb: 8 }}>
      {/* Hero Section with Carousel */}
      <Box
        sx={{
          mb: 6,
          mt: 2,
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: 3,
        }}
      >
        {featuredItems.length > 0 ? (
          <FeaturedCarousel items={featuredItems} />
        ) : (
          <Skeleton
            variant="rectangular"
            height={isMobile ? 300 : 500}
            animation="wave"
            sx={{ borderRadius: 3 }}
          />
        )}
      </Box>

      {/* Title and Search Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            position: "relative",
            display: "inline-block",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -4,
              left: 0,
              width: "40%",
              height: 3,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          Browse Content
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ flexGrow: 1 }}
          >
            <TextField
              placeholder="Search content..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 2px ${alpha(
                      theme.palette.primary.main,
                      0.25
                    )}`,
                  },
                },
              }}
            />
          </Box>

          {/* View Mode Toggle */}
          <Tooltip title="Change view mode">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              aria-label="view mode"
              sx={{
                display: { xs: "none", sm: "flex" },
                "& .MuiToggleButton-root": {
                  borderRadius: "4px !important",
                  padding: "4px 8px",
                },
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Tooltip>
        </Box>
      </Box>

      {/* Content Display */}
      {isLoading ? (
        // Loading skeletons
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton
                variant="rectangular"
                height={viewMode === "grid" ? 200 : 120}
                sx={{ borderRadius: 2, mb: 1 }}
              />
              <Skeleton variant="text" height={28} width="80%" />
              <Skeleton variant="text" height={20} width="60%" />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        // Error message
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.light, 0.1),
          }}
        >
          <Typography color="error" gutterBottom>
            Error loading content
          </Typography>
          <Typography variant="body2">
            {error instanceof Error ? error.message : "Please try again later."}
          </Typography>
        </Box>
      ) : data?.data.length === 0 ? (
        // No content found
        <Box
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.light, 0.05),
            border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No content found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? `No results matching '${searchQuery}'`
              : "Check back soon for new content"}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === "grid" && (
            <Grid container spacing={3}>
              {data?.data.map((content, index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={content.id}
                  component={motion.div}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  <Link
                    href={`/content/${content.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: 6,
                          "& .zoom-image": {
                            transform: "scale(1.05)",
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          paddingTop: "56.25%",
                          overflow: "hidden",
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={getContentImage(content)}
                          alt={content.title}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            transition: "transform 0.5s ease",
                          }}
                          className="zoom-image"
                        />
                      </Box>
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          component="h2"
                          noWrap
                        >
                          {content.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flexGrow: 1,
                          }}
                        >
                          {getContentExcerpt(content)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                          }}
                        >
                          <Tooltip
                            title={`Published on ${formatDate(
                              content.createdAt || ""
                            )}`}
                          >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CalendarTodayIcon
                                sx={{
                                  fontSize: 14,
                                  mr: 0.5,
                                  color: "text.secondary",
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(content.createdAt || "")}
                              </Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="View content">
                            <Chip
                              icon={<VisibilityIcon fontSize="small" />}
                              label="Read more"
                              size="small"
                              color="primary"
                              sx={{
                                borderRadius: 4,
                                "& .MuiChip-label": { px: 1 },
                                "& .MuiChip-icon": { ml: 0.5 },
                              }}
                            />
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {data?.data.map((content, index) => (
                <Link
                  href={`/content/${content.id}`}
                  style={{ textDecoration: "none" }}
                  key={content.id}
                >
                  <Card
                    component={motion.div}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    sx={{
                      display: "flex",
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateX(8px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 120, sm: 180 },
                        minWidth: { xs: 120, sm: 180 },
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={getContentImage(content)}
                        alt={content.title}
                        sx={{
                          height: "100%",
                          transition: "transform 0.5s ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      />
                    </Box>
                    <CardContent
                      sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" component="h2">
                          {content.title}
                        </Typography>
                        <Tooltip
                          title={`Published on ${formatDate(
                            content.createdAt || ""
                          )}`}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                color: "text.secondary",
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(content.createdAt || "")}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          my: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          flexGrow: 1,
                        }}
                      >
                        {getContentExcerpt(content, 200)}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <Button
                          size="small"
                          endIcon={<VisibilityIcon />}
                          color="primary"
                          sx={{ textTransform: "none" }}
                        >
                          Read more
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {data && data.meta && data.meta.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <Pagination
                count={data.meta.pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
