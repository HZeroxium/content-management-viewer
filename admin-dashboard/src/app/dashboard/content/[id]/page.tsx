// src/app/dashboard/content/[id]/page.tsx

"use client";

import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useContent,
  useUpdateContent,
  useDeleteContent,
  useCreateContent,
} from "@/lib/hooks/api/useContents";
import { ContentResponseDto, ContentBlockDto } from "@/lib/types/content";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Breadcrumbs,
  IconButton,
  Divider,
  Card,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Tooltip,
  Fade,
  Zoom,
  Badge,
  useTheme,
  alpha,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useMediaQuery,
  Backdrop,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningIcon from "@mui/icons-material/Warning";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  saveStart,
  saveFailure,
  clearCurrentContent,
  saveSuccess as saveSuccessAction,
} from "@/lib/store/slices/content.slice";
import ContentBlockEditor from "./ContentBlockEditor";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";

// Block with a local ID for drag and drop
interface BlockWithId extends ContentBlockDto {
  localId: string;
}

// Create a memoized version of the ContentBlockEditor component
const MemoizedContentBlockEditor = memo(ContentBlockEditor);

export default function ContentDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const contentError = useAppSelector((state) => state.contents.error);
  const saveStatus = useAppSelector((state) => state.contents.savedSuccess);
  const params = useParams();
  const id = params.id as string;
  const isEditMode = id !== "create" && id !== "new";

  const [content, setContent] = useState<ContentResponseDto | null>(null);
  const [blocks, setBlocks] = useState<BlockWithId[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  // Persist content between tabs without causing re-render
  const contentRef = useRef<ContentResponseDto | null>(null);
  const blocksRef = useRef<BlockWithId[]>([]);

  // Fetch and mutations
  const { data, isLoading, error } = useContent(isEditMode ? id : "");
  const updateContentMutation = useUpdateContent(id);
  const createContentMutation = useCreateContent();
  const deleteContentMutation = useDeleteContent(id);

  // Derived state
  const isSaving =
    updateContentMutation.isPending || createContentMutation.isPending;
  const isDeleting = deleteContentMutation.isPending;
  const hasChanges = isDirty;
  const isContentEmpty = !content?.title || content.title.trim() === "";
  const isPendingSave = isSaving || isExiting;

  // Initialize content from API data or create new empty content
  useEffect(() => {
    if (data && isEditMode) {
      setContent(data);
      contentRef.current = data;

      if (data.blocks) {
        const blocksWithIds = data.blocks.map((block) => ({
          ...block,
          localId: `block-${uuidv4()}`,
        }));
        setBlocks(blocksWithIds);
        blocksRef.current = blocksWithIds;
      }
    } else if (!isEditMode) {
      const newContent: ContentResponseDto = {
        id: "",
        title: "",
        description: "",
        blocks: [],
        metadata: { status: "draft" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "",
        updatedBy: "",
        deletedAt: null,
        deletedBy: null,
      };
      setContent(newContent);
      contentRef.current = newContent;
    }

    return () => {
      dispatch(clearCurrentContent());
    };
  }, [data, isEditMode, dispatch]);

  // Set document title based on content
  useEffect(() => {
    const isNewContent = !!(
      params.id === "new" || typeof content?.id === "undefined"
    );

    if (typeof document !== "undefined") {
      document.title = isNewContent
        ? "Create New Content - Admin Dashboard"
        : `Edit Content: ${content?.title || ""} - Admin Dashboard`;
    }
  }, [params.id, content?.id, content?.title]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Warn about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Mark content as dirty when changes happen
  useEffect(() => {
    if (!content || !data) return;

    const hasContentChanged =
      content.title !== data.title || content.description !== data.description;

    const hasBlocksChanged = blocks.length !== (data.blocks?.length || 0);

    if (hasContentChanged || hasBlocksChanged) {
      setIsDirty(true);
    }
  }, [content, blocks, data]);

  // Validate title when it changes
  useEffect(() => {
    if (content?.title) {
      if (content.title.length > 100) {
        setTitleError("Title is too long (maximum 100 characters)");
      } else {
        setTitleError(null);
      }
    } else {
      setTitleError(isEditMode ? null : "Title is required");
    }
  }, [content?.title, isEditMode]);

  // Handle save operation
  const handleSave = async () => {
    if (!content) return;

    if (!content.title) {
      setTitleError("Title is required");
      setActiveTab(0); // Switch to title tab
      return;
    }

    try {
      setIsExiting(true);
      dispatch(saveStart());

      // Ensure all properties meet the required types for both DTOs
      const contentData = {
        title: content.title || "",
        description: content.description || "",
        blocks: blocks.map(({ localId: _localId, ...blockData }) => blockData),
        metadata: content.metadata || {},
      };

      if (isEditMode) {
        await updateContentMutation.mutateAsync(contentData);
      } else {
        await createContentMutation.mutateAsync(contentData);
      }

      dispatch(saveSuccessAction());
      setSaveSuccess(true);
      setIsDirty(false);

      if (!isEditMode) {
        router.push("/dashboard/content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      let errorMessage = "Failed to save content";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch(saveFailure(errorMessage));
    } finally {
      setIsExiting(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!content?.id) return;

    try {
      setIsExiting(true);
      await deleteContentMutation.mutateAsync();
      setDeleteDialogOpen(false);
      router.push("/dashboard/content");
    } catch (error) {
      console.error("Error deleting content:", error);
    } finally {
      setIsExiting(false);
    }
  };

  const handleAddBlockMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddBlockClose = () => {
    setAnchorEl(null);
  };

  const handleAddBlock = (type: "text" | "image" | "video") => {
    const newBlock: BlockWithId = {
      type,
      text: "",
      localId: uuidv4(), // localId is used for drag-and-drop identification
      metadata: { position: blocks.length },
    };

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    blocksRef.current = updatedBlocks;
    setIsDirty(true);

    handleAddBlockClose();

    // Switch to content blocks tab if on a different tab
    if (activeTab !== 1) {
      setActiveTab(1);
    }
  };

  const handleUpdateBlock = useCallback(
    (index: number, updatedBlock: ContentBlockDto) => {
      setBlocks((prevBlocks) => {
        const updatedBlocks = [...prevBlocks];
        updatedBlocks[index] = {
          ...updatedBlocks[index],
          ...updatedBlock,
        };
        blocksRef.current = updatedBlocks;
        return updatedBlocks;
      });
      setIsDirty(true);
    },
    [setIsDirty]
  );

  const handleDeleteBlock = useCallback(
    (index: number) => {
      setBlocks((prevBlocks) => {
        const updatedBlocks = [...prevBlocks];
        updatedBlocks.splice(index, 1);
        blocksRef.current = updatedBlocks;
        return updatedBlocks;
      });
      setIsDirty(true);
    },
    [setIsDirty]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const items = Array.from(blocks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      // Update positions
      const updatedItems = items.map((item, index) => ({
        ...item,
        metadata: { ...item.metadata, position: index },
      }));

      setBlocks(updatedItems);
      blocksRef.current = updatedItems;
      setIsDirty(true);
    },
    [blocks, setIsDirty]
  );

  const handlePreview = () => {
    if (isEditMode && content?.id) {
      // Open in a new tab to avoid losing unsaved changes
      window.open(`/dashboard/content/preview/${content.id}`, "_blank");
    }
  };

  const handleNavigate = useCallback(
    (path: string) => {
      if (isDirty) {
        setPendingNavigation(path);
        setUnsavedChangesDialog(true);
      } else {
        router.push(path);
      }
    },
    [isDirty, router]
  );

  // Update title/description without resetting blocks
  const handleContentChange = (field: keyof ContentResponseDto, value: any) => {
    setContent((prev) => {
      const updated = prev ? { ...prev, [field]: value } : null;
      if (updated) contentRef.current = updated;
      return updated;
    });
    setIsDirty(true);
  };

  // Tab change with animation
  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          width: "100%",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography sx={{ mt: 2, fontWeight: "medium" }}>
          Loading content...
        </Typography>
      </Box>
    );
  }

  if (error && isEditMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          variant="filled"
          action={
            <Button
              component={Link}
              href="/dashboard/content"
              color="inherit"
              size="small"
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
          }
        >
          Error loading content:{" "}
          {error instanceof Error ? error.message : String(error)}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Loading overlay while saving or deleting */}
      <Backdrop
        open={isPendingSave}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">
          {isSaving ? "Saving content..." : "Deleting content..."}
        </Typography>
      </Backdrop>

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
        }}
        elevation={4}
      >
        <Breadcrumbs
          sx={{
            mb: 2,
            "& .MuiBreadcrumbs-ol": {
              flexWrap: "nowrap",
            },
          }}
        >
          <Link
            href="/dashboard"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <HomeIcon
              fontSize="small"
              sx={{ mr: 0.5, fontSize: 18 }}
              color="action"
            />
            <Typography variant="body2" color="text.secondary">
              Dashboard
            </Typography>
          </Link>
          <Link
            href="/dashboard/content"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <DescriptionIcon
              fontSize="small"
              sx={{ mr: 0.5, fontSize: 18 }}
              color="action"
            />
            <Typography variant="body2" color="text.secondary">
              Content
            </Typography>
          </Link>
          <Typography
            color="text.primary"
            variant="body2"
            sx={{ fontWeight: "medium" }}
          >
            {isEditMode ? "Edit Content" : "Create Content"}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: { xs: "wrap", md: "nowrap" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
              }}
            >
              <EditIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              {isEditMode
                ? `Edit: ${content?.title || "Loading..."}`
                : "Create New Content"}
            </Typography>

            {isEditMode && content?.updatedAt && (
              <Chip
                size="small"
                label={`Last updated: ${new Date(
                  content.updatedAt
                ).toLocaleDateString()} at ${new Date(
                  content.updatedAt
                ).toLocaleTimeString()}`}
                sx={{ mt: 1 }}
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap" }}>
            {isEditMode && (
              <Tooltip
                title="Preview content in a new tab"
                arrow
                placement="top"
              >
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={handlePreview}
                  sx={{
                    borderRadius: 2,
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  Preview
                </Button>
              </Tooltip>
            )}

            <Tooltip title="Return to content list" arrow placement="top">
              <Button
                onClick={() => handleNavigate("/dashboard/content")}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  borderRadius: 2,
                  display: { xs: "none", sm: "flex" },
                }}
              >
                Cancel
              </Button>
            </Tooltip>

            <Tooltip
              title={isEditMode ? "Save changes" : "Create content"}
              arrow
              placement="top"
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges || isContentEmpty}
                  startIcon={<SaveIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Change tracking indicator */}
        {isDirty && (
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
            }}
            icon={<EditIcon fontSize="inherit" />}
            action={
              <Button
                size="small"
                onClick={handleSave}
                disabled={isSaving || isContentEmpty}
                color="info"
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            }
          >
            You have unsaved changes
          </Alert>
        )}

        {saveStatus && (
          <Zoom in={saveSuccess}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                animation: "pulse 1.5s",
                "@keyframes pulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.4)" },
                  "70%": { boxShadow: "0 0 0 10px rgba(76, 175, 80, 0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)" },
                },
              }}
            >
              Content saved successfully!
            </Alert>
          </Zoom>
        )}

        {contentError && (
          <Alert severity="error" sx={{ mb: 3 }} variant="filled">
            {contentError}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mb: 3,
            "& .MuiTab-root": {
              minHeight: 48,
              textTransform: "capitalize",
              fontSize: "1rem",
              fontWeight: activeTab === 0 ? "medium" : "normal",
              mb: -1,
              px: { xs: 1, sm: 2 },
            },
          }}
          variant={isMobile ? "fullWidth" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <DescriptionIcon sx={{ mr: 1, fontSize: 20 }} />
                Basic Details
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Badge
                  badgeContent={blocks.length}
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  <TextFieldsIcon sx={{ fontSize: 20 }} />
                </Badge>
                Content Blocks
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                Settings
              </Box>
            }
          />
        </Tabs>

        <AnimatePresence mode="wait">
          <motion.div
            key={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Title"
                    fullWidth
                    required
                    error={!!titleError}
                    helperText={titleError}
                    value={content?.title || ""}
                    onChange={(e) =>
                      handleContentChange("title", e.target.value)
                    }
                    variant="outlined"
                    InputProps={{
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
                    sx={{ mb: 3 }}
                    placeholder="Enter a descriptive title"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    value={content?.description || ""}
                    onChange={(e) =>
                      handleContentChange("description", e.target.value)
                    }
                    variant="outlined"
                    InputProps={{
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
                    placeholder="Provide a short description (optional)"
                  />
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <TextFieldsIcon sx={{ mr: 1 }} />
                      Content Blocks
                      <Chip
                        label={blocks.length}
                        size="small"
                        sx={{ ml: 1, fontWeight: "bold" }}
                        color="primary"
                      />
                    </Typography>

                    {/* Desktop Add Block Button/Menu */}
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddBlockMenuClick}
                        sx={{ borderRadius: 2 }}
                      >
                        Add Block
                      </Button>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleAddBlockClose}
                        TransitionComponent={Fade}
                        elevation={2}
                        sx={{
                          "& .MuiPaper-root": {
                            borderRadius: 2,
                            minWidth: 180,
                          },
                        }}
                      >
                        <MenuItem onClick={() => handleAddBlock("text")}>
                          <ListItemIcon>
                            <TextFieldsIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Text Block</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleAddBlock("image")}>
                          <ListItemIcon>
                            <ImageIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Image Block</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleAddBlock("video")}>
                          <ListItemIcon>
                            <VideoLibraryIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText>Video Block</ListItemText>
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>

                  {/* Instruction text for new users */}
                  {blocks.length === 0 && (
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderStyle: "dashed",
                        borderRadius: 2,
                        textAlign: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        mb: 2,
                      }}
                    >
                      <AddCircleIcon
                        color="primary"
                        sx={{ fontSize: 40, mb: 1, opacity: 0.7 }}
                      />
                      <Typography variant="h6" gutterBottom>
                        No content blocks yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Add text, images, and videos to build your content.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddBlockMenuClick}
                      >
                        Add Your First Block
                      </Button>
                    </Paper>
                  )}

                  {/* Mobile SpeedDial */}
                  <Box
                    sx={{
                      display: { xs: "block", sm: "none" },
                      position: "fixed",
                      bottom: 24,
                      right: 24,
                      zIndex: 1000,
                    }}
                  >
                    <SpeedDial
                      ariaLabel="Add content block"
                      icon={<SpeedDialIcon />}
                      onClose={() => setSpeedDialOpen(false)}
                      onOpen={() => setSpeedDialOpen(true)}
                      open={speedDialOpen}
                      direction="up"
                      FabProps={{
                        sx: {
                          bgcolor: theme.palette.primary.main,
                          "&:hover": {
                            bgcolor: theme.palette.primary.dark,
                          },
                        },
                      }}
                    >
                      <SpeedDialAction
                        icon={<TextFieldsIcon />}
                        tooltipTitle="Add Text Block"
                        onClick={() => handleAddBlock("text")}
                      />
                      <SpeedDialAction
                        icon={<ImageIcon />}
                        tooltipTitle="Add Image Block"
                        onClick={() => handleAddBlock("image")}
                      />
                      <SpeedDialAction
                        icon={<VideoLibraryIcon />}
                        tooltipTitle="Add Video Block"
                        onClick={() => handleAddBlock("video")}
                      />
                    </SpeedDial>
                  </Box>
                </Box>

                {blocks.length > 0 && (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="content-blocks">
                      {(provided) => (
                        <Box
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          sx={{ mb: 3 }}
                        >
                          {blocks.map((block, index) => (
                            <Draggable
                              key={block.localId}
                              draggableId={block.localId}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                // Separate animation styles from dragging styles
                                return (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      marginBottom: "16px",
                                    }}
                                  >
                                    <Card
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        boxShadow: snapshot.isDragging ? 8 : 1,
                                        ...(snapshot.isDragging
                                          ? {
                                              borderColor:
                                                theme.palette.primary.main,
                                              borderWidth: "1px",
                                              borderStyle: "solid",
                                              bgcolor: alpha(
                                                theme.palette.primary.light,
                                                0.05
                                              ),
                                            }
                                          : {
                                              borderColor: alpha(
                                                theme.palette.divider,
                                                0.7
                                              ),
                                              borderWidth: "1px",
                                              borderStyle: "solid",
                                              bgcolor:
                                                theme.palette.background.paper,
                                              transition:
                                                "box-shadow 0.2s ease",
                                            }),
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          mb: 2,
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            cursor: snapshot.isDragging
                                              ? "grabbing"
                                              : "grab",
                                          }}
                                          {...provided.dragHandleProps}
                                        >
                                          <DragHandleIcon
                                            sx={{
                                              mr: 1,
                                              color: snapshot.isDragging
                                                ? "primary.main"
                                                : "text.secondary",
                                            }}
                                          />
                                          <Chip
                                            label={
                                              block.type
                                                .charAt(0)
                                                .toUpperCase() +
                                              block.type.slice(1)
                                            }
                                            size="small"
                                            color={
                                              block.type === "text"
                                                ? "primary"
                                                : block.type === "image"
                                                ? "success"
                                                : "error"
                                            }
                                            icon={
                                              block.type === "text" ? (
                                                <TextFieldsIcon />
                                              ) : block.type === "image" ? (
                                                <ImageIcon />
                                              ) : (
                                                <VideoLibraryIcon />
                                              )
                                            }
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              ml: 1,
                                              color: "text.secondary",
                                              fontWeight: "medium",
                                            }}
                                          >
                                            Block {index + 1}
                                          </Typography>
                                        </Box>
                                        <Tooltip title="Remove block">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                              handleDeleteBlock(index)
                                            }
                                            sx={{
                                              "&:hover": {
                                                color: theme.palette.error.dark,
                                              },
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>

                                      <MemoizedContentBlockEditor
                                        block={block}
                                        onChange={(updatedBlock) =>
                                          handleUpdateBlock(index, updatedBlock)
                                        }
                                      />
                                    </Card>
                                  </div>
                                );
                              }}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </>
            )}

            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <SettingsIcon sx={{ mr: 1 }} />
                    Advanced Settings
                  </Typography>

                  <Card
                    variant="outlined"
                    sx={{ p: 2, mb: 3, borderRadius: 2 }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Content Status
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id="status-select-label">Status</InputLabel>
                      <Select
                        labelId="status-select-label"
                        value={(content?.metadata?.status as string) || "draft"}
                        label="Status"
                        onChange={(e) =>
                          handleContentChange("metadata", {
                            ...content?.metadata,
                            status: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>

                    <Typography variant="body2" color="text.secondary">
                      This setting controls the visibility of your content on
                      the frontend.
                    </Typography>
                  </Card>

                  <Card
                    variant="outlined"
                    sx={{ p: 2, mb: 3, borderRadius: 2 }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      SEO Settings
                    </Typography>
                    <TextField
                      label="Meta Title"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={
                        (content?.metadata?.metaTitle as string) ||
                        content?.title ||
                        ""
                      }
                      onChange={(e) =>
                        handleContentChange("metadata", {
                          ...content?.metadata,
                          metaTitle: e.target.value,
                        })
                      }
                      placeholder="Title for search engines (defaults to content title)"
                      helperText="Recommended length: 50-60 characters"
                    />
                    <TextField
                      label="Meta Description"
                      fullWidth
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                      value={
                        (content?.metadata?.metaDescription as string) ||
                        content?.description ||
                        ""
                      }
                      onChange={(e) =>
                        handleContentChange("metadata", {
                          ...content?.metadata,
                          metaDescription: e.target.value,
                        })
                      }
                      placeholder="Description for search engines (defaults to content description)"
                      helperText="Recommended length: 150-160 characters"
                    />
                  </Card>

                  {isEditMode && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <WarningIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="error">
                          Danger Zone
                        </Typography>
                      </Box>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: theme.palette.error.light,
                          bgcolor: alpha(theme.palette.error.light, 0.05),
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" paragraph>
                          Deleting this content will move it to trash. It can be
                          restored later from the trash.
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleDelete}
                        >
                          Delete Content
                        </Button>
                      </Paper>
                    </>
                  )}
                </Grid>
              </Grid>
            )}
          </motion.div>
        </AnimatePresence>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "medium" }}>Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this content? This action will move
            it to trash.
          </DialogContentText>
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
            }}
          >
            <Typography variant="subtitle2">
              Content: {content?.title}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2 }}
          >
            {deleteContentMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unsaved Changes Dialog */}
      <Dialog
        open={unsavedChangesDialog}
        onClose={() => setUnsavedChangesDialog(false)}
        TransitionComponent={Fade}
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "medium" }}>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes that will be lost if you leave this page.
            Do you want to save your changes before leaving?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setUnsavedChangesDialog(false);
              if (pendingNavigation) {
                router.push(pendingNavigation);
              }
            }}
            color="error"
            variant="text"
          >
            Discard Changes
          </Button>
          <Button
            onClick={() => setUnsavedChangesDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Stay on Page
          </Button>
          <Button
            onClick={async () => {
              await handleSave();
              setUnsavedChangesDialog(false);
              if (pendingNavigation) {
                router.push(pendingNavigation);
              }
            }}
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isContentEmpty}
            sx={{ borderRadius: 2 }}
          >
            Save & Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
