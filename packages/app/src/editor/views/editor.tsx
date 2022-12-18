import { createEditor, createEditorState, Plugins } from "@fleeting-notes/editor";
import { EditorState } from "prosemirror-state";
import { createEffect, createMemo, observable, onCleanup } from "solid-js";
import { SAVE_EDITOR_INTERVAL } from "../../global";
import { pb } from "../lib/api-client";
import editorStore from "../lib/editor-store";

type Editor = ReturnType<typeof createEditor>;

export default function EditorView() {
  let editor: Editor;
  let container: HTMLDivElement;
  let currentEditorState: EditorState;

  let timeout: number;


  const editorDocumentState = createMemo(() => {
    return {
      doc: editorStore.currentDocument()?.content,
      hashtags: editorStore.currentDocument()?.hashtags ?? {},
    };
  });

  const $currentDocument = observable(editorDocumentState).subscribe((document) => {
    if (document && editor) {
      editor.state = createEditorState(document, editor.emitter);
    }
  });

  const saveEditorState = () => {
    if (currentEditorState) {
      const currentState = currentEditorState.toJSON({
        hashtags: Plugins.Hashtag,
      });
      editorStore.updateCurrentDocument(pb(), currentState.doc, currentState.hashtags);
    }
    timeout = window.setTimeout(saveEditorState, SAVE_EDITOR_INTERVAL);
  };

  createEffect(() => {
    if (!editor && editorStore.isInitialized()) {
      editor = createEditor(container, editorDocumentState());
      currentEditorState = editor.state;
      timeout = window.setTimeout(saveEditorState, SAVE_EDITOR_INTERVAL);
      editor.emitter.on("update", (update) => {
        currentEditorState = update.newState;
      });
      console.info("editor is initialized");
    }
  });

  onCleanup(() => {
    if (timeout) clearTimeout(timeout);
    $currentDocument.unsubscribe();
    editor?.emitter.off("update");
    editor.view.destroy();
  });

  return <div ref={(el) => (container = el)} class="editor" />;
}
