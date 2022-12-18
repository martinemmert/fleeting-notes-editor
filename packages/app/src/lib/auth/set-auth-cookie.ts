import { AstroGlobal } from "astro";
import { getTokenPayload } from "pocketbase";
import { AUTH_COOKIE_KEY } from "../../global";

export function setAuthCookie(Astro: AstroGlobal, token: string) {
  const tokenPayload = getTokenPayload(token);

  Astro.cookies.set(AUTH_COOKIE_KEY, token, {
    secure: true,
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    expires: new Date(tokenPayload.exp * 1000),
  });
}
