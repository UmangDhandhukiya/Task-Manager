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
import { getAuth } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const EditTask = () => {

  const { user } = useSelector((state) => state.auth);
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = await getAuth().currentUser.getIdToken();

        const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();

          throw new Error(text);
        }

        const data = await res.json();

        reset({
          title: data.title || "",
          description: data.description || "",
          dueDate: data.dueDate?.split("T")[0] || "",
          assignedTo: data.assignedTo || "",
          status: data.status || "todo",
        });
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, reset]);

  const onSubmit = async (formData) => {
    try {
      const token = await getAuth().currentUser.getIdToken();

      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          title: formData.title.trim(),

          description: formData.description.trim(),

          dueDate: formData.dueDate,

          assignedTo: formData.assignedTo || null,

          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      user.role === "admin" ? navigate("/admin") : navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <Box textAlign="center" mt={5}>
        {" "}
        <CircularProgress />{" "}
      </Box>
    );

  return (
    <Box maxWidth="500px" mx="auto" mt={5} p={3} border="1px solid #ccc">
      <Typography variant="h5">Edit Task</Typography>

      <form onSubmit={handleSubmit(onSubmit)}>

        <Controller
          name="title"
          control={control}
          rules={{ required: "Title required" }}
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
          rules={{ required: "Description required" }}
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
          rules={{ required: "Due date required" }}
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
          name="status"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Status"
              fullWidth
              margin="normal"
              {...field}
            >
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="complete">Complete</MenuItem>
            </TextField>
          )}
        />

        <Controller
          name="assignedTo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Assigned To UID"
              fullWidth
              margin="normal"
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={isSubmitting}
        >
          Update Task
        </Button>
      </form>
    </Box>
  );
};

export default EditTask;
