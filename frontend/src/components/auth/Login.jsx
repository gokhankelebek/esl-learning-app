import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleDirectLogin = async () => {
    try {
      // Generate a temporary token
      const tempToken = `temp_token_${Date.now()}`;
      localStorage.setItem("token", tempToken);

      // Create temporary user data
      const userData = {
        name: "Temporary User",
        email: "temp@example.com",
        level: "beginner",
      };

      // Store user data and update context
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      console.log("Setting temporary user:", userData);

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to ESL Learning App
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleDirectLogin}
            sx={{ mt: 3, mb: 2 }}
          >
            Continue as Guest
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
