import { EditorState } from "prosemirror-state";
import { DirectEditorProps, EditorView } from "prosemirror-view";

export function createEditorView(
  element: HTMLElement,
  state: EditorState,
  editorProps?: DirectEditorProps
) {
  const mount = document.createElement("ul");
  element.append(mount);

  return new EditorView({ mount }, { ...editorProps, state });
}
