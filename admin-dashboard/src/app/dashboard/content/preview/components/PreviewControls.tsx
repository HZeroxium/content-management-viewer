"use client";

import React from "react";
import Link from "next/link";
import {
  Grid,
  IconButton,
  Chip,
  Button,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TabletIcon from "@mui/icons-material/Tablet";
import LaptopIcon from "@mui/icons-material/Laptop";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export type ViewMode = "mobile" | "tablet" | "desktop" | "full";

interface PreviewControlsProps {
  contentId: string;
  contentTitle: string;
  updatedAt?: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isMobile: boolean;
  formattedDate: string;
}

const PreviewControls: React.FC<PreviewControlsProps> = ({
  contentId,
  contentTitle,
  viewMode,
  setViewMode,
  isMobile,
  formattedDate,
}) => {
  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Link href="/dashboard/content" passHref>
            <IconButton edge="start" color="primary">
              <ArrowBackIcon />
            </IconButton>
          </Link>

          <Grid sx={{ overflow: "hidden" }} size={{ xs: 12, md: 7 }}>
            {contentTitle}
          </Grid>

          <Chip
            size="small"
            icon={<AccessTimeIcon fontSize="small" />}
            label={`Updated: ${formattedDate}`}
          />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Stack
          direction="row"
          spacing={1}
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
        >
          {/* Device preview selector */}
          <Tooltip title="Mobile view">
            <IconButton
              color={viewMode === "mobile" ? "primary" : "default"}
              onClick={() => setViewMode("mobile")}
            >
              <SmartphoneIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Tablet view">
            <IconButton
              color={viewMode === "tablet" ? "primary" : "default"}
              onClick={() => setViewMode("tablet")}
            >
              <TabletIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Desktop view">
            <IconButton
              color={viewMode === "desktop" ? "primary" : "default"}
              onClick={() => setViewMode("desktop")}
            >
              <LaptopIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Full width">
            <IconButton
              color={viewMode === "full" ? "primary" : "default"}
              onClick={() => setViewMode("full")}
            >
              <DesktopWindowsIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Action buttons */}
          <Link href={`/dashboard/content/${contentId}`} passHref>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? "Edit" : "Edit Content"}
            </Button>
          </Link>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default PreviewControls;
