// /src/app/dashboard/content/[id]/ContentBlockEditor.tsx

"use client";

import React, { useState } from "react";
import { ContentBlockDto } from "@/lib/types/content";
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel,
  Collapse,
  alpha,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";

import RichTextEditor from "../components/RichTextEditor";
import FileSelector from "./FileSelector";

interface ContentBlockEditorProps {
  block: ContentBlockDto;
  onChange: (updatedBlock: ContentBlockDto) => void;
}

export default function ContentBlockEditor({
  block,
  onChange,
}: ContentBlockEditorProps) {
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const theme = useTheme();

  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(
    block.type === "image" || block.type === "video"
      ? typeof block.url === "string"
        ? block.url
        : typeof block.metadata?.fileUrl === "string"
        ? block.metadata.fileUrl
        : null
      : null
  );

  const handleTextChange = (html: string) => {
    onChange({
      ...block,
      text: html,
      metadata: {
        ...block.metadata,
        isRichText: true,
      },
    });
  };

  const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...block,
      text: event.target.value,
    });
  };

  const handleMetadataChange = (field: string, value: string | boolean) => {
    onChange({
      ...block,
      metadata: {
        ...block.metadata,
        [field]: value,
      },
    });
  };

  const handleFileSelect = (fileId: string, fileUrl: string) => {
    setSelectedFileUrl(fileUrl);
    onChange({
      ...block,
      url: fileUrl,
      metadata: {
        ...block.metadata,
        fileId: fileId,
        fileUrl: fileUrl,
      },
    });
    setFileSelectorOpen(false);
  };

  const renderBlockEditor = () => {
    switch (block.type) {
      case "text":
        return (
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: "flex", alignItems: "center" }}
            >
              <TextFieldsIcon fontSize="small" sx={{ mr: 0.5 }} />
              Rich Text Content
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 0,
                overflow: "hidden",
                borderRadius: 1,
                transition: "box-shadow 0.2s",
                "&:hover, &:focus-within": {
                  boxShadow: `0 0 0 2px ${alpha(
                    theme.palette.primary.main,
                    0.25
                  )}`,
                },
              }}
            >
              <RichTextEditor
                content={block.text || ""}
                onChange={handleTextChange}
                placeholder="Enter text here..."
                autoFocus={!block.text}
              />
            </Paper>
          </Box>
        );

      case "image":
        return (
          <Box sx={{ width: "100%" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, display: "flex", alignItems: "center" }}
                >
                  <ImageIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Image Block
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    borderStyle: "dashed",
                    borderColor: selectedFileUrl ? "transparent" : "divider",
                    bgcolor: "background.paper",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 200,
                  }}
                >
                  {selectedFileUrl ? (
                    <>
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: 200,
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={selectedFileUrl}
                          alt="Selected image"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </Box>
                      <Box
                        sx={{
                          mt: 2,
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Tooltip title="Change image">
                          <IconButton
                            color="primary"
                            onClick={() => setFileSelectorOpen(true)}
                            size="small"
                          >
                            <FileUploadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove image">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedFileUrl(null);
                              onChange({
                                ...block,
                                url: "",
                                metadata: {
                                  ...block.metadata,
                                  fileId: "",
                                  fileUrl: "",
                                },
                              });
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </>
                  ) : (
                    <Tooltip title="Select an image from your media library">
                      <Box
                        onClick={() => setFileSelectorOpen(true)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          p: 3,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            "& .uploadIcon": {
                              transform: "scale(1.1)",
                              color: theme.palette.primary.main,
                            },
                          },
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <ImageIcon
                          className="uploadIcon"
                          sx={{
                            fontSize: 60,
                            color: "text.secondary",
                            mb: 1,
                            transition: "all 0.2s",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Click to select an image
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ height: "100%" }}>
                  <TextField
                    label="Image Caption (optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={block.text || ""}
                    onChange={handleCaptionChange}
                    sx={{ mb: 2 }}
                    placeholder="Describe this image"
                    variant="outlined"
                  />

                  <TextField
                    label="Alt Text (for accessibility)"
                    fullWidth
                    value={(block.metadata?.alt as string) || ""}
                    onChange={(e) =>
                      handleMetadataChange("alt", e.target.value)
                    }
                    placeholder="Describe the image for screen readers"
                    sx={{ mb: 2 }}
                    helperText="Important for SEO and accessibility"
                  />

                  <Box sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        py: 1,
                      }}
                      onClick={() =>
                        setShowAdvancedSettings(!showAdvancedSettings)
                      }
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SettingsIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Advanced Image Settings
                        </Typography>
                      </Box>
                      {showAdvancedSettings ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </Box>

                    <Collapse in={showAdvancedSettings}>
                      <Box
                        sx={{
                          pl: 4,
                          pr: 2,
                          py: 1,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                (block.metadata?.cover as boolean) || false
                              }
                              onChange={(e) =>
                                handleMetadataChange("cover", e.target.checked)
                              }
                              size="small"
                            />
                          }
                          label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body2">
                                Full-width cover image
                              </Typography>
                              <Tooltip title="Makes the image span the full width of the content area">
                                <AspectRatioIcon
                                  fontSize="small"
                                  sx={{ ml: 1, color: "text.secondary" }}
                                />
                              </Tooltip>
                            </Box>
                          }
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                (block.metadata?.rounded as boolean) || false
                              }
                              onChange={(e) =>
                                handleMetadataChange(
                                  "rounded",
                                  e.target.checked
                                )
                              }
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Rounded corners
                            </Typography>
                          }
                        />
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <FileSelector
              open={fileSelectorOpen}
              onClose={() => setFileSelectorOpen(false)}
              onSelect={handleFileSelect}
              acceptTypes={["image"]}
            />
          </Box>
        );

      case "video":
        return (
          <Box sx={{ width: "100%" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, display: "flex", alignItems: "center" }}
                >
                  <VideoLibraryIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Video Block
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    borderStyle: "dashed",
                    borderColor: selectedFileUrl ? "transparent" : "divider",
                    bgcolor: "background.paper",
                    position: "relative",
                    overflow: "hidden",
                    minHeight: 200,
                  }}
                >
                  {selectedFileUrl ? (
                    <>
                      <Box
                        component="video"
                        controls
                        src={selectedFileUrl}
                        sx={{
                          width: "100%",
                          maxHeight: 200,
                          borderRadius: 1,
                        }}
                      />
                      <Box
                        sx={{
                          mt: 2,
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Tooltip title="Change video">
                          <IconButton
                            color="primary"
                            onClick={() => setFileSelectorOpen(true)}
                            size="small"
                          >
                            <FileUploadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove video">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setSelectedFileUrl(null);
                              onChange({
                                ...block,
                                url: "",
                                metadata: {
                                  ...block.metadata,
                                  fileId: "",
                                  fileUrl: "",
                                },
                              });
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </>
                  ) : (
                    <Tooltip title="Select a video from your media library">
                      <Box
                        onClick={() => setFileSelectorOpen(true)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          p: 3,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            "& .uploadIcon": {
                              transform: "scale(1.1)",
                              color: theme.palette.primary.main,
                            },
                          },
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <VideoLibraryIcon
                          className="uploadIcon"
                          sx={{
                            fontSize: 60,
                            color: "text.secondary",
                            mb: 1,
                            transition: "all 0.2s",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Click to select a video
                        </Typography>
                      </Box>
                    </Tooltip>
                  )}
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ height: "100%" }}>
                  <TextField
                    label="Video Caption (optional)"
                    fullWidth
                    multiline
                    rows={2}
                    value={block.text || ""}
                    onChange={handleCaptionChange}
                    sx={{ mb: 2 }}
                    placeholder="Describe this video"
                    variant="outlined"
                  />

                  <Box sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        py: 1,
                      }}
                      onClick={() =>
                        setShowAdvancedSettings(!showAdvancedSettings)
                      }
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SettingsIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Advanced Video Settings
                        </Typography>
                      </Box>
                      {showAdvancedSettings ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </Box>

                    <Collapse in={showAdvancedSettings}>
                      <Box
                        sx={{
                          pl: 4,
                          pr: 2,
                          py: 1,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                (block.metadata?.autoplay as boolean) || false
                              }
                              onChange={(e) =>
                                handleMetadataChange(
                                  "autoplay",
                                  e.target.checked
                                )
                              }
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Autoplay (muted)
                            </Typography>
                          }
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                (block.metadata?.loop as boolean) || false
                              }
                              onChange={(e) =>
                                handleMetadataChange("loop", e.target.checked)
                              }
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">Loop video</Typography>
                          }
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                (block.metadata?.controls as boolean) !== false
                              }
                              onChange={(e) =>
                                handleMetadataChange(
                                  "controls",
                                  e.target.checked
                                )
                              }
                              size="small"
                              defaultChecked={true}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Show controls
                            </Typography>
                          }
                        />
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <FileSelector
              open={fileSelectorOpen}
              onClose={() => setFileSelectorOpen(false)}
              onSelect={handleFileSelect}
              acceptTypes={["video"]}
            />
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography color="error">
              Unknown block type: {block.type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {renderBlockEditor()}
    </Box>
  );
}
