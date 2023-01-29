import { onCleanup } from "solid-js";

export default function clickOutside(el: Element, accessor: () => any) {
  const onClick = ({ target }: MouseEvent) => {
    !el.contains(target as Node) && accessor()?.();
  };

  document.body.addEventListener("click", onClick);

  onCleanup(() => document.body.removeEventListener("click", onClick));
}
