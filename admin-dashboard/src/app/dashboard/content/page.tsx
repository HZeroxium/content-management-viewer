// src/app/dashboard/content/page.tsx

"use client";

import React, { useState } from "react";
import { useContents } from "@/lib/hooks/api/useContents";
import { Box, Button, Typography, Card, Grid, Alert } from "@mui/material";
import Link from "next/link";
import ContentTable from "./ContentTable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

export default function ContentListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error } = useContents({ page, limit: pageSize });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
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
              Content Management
            </Typography>
            <Box>
              <Link href="/dashboard/content/trash" passHref>
                <Button
                  variant="outlined"
                  startIcon={<RestoreFromTrashIcon />}
                  sx={{ mr: 2 }}
                >
                  Trash
                </Button>
              </Link>
              <Link href="/dashboard/content/create" passHref>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  sx={{ fontWeight: "medium" }}
                >
                  Create Content
                </Button>
              </Link>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Error loading content:{" "}
              {error instanceof Error ? error.message : String(error)}
            </Alert>
          ) : (
            <ContentTable
              rows={data?.data || []}
              rowCount={data?.meta?.total || 0}
              page={page}
              pageSize={pageSize}
              loading={isLoading}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
