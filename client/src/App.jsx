import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/layouts";
import { ProtectedRoute, CustomLoadingIndicator } from "@/components"; // Import your CustomLoadingIndicator component
import { SignIn, SignUp } from "@/pages/auth";
import { useAuth } from "./context/authContext";
import WowNina from "./pages/test/wownina";

function App() {
  const { isLoading } = useAuth();

  return (
    <Routes>
      {/* Authentication routes */}
      <Route path="/auth/*" element={<SignIn />} />
      <Route path="/auth/sign-up" element={<SignUp />} />

      {/* Dashboard routes (protected) */}
      {isLoading ? (
        <Route path="/*" element={<CustomLoadingIndicator />} /> // Show loading indicator for all routes
      ) : (
        <>
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute
                element={<Dashboard />} // Pass the userRole here
                allowedRoles={[1, 2]} // Example: Define allowed roles for dashboard access
              />
            }
          />
          <Route path="/wownina" element={<WowNina />} />
          {/* Default redirect for unknown routes */}
          <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
