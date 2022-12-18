import * as Cookie from "es-cookie";
import PocketBase from "pocketbase";
import { createSignal } from "solid-js";
import { AUTH_COOKIE_KEY, PUBLIC_POCKETBASE_URL } from "../../global";

export const [pb] = createSignal<PocketBase>(new PocketBase(PUBLIC_POCKETBASE_URL));

export function logout() {
  pb().authStore.clear();
}

export function getCurrentUser() {
  return pb().authStore.model;
}

export function getCurrentUserId() {
  return pb().authStore.model?.id;
}

export function hasValidSession() {
  return pb().authStore.isValid;
}

export async function validateServerSession() {
  const token = Cookie.get(AUTH_COOKIE_KEY);
  let user;

  if (token) pb().authStore.save(token, null);

  try {
    if (pb().authStore.isValid) {
      user = await pb().collection("users").authRefresh();
      if (user) refreshAuthCookie(user.token);
    }
  } catch (e) {
    console.error(e);
    Cookie.remove(AUTH_COOKIE_KEY, { path: "/" });
  } finally {
    return user?.record;
  }
}

export async function refreshAuthCookie(token: string) {
  const cookie = pb().authStore.exportToCookie({ httpOnly: false });
  const parsed = Cookie.parse(cookie);
  Cookie.set(AUTH_COOKIE_KEY, token, {
    secure: true,
    path: "/",
    expires: new Date(parsed.Expires),
    sameSite: "strict",
  });
}
