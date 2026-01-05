import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import SideBar from "./SideBar";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  console.log(
    "protected route getting called", isAuthenticated
  )
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <SideBar> {children} </SideBar>;
}
