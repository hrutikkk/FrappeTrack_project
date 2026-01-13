import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import SideBar from "./SideBar";

export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    user,
    authInitialized
  } = useAuthStore();

  // // ⏳ Wait until backend check completes
  if (!authInitialized) {
    return <div>Loading...</div>;
  }

  // ❌ Only redirect AFTER verification
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <SideBar>{children}</SideBar>;
}
