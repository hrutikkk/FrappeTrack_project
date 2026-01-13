import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Tracker from "./pages/Tracker";
import LoginTesting from "./pages/LoginTesting";

function App() {

  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth(); // 🔥 THIS WAS MISSING
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginTesting />} />
        
        <Route
          path="/user-profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/time-tracker"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;