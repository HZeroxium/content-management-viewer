"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Chip,
  IconButton,
  Fade,
  CircularProgress,
  alpha,
} from "@mui/material";
import Link from "next/link";
import { useAppAuth } from "@/lib/hooks/useAppAuth";
import { motion } from "framer-motion";

// Icons
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import StorageIcon from "@mui/icons-material/Storage";
import SummarizeIcon from "@mui/icons-material/Summarize";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import PostAddIcon from "@mui/icons-material/PostAdd";
import FileUploadIcon from "@mui/icons-material/FileUpload";

// Import hooks for fetching summary data
import { useUsers } from "@/lib/hooks/api/useUsers";
import { useContents } from "@/lib/hooks/api/useContents";
import { useFiles } from "@/lib/hooks/api/useFiles";
import { format } from "date-fns";

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAppAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch summary data
  const { data: userData } = useUsers({ page: 1, limit: 5 });
  const { data: contentData } = useContents({ page: 1, limit: 5 });
  const { data: fileData } = useFiles({ page: 1, limit: 5 });

  // Current date for greeting
  const currentHour = new Date().getHours();
  let greeting = "Good Morning";
  if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon";
  if (currentHour >= 17) greeting = "Good Evening";

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const formatDateTime = (dateString: string): string => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Define navigation cards
  const navCards = [
    {
      title: "Users Management",
      description: "Manage user accounts, roles and permissions",
      icon: <PeopleOutlineIcon sx={{ fontSize: 40 }} />,
      link: "/dashboard/users",
      color: theme.palette.primary.main,
      count: userData?.meta?.total || 0,
      actions: [
        {
          label: "View Users",
          link: "/dashboard/users",
          icon: <ArrowForwardIcon fontSize="small" />,
          primary: true,
        },
        {
          label: "Add User",
          link: "/dashboard/users/create",
          icon: <GroupAddIcon fontSize="small" />,
          primary: false,
        },
      ],
    },
    {
      title: "Content Management",
      description: "Create and manage content and publications",
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      link: "/dashboard/content",
      color: theme.palette.secondary.main,
      count: contentData?.meta?.total || 0,
      actions: [
        {
          label: "View Content",
          link: "/dashboard/content",
          icon: <ArrowForwardIcon fontSize="small" />,
          primary: true,
        },
        {
          label: "Create Content",
          link: "/dashboard/content/create",
          icon: <PostAddIcon fontSize="small" />,
          primary: false,
        },
      ],
    },
    {
      title: "File Management",
      description: "Upload and organize files and media",
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      link: "/dashboard/files",
      color: theme.palette.info.main,
      count: fileData?.meta?.total || 0,
      actions: [
        {
          label: "View Files",
          link: "/dashboard/files",
          icon: <ArrowForwardIcon fontSize="small" />,
          primary: true,
        },
        {
          label: "Upload File",
          link: "/dashboard/files/upload",
          icon: <FileUploadIcon fontSize="small" />,
          primary: false,
        },
      ],
    },
  ];

  const statCards = [
    {
      title: "Total Users",
      icon: <PeopleOutlineIcon />,
      value: userData?.meta?.total || 0,
      change: "+3",
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.08),
    },
    {
      title: "Content Items",
      icon: <SummarizeIcon />,
      value: contentData?.meta?.total || 0,
      change: "+12",
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.08),
    },
    {
      title: "Media Files",
      icon: <PhotoLibraryIcon />,
      value: fileData?.meta?.total || 0,
      change: "+8",
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.08),
    },
    {
      title: "Storage Used",
      icon: <StorageIcon />,
      value: fileData?.data
        ? formatFileSize(
            fileData.data.reduce((sum, file) => sum + (file.size || 0), 0)
          )
        : "0",
      change: "+2.4MB",
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.08),
    },
  ];

  // Helper function to format file size
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const MotionGrid = motion(Grid);
  const MotionPaper = motion(Paper);

  return (
    <Fade in={!isLoading} timeout={800}>
      <Box sx={{ p: { xs: 2, md: 3 }, overflow: "auto" }}>
        <Container maxWidth="xl" disableGutters>
          {/* Welcome Header */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  background: `linear-gradient(120deg, ${alpha(
                    theme.palette.background.paper,
                    0.8
                  )}, ${alpha(theme.palette.primary.light, 0.2)})`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{ fontWeight: "bold" }}
                    >
                      {greeting}, {user?.name || "Admin"}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Welcome to your admin dashboard. Here&apos;s what&apos;s
                      happening today.
                    </Typography>
                    <Chip
                      icon={<AdminPanelSettingsIcon />}
                      label={`Signed in as ${user?.role || "admin"}`}
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 2 }}
                    />
                  </Box>

                  {!isMobile && (
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      sx={{
                        textAlign: "right",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ mr: 2, fontWeight: "medium" }}
                      >
                        {format(new Date(), "EEEE, MMMM d, yyyy")}
                      </Typography>
                      {user?.name && (
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: theme.palette.primary.main,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                            fontWeight: "bold",
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Stats Section */}
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            <NewspaperIcon sx={{ mr: 1 }} />
            Overview
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {statCards.map((stat, index) => (
              <MotionGrid
                key={stat.title}
                size={{ xs: 6, md: 3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    height: "100%",
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    overflow: "hidden",
                    position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  {/* Background gradient */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      opacity: 0.15,
                      background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)`,
                      zIndex: 0,
                    }}
                  />

                  <Box sx={{ zIndex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        mt: 1,
                        fontWeight: "bold",
                        color: stat.color,
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} thickness={4} />
                      ) : (
                        stat.value
                      )}
                    </Typography>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        mt: 1,
                        fontWeight: "bold",
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        border: `1px solid ${alpha(stat.color, 0.3)}`,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      bgcolor: stat.bgColor,
                      p: 1.5,
                      borderRadius: "50%",
                      color: stat.color,
                      zIndex: 1,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Paper>
              </MotionGrid>
            ))}
          </Grid>

          {/* Navigation Cards */}
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            <NewspaperIcon sx={{ mr: 1 }} />
            Quick Navigation
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {navCards.map((card, index) => (
              <MotionGrid
                key={card.title}
                size={{ xs: 12, md: 4 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <MotionPaper
                  elevation={2}
                  whileHover={{
                    y: -5,
                    boxShadow: "0px 10px 30px rgba(0,0,0,0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Background gradient */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      opacity: 0.07,
                      background: `radial-gradient(circle, ${card.color} 0%, transparent 70%)`,
                      transform: "translate(30%, -30%)",
                      zIndex: 0,
                    }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        mr: 2,
                        bgcolor: alpha(card.color, 0.1),
                        color: card.color,
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {card.title}
                      </Typography>
                      <Chip
                        label={`${card.count} items`}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, flexGrow: 1 }}
                  >
                    {card.description}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                    {card.actions.map((action, i) => (
                      <Tooltip
                        key={i}
                        title={action.label}
                        arrow
                        placement="top"
                      >
                        <Button
                          component={Link}
                          href={action.link}
                          variant={action.primary ? "contained" : "outlined"}
                          color={action.primary ? "primary" : "secondary"}
                          endIcon={action.icon}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            borderRadius: 2,
                            boxShadow: action.primary ? 2 : 0,
                            whiteSpace: "nowrap",
                            flexGrow: action.primary ? 1 : 0,
                          }}
                        >
                          {action.label}
                        </Button>
                      </Tooltip>
                    ))}
                  </Box>
                </MotionPaper>
              </MotionGrid>
            ))}
          </Grid>

          {/* Recent Activity Section */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "medium",
                  }}
                >
                  <SummarizeIcon sx={{ mr: 1 }} />
                  Recent Content
                </Typography>

                {!contentData?.data?.length ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      No recent content found
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {contentData.data.slice(0, 5).map((content, index) => (
                      <React.Fragment key={content.id}>
                        {index > 0 && <Divider sx={{ my: 1.5 }} />}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: "medium" }}>
                              {content.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Updated {formatDateTime(content.updatedAt || "")}
                            </Typography>
                          </Box>
                          <Box>
                            <Tooltip title="View Content" arrow placement="top">
                              <IconButton
                                component={Link}
                                href={`/dashboard/content/${content.id}`}
                                color="primary"
                                size="small"
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </React.Fragment>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: "center" }}>
                      <Button
                        component={Link}
                        href="/dashboard/content"
                        variant="text"
                        endIcon={<ArrowForwardIcon />}
                      >
                        View all content
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: "medium",
                  }}
                >
                  <PersonIcon sx={{ mr: 1 }} />
                  Recent Users
                </Typography>

                {!userData?.data?.length ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      No recent users found
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {userData.data.slice(0, 5).map((user, index) => (
                      <React.Fragment key={user.id}>
                        {index > 0 && <Divider sx={{ my: 1.5 }} />}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                bgcolor:
                                  index % 2 === 0
                                    ? theme.palette.primary.main
                                    : theme.palette.secondary.main,
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 1.5,
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                              }}
                            >
                              {user.name
                                ? user.name.charAt(0).toUpperCase()
                                : user.email.charAt(0).toUpperCase()}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: "medium" }}>
                                {user.name || user.email}
                              </Typography>
                              <Chip
                                label={user.role}
                                size="small"
                                color={
                                  user.role === "admin"
                                    ? "error"
                                    : user.role === "editor"
                                    ? "primary"
                                    : "default"
                                }
                                sx={{ height: 20, fontSize: "0.65rem" }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </React.Fragment>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: "center" }}>
                      <Button
                        component={Link}
                        href="/dashboard/users"
                        variant="text"
                        endIcon={<ArrowForwardIcon />}
                      >
                        View all users
                      </Button>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Fade>
  );
}
