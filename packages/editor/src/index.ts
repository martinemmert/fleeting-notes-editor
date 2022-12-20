import mitt from "mitt";
import { Events } from "./editor-plugins";
import { createEditorState } from "./editor-state";
import { createEditorView } from "./editor-view";
import { createHashtagsPlugin } from "./plugins/hashtags/hashtags";

export function createEditor(element: HTMLElement, documentState?: any) {
  const eventEmitter = mitt<Events>();
  const editorState = createEditorState(documentState, eventEmitter);
  const view = createEditorView(element, editorState, { attributes: { spellcheck: "false" } });
  return { view, emitter: eventEmitter, state: editorState };
}

const Plugins = {
  Hashtag: createHashtagsPlugin(),
};

export { createEditorState, Plugins };
