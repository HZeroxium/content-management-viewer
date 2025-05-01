// /src/app/dashboard/content/trash/page.tsx

"use client";

import React, { useState } from "react";
import {
  useDeletedContents,
  useRestoreContent,
  usePermanentDeleteContent,
} from "@/lib/hooks/api/useContents";
import {
  Box,
  Button,
  Typography,
  Card,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";
import ContentTable from "../ContentTable";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function TrashContentPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [contentToRestore, setContentToRestore] = useState<string | null>(null);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useDeletedContents({
    page,
    limit: pageSize,
  });
  const restoreContentMutation = useRestoreContent(contentToRestore || "");
  const deleteContentMutation = usePermanentDeleteContent(
    contentToDelete || ""
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleRestoreClick = (id: string) => {
    setContentToRestore(id);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (contentToRestore) {
      try {
        await restoreContentMutation.mutateAsync();
        setRestoreDialogOpen(false);
        setContentToRestore(null);
      } catch (err) {
        console.error("Error restoring content:", err);
      }
    }
  };

  const handleDeleteClick = (id: string) => {
    setContentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (contentToDelete) {
      try {
        await deleteContentMutation.mutateAsync();
        setDeleteDialogOpen(false);
        setContentToDelete(null);
      } catch (err) {
        console.error("Error deleting content permanently:", err);
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
              Deleted Content
            </Typography>
            <Link href="/dashboard/content" passHref>
              <Button startIcon={<ArrowBackIcon />} variant="outlined">
                Back to Content
              </Button>
            </Link>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {error ? (
            <Alert severity="error">
              Error loading deleted content:{" "}
              {error instanceof Error ? error.message : String(error)}
            </Alert>
          ) : isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <ContentTable
              rows={data?.data || []}
              rowCount={data?.meta?.total || 0}
              page={page}
              pageSize={pageSize}
              loading={isLoading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              canDelete={false}
              isTrashView={true}
              onRestoreClick={handleRestoreClick}
              onPermanentDeleteClick={handleDeleteClick}
            />
          )}
        </Grid>
      </Grid>

      {/* Restore Dialog */}
      <Dialog
        open={restoreDialogOpen}
        onClose={() => setRestoreDialogOpen(false)}
      >
        <DialogTitle>Restore Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restore this content? It will be visible
            again in the main content list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRestoreConfirm}
            color="primary"
            variant="contained"
            disabled={restoreContentMutation.isPending}
          >
            {restoreContentMutation.isPending ? "Restoring..." : "Restore"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permanent Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Permanently Delete Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete this content? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteContentMutation.isPending}
          >
            {deleteContentMutation.isPending
              ? "Deleting..."
              : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
