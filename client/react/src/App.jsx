import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user, isAuthenticated } = useAuthStore()
  useEffect(()=>{
    console.log("User got changed : app")
    console.log("user", user);
    console.log("isAuthenticated", isAuthenticated)
  },[user])
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;