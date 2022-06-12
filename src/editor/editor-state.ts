import { Node } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { createEditorPluginsArray, Events } from "./editor-plugins";
import { createEditorSchema } from "./editor-schema";
import { Emitter } from "mitt";

export function createEditorState(doc?: Node, eventEmitter?: Emitter<Events>) {
  return EditorState.create({
    doc,
    plugins: createEditorPluginsArray(eventEmitter),
    schema: createEditorSchema(),
  });
}
