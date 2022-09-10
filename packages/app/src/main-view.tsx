import { createEditor } from "@fleeting-notes/editor";
import { onMount } from "solid-js";
import DemoDoc from "./demo-doc.json";

export function MainView() {
  let container: HTMLDivElement;

  onMount(() => {
    createEditor(container, DemoDoc);
  });

  return (
    <div class="container mx-auto m-4 max-w-4xl">
      <div ref={(el) => (container = el)} class="editor" />
    </div>
  );
}
