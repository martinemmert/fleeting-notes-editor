import { createEffect } from "solid-js";
import SessionStore from "../../lib/store/session";
import { Outlet, useNavigate } from "@solidjs/router";

export function AuthGuard() {
  const navigate = useNavigate();

  createEffect(() => {
    if (!SessionStore.hasValidSession) {
      navigate("/auth/login", { replace: true });
    }
  });

  return <Outlet />;
}
