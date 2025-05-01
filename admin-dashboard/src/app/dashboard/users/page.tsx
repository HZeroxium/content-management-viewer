// src/app/dashboard/users/page.tsx
"use client";

import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useUsersList } from "@/lib/query/users.queries";
import UserTable from "./UserTable";
import Link from "next/link";

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
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Users</Typography>
        <Link href="/dashboard/users/create" passHref>
          <Button variant="contained">Add User</Button>
        </Link>
      </Box>

      <UserTable
        rows={data?.data || []}
        rowCount={data?.meta?.total || 0}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
}
