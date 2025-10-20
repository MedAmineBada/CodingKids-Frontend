import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  check_access_token,
  check_refresh_token,
  refresh,
} from "@/services/AuthServices.js";
import { disconnect } from "@/services/utils.js"; // your existing function

export default function ProtectedRoutes({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function validateSession() {
      try {
        const accessOk = await check_access_token();

        if (accessOk) return;

        const refreshOk = await check_refresh_token();
        if (!refreshOk) {
          disconnect();
          return;
        }

        const refreshSuccess = await refresh();

        const accessOkAfter = await check_access_token();
        if (!accessOkAfter || !refreshSuccess) {
          disconnect();
        }
      } catch (err) {
        disconnect();
      }
    }

    validateSession();
  }, [location]);

  return children;
}
