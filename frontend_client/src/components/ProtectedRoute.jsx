import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const auth = useSelector((state) => state.auth);

  if (auth.loading) return <p>Loading...</p>;

  if (!auth.user) return <Navigate to="/" replace />;

  if (adminOnly && auth.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
