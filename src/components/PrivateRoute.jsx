import { Navigate } from "react-router-dom";
import { getToken } from "../services/tokenManager";

const PrivateRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;