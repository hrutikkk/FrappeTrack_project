import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import SideBar from "./SideBar";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { user, isCheckingAuth } = useAuthStore()
  console.log(
    "protected route getting called", isAuthenticated
  )
  if (isCheckingAuth) return <div className="flex justify-center items-center min-h-screen bg-black text-white">Loading</div>
  if (!isAuthenticated && !user) {
    return <Navigate to="/" replace />;
  }

  return <SideBar> {children} </SideBar>;
}
