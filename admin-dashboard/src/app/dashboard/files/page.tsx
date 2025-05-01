// /src/app/dashboard/files/page.tsx

"use client";

import React, { useState } from "react";
import { Box, Button, Typography, Card, Grid } from "@mui/material";
import { useFiles } from "@/lib/hooks/api/useFiles";
import FileTable from "./FileTable";
import Link from "next/link";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

export default function FilesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, error } = useFiles({
    page,
    limit: pageSize,
  });

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
              File Management
            </Typography>
            <Box>
              <Link href="/dashboard/files/trash" passHref>
                <Button
                  variant="outlined"
                  startIcon={<RestoreFromTrashIcon />}
                  sx={{ mr: 2 }}
                >
                  Trash
                </Button>
              </Link>
              <Link href="/dashboard/files/upload" passHref>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ fontWeight: "medium" }}
                >
                  Upload File
                </Button>
              </Link>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          {error ? (
            <Card sx={{ p: 3 }}>
              <Typography color="error">
                Error loading files:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </Typography>
            </Card>
          ) : (
            <FileTable
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
