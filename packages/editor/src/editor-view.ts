import { EditorState } from "prosemirror-state";
import { DirectEditorProps, EditorView } from "prosemirror-view";
import "./index.css";
import IconSpriteSheet from "./assets/icons.svg?raw";

export function createEditorView(
  element: HTMLElement,
  state: EditorState,
  editorProps?: Omit<DirectEditorProps, "state">
) {
  const mount = document.createElement("ul");
  element.innerHTML = IconSpriteSheet;
  element.append(mount);

  return new EditorView({ mount }, { ...editorProps, state });
}
