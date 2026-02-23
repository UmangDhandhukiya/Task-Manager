import { Box, Button, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const token = await result.user.getIdToken();

      const response = await fetch("http://localhost:3000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
        }),
      });

      // const resData = await response.json();  
      navigate("/")
    } catch (e) {
      alert(e.message);
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
          Register
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            {...register("name", { required: "Name required" })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            {...register("email", { required: "Email required" })}
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

          <Button type="submit" variant="contained" color="secondary" fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
            Register
          </Button>

          <Typography textAlign="center" mt={2}>
            Already registered?{" "}
            <Link to="/">
              Login
            </Link>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default Register;
