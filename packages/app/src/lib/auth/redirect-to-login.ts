import { AstroGlobal } from "astro";

export function redirectToLogin(Astro: AstroGlobal) {
  return Astro.redirect("/account/sign-in", 302);
}
