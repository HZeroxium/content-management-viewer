// src/app/dashboard/content/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DragHandleIcon from "@mui/icons-material/DragHandle";
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

export default function ContentDetailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  const { data, isLoading, error } = useContent(isEditMode ? id : "");
  const updateContentMutation = useUpdateContent(id);
  const createContentMutation = useCreateContent();
  const deleteContentMutation = useDeleteContent(id);

  // Initialize content from API data or create new empty content
  useEffect(() => {
    if (data && isEditMode) {
      setContent(data);
      if (data.blocks) {
        setBlocks(
          data.blocks.map((block) => ({
            ...block,
            localId: `block-${uuidv4()}`,
          }))
        );
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
    }

    return () => {
      dispatch(clearCurrentContent());
    };
  }, [data, isEditMode, dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Use isNewContent in a useEffect to set document title
  const isNewContent = !!(
    params.id === "new" || typeof content?.id === "undefined"
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = isNewContent
        ? "Create New Content - Admin Dashboard"
        : `Edit Content: ${content?.title || ""} - Admin Dashboard`;
    }
  }, [isNewContent, content?.title]);

  const handleSave = async () => {
    if (!content) return;

    try {
      dispatch(saveStart());

      // Ensure all properties meet the required types for both DTOs
      const contentData = {
        title: content.title || "", // Ensure never undefined
        description: content.description || "",
        blocks: blocks.map(({ localId: _localId, ...blockData }) => blockData), // Exclude localId
        metadata: content.metadata || {},
      };

      if (isEditMode) {
        await updateContentMutation.mutateAsync(contentData);
      } else {
        await createContentMutation.mutateAsync(contentData);
      }

      dispatch(saveSuccessAction());
      setSaveSuccess(true);

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
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!content?.id) return;

    try {
      await deleteContentMutation.mutateAsync();
      setDeleteDialogOpen(false);
      router.push("/dashboard/content");
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  const handleAddBlock = (type: "text" | "image" | "video") => {
    const newBlock: BlockWithId = {
      type,
      text: "",
      localId: uuidv4(), // localId is used for drag-and-drop identification
      metadata: { position: blocks.length },
    };

    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (index: number, updatedBlock: ContentBlockDto) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = {
      ...updatedBlocks[index],
      ...updatedBlock,
    };
    setBlocks(updatedBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = [...blocks];
    updatedBlocks.splice(index, 1);
    setBlocks(updatedBlocks);
  };

  const handleDragEnd = (result: DropResult) => {
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
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading content...</Typography>
      </Box>
    );
  }

  if (error && isEditMode) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading content:{" "}
          {error instanceof Error ? error.message : String(error)}
        </Alert>
        <Button
          component={Link}
          href="/dashboard/content"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Back to Content List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link href="/dashboard/content" style={{ textDecoration: "none" }}>
            Content
          </Link>
          <Typography color="text.primary">
            {isEditMode ? "Edit Content" : "Create Content"}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1">
            {isEditMode
              ? `Edit Content: ${content?.title}`
              : "Create New Content"}
          </Typography>
          <Box>
            <Button
              component={Link}
              href="/dashboard/content"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={
                updateContentMutation.isPending ||
                createContentMutation.isPending
              }
              startIcon={<SaveIcon />}
            >
              {updateContentMutation.isPending ||
              createContentMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
          </Box>
        </Box>

        {saveStatus && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Content saved successfully!
          </Alert>
        )}

        {contentError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {contentError}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        >
          <Tab label="Basic Details" />
          <Tab label="Content Blocks" />
          <Tab label="Settings" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={content?.title || ""}
                onChange={(e) =>
                  setContent((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
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
                  setContent((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Blocks
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddBlock("text")}
                >
                  Add Text
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddBlock("image")}
                >
                  Add Image
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddBlock("video")}
                >
                  Add Video
                </Button>
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
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                mb: 2,
                                p: 2,
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
                                  }}
                                  {...provided.dragHandleProps}
                                >
                                  <DragHandleIcon
                                    sx={{ mr: 1, color: "text.secondary" }}
                                  />
                                  <Typography variant="subtitle2">
                                    {block.type.charAt(0).toUpperCase() +
                                      block.type.slice(1)}{" "}
                                    Block
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteBlock(index)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>

                              <ContentBlockEditor
                                block={block}
                                onChange={(updatedBlock) =>
                                  handleUpdateBlock(index, updatedBlock)
                                }
                              />
                            </Card>
                          )}
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
              <Typography variant="h6" gutterBottom>
                Advanced Settings
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Additional settings will be available in future updates.
              </Typography>
            </Grid>

            {isEditMode && (
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" color="error" gutterBottom>
                  Danger Zone
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  Delete Content
                </Button>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this content? This action will move
            it to trash.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteContentMutation.isPending}
          >
            {deleteContentMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
