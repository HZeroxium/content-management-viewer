// src/app/dashboard/content/ContentTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Content } from "@/types/content";
import {
  Box,
  Button,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Chip
} from "@mui/material";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import EditIcon from "@mui/icons-material/Edit";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface Props {
  rows: Content[];
  rowCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export default function ContentTable({
  rows,
  rowCount,
  page,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<Content[]>(rows);
  const [sortField, setSortField] = useState<keyof Content>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Update filtered rows whenever props or filters change
  useEffect(() => {
    let result = [...rows];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter (assuming content has a status field, you may need to adjust this)
    if (statusFilter !== "all") {
      result = result.filter(content => content.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField] || "";
      let valueB = b[sortField] || "";
      
      // Handle dates
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        valueA = new Date(valueA as string).getTime();
        valueB = new Date(valueB as string).getTime();
      } else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }
      
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredRows(result);
  }, [rows, searchTerm, statusFilter, sortField, sortDirection]);

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  // Handlers
  const handleSort = (field: keyof Content) => {
    setSortDirection(prev => 
      field === sortField && prev === "asc" ? "desc" : "asc"
    );
    setSortField(field);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPageSizeChange(parseInt(event.target.value, 10));
    onPageChange(1);
  };
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Search Field - Takes more space on mobile */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by title or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {/* Filter (assuming content has a status field) */}
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        {/* Sort Field */}
        <Grid item xs={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="sort-field-label">Sort By</InputLabel>
            <Select
              labelId="sort-field-label"
              value={sortField}
              onChange={(e) => handleSort(e.target.value as keyof Content)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
              endAdornment={
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {sortDirection.toUpperCase()}
                </Typography>
              }
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Card>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created</TableCell>}
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Updated</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 4} align="center">Loading...</TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 4} align="center">No content found</TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((content) => (
                  <TableRow key={content.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {content.title}
                      </Typography>
                      {content.status && (
                        <Chip 
                          size="small" 
                          label={content.status} 
                          color={
                            content.status === 'published' ? 'success' : 
                            content.status === 'draft' ? 'info' : 'default'
                          } 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell>
                        <Tooltip title={new Date(content.createdAt).toLocaleString()}>
                          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <CalendarTodayIcon fontSize="small" />
                            {formatDate(content.createdAt)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    )}
                    <TableCell>
                      <Tooltip title={new Date(content.updatedAt).toLocaleString()}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <CalendarTodayIcon fontSize="small" />
                          {formatDate(content.updatedAt)}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Link href={`/dashboard/content/${content.id}`} passHref>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={rowCount}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
}
