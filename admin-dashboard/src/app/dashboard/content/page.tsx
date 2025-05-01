// src/app/dashboard/content/page.tsx
"use client";

import React, { useState } from "react";
import { useContentList } from "@/lib/query/content.queries";
import { Content } from "@/types/content";
import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function ContentListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading } = useContentList({ page, limit });

  const columns: GridColDef<Content>[] = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "createdAt", headerName: "Created At", width: 180 },
    { field: "updatedAt", headerName: "Updated At", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Link href={`/dashboard/content/${params.row.id}`} passHref>
          <Button variant="outlined" size="small">
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Content</Typography>
        <Link href="/dashboard/content/create" passHref>
          <Button variant="contained">New Content</Button>
        </Link>
      </Box>

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          pagination
          paginationModel={{
            page: page - 1,
            pageSize: limit,
          }}
          rowCount={data?.meta?.total || 0}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            if (model.pageSize !== limit) {
              setLimit(model.pageSize);
            }
          }}
          loading={isLoading}
          pageSizeOptions={[5, 10, 20]}
        />
      </Box>
    </Box>
  );
}
