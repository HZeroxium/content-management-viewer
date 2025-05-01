// src/app/dashboard/users/page.tsx
"use client";

import React, { useState } from "react";
import { Box, Button, Typography, Card, Grid } from "@mui/material";
import { useUsersList } from "@/lib/query/users.queries";
import UserTable from "./UserTable";
import Link from "next/link";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useUsersList({ page, limit: pageSize });

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
            <Link href="/dashboard/users/create" passHref>
              <Button
                variant="contained"
                startIcon={<PersonAddAltIcon />}
                sx={{ fontWeight: "medium" }}
              >
                Add User
              </Button>
            </Link>
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
