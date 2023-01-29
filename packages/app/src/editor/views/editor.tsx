import { createEditor, createEditorState, Plugins } from "@fleeting-notes/editor";
import { createEffect, onCleanup, untrack } from "solid-js";
import { SAVE_EDITOR_INTERVAL } from "../../global";
import { pb } from "../lib/api-client";
import DocumentsCollection from "../lib/document-collection";
import DocumentCollection from "../lib/document-collection";
import { useNavigate, useParams } from "@solidjs/router";
import { unwrap } from "solid-js/store";
import EditorNoteTitle from "./editor-note-title";

type Editor = ReturnType<typeof createEditor>;

type EditorParams = { id?: string };

export default function EditorView() {
  let editor: Editor;
  let container: HTMLDivElement;
  let saveInterval: number;

  const params = useParams<EditorParams>();
  const navigate = useNavigate();

  createEffect(() => {
    if (params.id) {
      const previousDocumentId = untrack(DocumentCollection.state.currentDocumentId);

      DocumentsCollection.actions.selectCurrentDocument(params.id);

      if (editor && previousDocumentId && params.id !== previousDocumentId) {
        const stateData = editor.view.state.toJSON({
          hashtags: Plugins.Hashtag,
        });

        const documentData = {
          content: stateData.doc,
          hashtags: stateData.hashtags,
        };

        void DocumentsCollection.actions.saveDocument(pb(), previousDocumentId, documentData);

        const newData = untrack(DocumentsCollection.state.currentDocumentData);
        const state = createEditorState(unwrap(newData), editor.emitter);
        editor.view.updateState(state);
      }
    }

    if (!params.id) {
      const currentId = DocumentsCollection.state.currentDocumentId();
      navigate(`/${currentId}`, { replace: true });
    }
  });

  createEffect(() => {
    if (!editor && DocumentsCollection.state.isInitialized()) {
      if (params.id !== DocumentsCollection.state.currentDocumentId()) {
        navigate(`/${DocumentsCollection.state.currentDocumentId()}`, { replace: true });
      }
      editor = createEditor(container, unwrap(DocumentsCollection.state.currentDocumentData()));
      saveInterval = window.setInterval(() => {
        const documentId = DocumentCollection.state.currentDocumentId();

        if (documentId) {
          const stateData = editor.view.state.toJSON({
            hashtags: Plugins.Hashtag,
          });
          void DocumentsCollection.actions.saveDocument(pb(), documentId, {
            content: stateData.doc,
            hashtags: stateData.hashtags,
          });
        }
      }, SAVE_EDITOR_INTERVAL);
      console.info("editor is initialized");
    }
  });

  onCleanup(() => {
    if (saveInterval) clearInterval(saveInterval);
    editor?.view.destroy();
  });

  return (
    <div class="py-16 w-full max-w-5xl">
      <EditorNoteTitle />
      <div ref={(el) => (container = el)} class="editor" />
    </div>
  );
}
