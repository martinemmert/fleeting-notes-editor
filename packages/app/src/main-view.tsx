import { createEditor } from "@fleeting-notes/editor";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import DemoDoc from "./demo-doc.json";

export function MainView() {
  let container: HTMLDivElement;
  let editor: ReturnType<typeof createEditor>;

  const [doc, setDoc] = createSignal<unknown>();

  const onUpdate = ({ newState, tr }: any) => {
    if (tr.docChanged) setDoc(newState.doc);
  };

  onMount(() => {
    let doc = DemoDoc;

    // todo: put this outside of solidjs
    if (window.localStorage) {
      const jsonString = window.localStorage.getItem("doc");
      if (jsonString && typeof jsonString !== "undefined") {
        doc = JSON.parse(jsonString);
      }
    }

    editor = createEditor(container, doc);
    editor.emitter.on("update", onUpdate);
  });

  onCleanup(() => {
    editor.emitter.off("update");
  });

  createEffect(() => {
    // todo: put this outside of solidjs
    const currentDoc = doc();
    if (window.localStorage && currentDoc) {
      const jsonString = JSON.stringify(currentDoc);
      window.localStorage.setItem("doc", jsonString);
    }
  });

  return (
    <div class="container mx-auto m-4 max-w-4xl">
      <div ref={(el) => (container = el)} class="editor" />
    </div>
  );
}
