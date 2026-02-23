import React from "react";
import { TextField, MenuItem, Stack } from "@mui/material";

const SearchFilter = ({
  search,
  status,
  dueDate,
  onSearchChange,
  onStatusChange,
  onDateChange,
}) => {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} mt={3}>

      <TextField
        label="Search Task"
        variant="outlined"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        fullWidth
      />

      <TextField
        select
        label="Status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>

        <MenuItem value="todo">Todo</MenuItem>

        <MenuItem value="in-progress">In Progress</MenuItem>

        <MenuItem value="complete">Complete</MenuItem>
      </TextField>

      <TextField
        type="date"
        value={dueDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
    </Stack>
  );
};

export default SearchFilter;
