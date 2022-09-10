import { createEditorView } from "./editor-view";
import { createEditorState } from "./editor-state";
import { Node } from "prosemirror-model";
import mitt from "mitt";
import { Events } from "./editor-plugins";

export function createEditor(element: HTMLElement, doc?: Node | {}) {
  const eventEmitter = mitt<Events>();
  const state = createEditorState(doc, eventEmitter);
  const view = createEditorView(element, state);
  return { view, emitter: eventEmitter, state };
}
