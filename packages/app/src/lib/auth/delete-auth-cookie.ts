import { AstroGlobal } from "astro";
import { AUTH_COOKIE_KEY } from "./set-auth-cookie";

export function deleteAuthCookie(Astro: AstroGlobal) {
  Astro.cookies.delete(AUTH_COOKIE_KEY);
}
