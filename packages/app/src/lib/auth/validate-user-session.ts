import { AstroGlobal } from "astro";
import PocketBase from "pocketbase";
import { AUTH_COOKIE_KEY, PUBLIC_POCKETBASE_URL } from "../../global";

async function refresh(pb: PocketBase, token: string) {
  try {
    pb.authStore.save(token, null);
    return await pb.collection("users").authRefresh();
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function validateUserSession(Astro: AstroGlobal) {
  const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  const pbCookie = Astro.cookies.get(AUTH_COOKIE_KEY);

  if (pbCookie && typeof pbCookie.value === "string") {
    const user = await refresh(pb, pbCookie.value);

    return user;
  }

  return null;
}
