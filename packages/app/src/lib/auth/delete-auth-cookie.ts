import { AstroGlobal } from "astro";
import { AUTH_COOKIE_KEY } from "../../global";

export function deleteAuthCookie(Astro: AstroGlobal) {
  Astro.cookies.delete(AUTH_COOKIE_KEY);
}
