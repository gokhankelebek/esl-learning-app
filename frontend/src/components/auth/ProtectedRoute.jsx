import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - user:", user);
  console.log("ProtectedRoute - loading:", loading);

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Authenticated, rendering protected content");
  return children;
};

export default ProtectedRoute;
