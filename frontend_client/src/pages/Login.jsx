import React from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setLoading } from "../appStore/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
  try {
    dispatch(setLoading(true));

    await signInWithEmailAndPassword(auth, data.email, data.password);

    const token = await auth.currentUser.getIdToken();

    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    let role = "user";
    let name = "";

    if (response.ok) {
      const json = await response.json();
      role = json?.user?.role || "user";
      name = json?.user?.name || "";
    }

    const userData = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      role,
      name,
    };

    dispatch(setUser(userData));

    navigate(role === "admin" ? "/admin" : "/dashboard", {
      replace: true,
    });

  } catch (error) {
    dispatch(setLoading(false));
    alert(error.message);
  }
};

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: "500px",
          p: 4,
          border: "1px solid purple",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" mb={2}>
          Login
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email", {
              required: "Email required",
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register("password", {
              required: "Password required",
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            Login
          </Button>
        </form>

        <Typography textAlign="center" mt={2}>
          Don't have account? <Link to="/register">Register</Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
