import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Etudiants from "@/pages/Etudiants.jsx";
import Enseignants from "@/pages/Enseignants.jsx";
import ProtectedRoutes from "@/components/ProtectedRoutes/ProtectedRoutes.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/etudiants"
          element={
            <ProtectedRoutes>
              <Etudiants />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/enseignants"
          element={
            <ProtectedRoutes>
              <Enseignants />
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
