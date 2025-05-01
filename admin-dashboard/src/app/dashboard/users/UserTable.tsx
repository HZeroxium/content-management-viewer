// src/app/dashboard/users/UserTable.tsx
"use client";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid"; // Changed from DataGridPro to DataGrid
import { User } from "@/types/user";
import { Box, Button } from "@mui/material";
import Link from "next/link";

interface Props {
  rows: User[];
  rowCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export default function UserTable({
  rows,
  rowCount,
  page,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "role", headerName: "Role", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Link href={`/dashboard/users/${params.row.id}`} passHref>
          <Button variant="outlined" size="small">
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pagination
        paginationModel={{
          page: page - 1,
          pageSize: pageSize
        }}
        rowCount={rowCount}
        paginationMode="server"
        onPaginationModelChange={(model) => {
          onPageChange(model.page + 1);
          if (model.pageSize !== pageSize) {
            onPageSizeChange(model.pageSize);
          }
        }}
        loading={loading}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    </Box>
  );
}
