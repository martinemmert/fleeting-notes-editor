import { createEditor } from "@fleeting-notes/editor";
import DocStore from "../../lib/store/doc";
import { createEffect, onCleanup, onMount } from "solid-js";
import { StackedLayout } from "./shells/stacked-layout";

export default function EditorView() {
  let container: HTMLDivElement;
  let editor: ReturnType<typeof createEditor>;

  const onUpdate = ({ newState, tr }: any) => {
    if (tr.docChanged) {
      void DocStore.update(newState.doc);
    }
  };

  onMount(() => {
    void DocStore.initialize();
  });

  createEffect(() => {
    if (!editor && DocStore.state.isReady && DocStore.state.data?.content) {
      editor = createEditor(container, DocStore.state.data?.content);
      editor.emitter.on("update", onUpdate);
    }
  });

  onCleanup(() => {
    editor?.emitter.off("update");
  });

  return (
    <StackedLayout>
      <div class="container mx-auto max-w-4xl">
        <div ref={(el) => (container = el)} class="editor" />
      </div>
    </StackedLayout>
  );
}
