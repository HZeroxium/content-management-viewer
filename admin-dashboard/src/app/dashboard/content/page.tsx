// src/app/dashboard/content/page.tsx
"use client";

import React, { useState } from "react";
import { useContentList } from "@/lib/query/content.queries";
import { Box, Button, Typography, Card, Grid } from "@mui/material";
import Link from "next/link";
import ContentTable from "./ContentTable";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function ContentListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading } = useContentList({ page, limit });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
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
            <Link href="/dashboard/content/create" passHref>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                sx={{ fontWeight: "medium" }}
              >
                New Content
              </Button>
            </Link>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ContentTable
            rows={data?.data || []}
            rowCount={data?.meta?.total || 0}
            page={page}
            pageSize={limit}
            loading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
