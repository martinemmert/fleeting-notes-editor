import { createSignal } from "solid-js";
import PocketBase from "pocketbase";

export const [pbClient] = createSignal<PocketBase>(
  new PocketBase(import.meta.env.VITE_POCKETBASE_URL)
);
