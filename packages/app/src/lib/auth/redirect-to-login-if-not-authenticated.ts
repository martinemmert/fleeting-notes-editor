import { AstroGlobal } from "astro";
import { deleteAuthCookie } from "./delete-auth-cookie";
import { redirectToLogin } from "./redirect-to-login";
import { setAuthCookie } from "./set-auth-cookie";
import { validateUserSession } from "./validate-user-session";

export async function redirectToLoginIfNotAuthenticated(Astro: AstroGlobal) {
  const user = await validateUserSession(Astro);
  if (user) {
    setAuthCookie(Astro, user.token);
    return null;
  } else {
    deleteAuthCookie(Astro);
    return redirectToLogin(Astro);
  }
}
