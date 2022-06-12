import { EditorState } from "prosemirror-state";
import { DirectEditorProps, EditorView } from "prosemirror-view";

export function createEditorView(
  element: HTMLElement,
  state: EditorState,
  editorProps?: DirectEditorProps
) {
  return new EditorView(element, { ...editorProps, state });
}
