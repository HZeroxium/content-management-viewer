// src/app/dashboard/users/page.tsx

"use client";

import React, { useState } from "react";
import { Box, Button, Typography, Card, Grid } from "@mui/material";
import { useUsers } from "@/lib/hooks/api/useUsers"; // Updated import path
import UserTable from "./UserTable";
import Link from "next/link";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useUsers({ page, limit: pageSize });

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
              User Management
            </Typography>
            <Box>
              <Link href="/dashboard/users/trash" passHref>
                <Button
                  variant="outlined"
                  startIcon={<RestoreFromTrashIcon />}
                  sx={{ mr: 2 }}
                >
                  Deleted Users
                </Button>
              </Link>
              <Link href="/dashboard/users/create" passHref>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAltIcon />}
                  sx={{ fontWeight: "medium" }}
                >
                  Add User
                </Button>
              </Link>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <UserTable
            rows={data?.data || []}
            rowCount={data?.meta?.total || 0}
            page={page}
            pageSize={pageSize}
            loading={isLoading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
