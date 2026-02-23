import React, { useEffect, useState } from "react";
import { TextField, Button, Box, Typography, MenuItem } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { getAuth } from "firebase/auth";

const AddTask = () => {
  const { user } = useSelector((state) => state.auth);
  const [usersList, setUsersList] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
          console.log("No authenticated user");
          return;
        }

        const token = await firebaseUser.getIdToken();

        const res = await fetch("http://localhost:3000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setUsersList(data);
      } catch (error) {
        console.log("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        alert("User not authenticated");
        return;
      }

      const token = await firebaseUser.getIdToken();

      const payload = {
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate,
        ownerId: firebaseUser.uid, 
        assignedToUid: data.assignedTo || null,
        createdAt: new Date().toISOString(),
      };

      const res = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create task");
      }

      reset();
      alert("Task Created Successfully");
    } catch (error) {
      console.log("Create Task Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <Box
      maxWidth="500px"
      mx="auto"
      mt={5}
      p={3}
      border="1px solid #ccc"
      borderRadius={2}
    >
      <Typography variant="h5" mb={2}>
        Add Task
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <Controller
          name="title"
          control={control}
          defaultValue=""
          rules={{
            required: "Title is required",
            minLength: {
              value: 3,
              message: "Minimum 3 characters required",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              margin="normal"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          defaultValue=""
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        {/* Status */}
        <Controller
          name="status"
          control={control}
          defaultValue="todo"
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Status"
              fullWidth
              margin="normal"
            >
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </TextField>
          )}
        />

        {/* Due Date */}
        <Controller
          name="dueDate"
          control={control}
          defaultValue=""
          rules={{
            required: "Due date is required",
            validate: (value) =>
              new Date(value) > new Date() || "Due date must be future date",
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!errors.dueDate}
              helperText={errors.dueDate?.message}
            />
          )}
        />

        {/* Assign To */}        <Controller
          name="assignedTo"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Assign To (Optional)"
              fullWidth
              margin="normal"
            >
              <MenuItem value="">None</MenuItem>
              {usersList.map((u) => (
                <MenuItem key={u.uid} value={u.uid}>
                  {u.email}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Create Task
        </Button>
      </form>
    </Box>
  );
};

export default AddTask;
