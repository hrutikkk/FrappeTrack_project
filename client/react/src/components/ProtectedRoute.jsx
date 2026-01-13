import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import SideBar from "./SideBar";
import { FiLoader } from "react-icons/fi";

export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    user,
    authInitialized
  } = useAuthStore();

  // // ⏳ Wait until backend check completes
  if (!authInitialized) {
    return <div className="flex justify-center items-center min-h-screen"><FiLoader className="animate-spin text-3xl text-blue-600" /></div>;
  }

  // ❌ Only redirect AFTER verification
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <SideBar>{children}</SideBar>;
}
