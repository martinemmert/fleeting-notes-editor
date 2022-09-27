import { createSignal, ParentProps } from "solid-js";
import { Power, Spinner } from "phosphor-solid";
import SessionStore from "../../../lib/store/session";

export function StackedLayout(props: ParentProps) {
  const [loggingOut, setIsLoggingOut] = createSignal(false);

  const logout = async (event: Event) => {
    event.preventDefault();
    setIsLoggingOut(true);
    await SessionStore.logout();
    setIsLoggingOut(false);
    window.location.reload();
  };

  return (
    <>
      <nav class="sticky top-0 bg-gray-800 z-50">
        <div class="flex justify-center py-1">
          <a
            href="#"
            onclick={logout}
            class="block p-2 text-gray-100 transition-colors ease-in-out duration-200 rounded-lg hover:hover:bg-white/10"
          >
            {!loggingOut() && <Power size={32} />}
            {loggingOut() && <Spinner size={32} class="animate-[spin_1s_infinite] " />}
          </a>
        </div>
      </nav>
      <div class="min-h-full overflow-auto py-8">{props.children}</div>
    </>
  );
}
