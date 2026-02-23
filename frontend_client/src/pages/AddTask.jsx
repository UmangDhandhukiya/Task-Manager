import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AddTask = () => {
  const { user } = useSelector((state) => state.auth);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const auth = getAuth();
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) return;

        const token = await firebaseUser.getIdToken();

        const res = await fetch("http://localhost:3000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch users");

        const data = await res.json();
        setUsersList(data);
      } catch (error) {
        console.log("Error fetching users:", error.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const auth = getAuth();
      const firebaseUser = auth.currentUser;
      console.log(firebaseUser);
      if (!firebaseUser) {
        alert("User not authenticated");
        return;
      }

      const token = await firebaseUser.getIdToken();

      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
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
      user.role === "admin" ? navigate("/admin") : navigate("/dashboard");
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="title"
          control={control}
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

        <Controller
          name="description"
          control={control}
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

        <Controller
          name="dueDate"
          control={control}
          rules={{
            required: "Due date is required",
            validate: (value) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return (
                new Date(value) > today || "Due date must be a future date"
              );
            },
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

        <Controller
          name="assignedTo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Assign To (Optional)"
              fullWidth
              margin="normal"
            >
              <MenuItem value="">None</MenuItem>
              {loadingUsers ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : (
                usersList.map((u) => (
                 
                  <MenuItem key={u.uid} value={u.uid}>
                    {u.email}
                  </MenuItem>
                ))
              )}
            </TextField>
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          Add Task
        </Button>
      </form>
    </Box>
  );
};

export default AddTask;
