import { Node } from "prosemirror-model";
import { EditorState, EditorStateConfig } from "prosemirror-state";
import { createEditorPluginsArray, Events } from "./editor-plugins";
import { createEditorSchema } from "./editor-schema";
import { Emitter } from "mitt";

export function createEditorState(
  doc?: Node | {},
  eventEmitter?: Emitter<Events>,
  config?: Omit<EditorStateConfig, "doc" | "schema"> | {}
) {
  const schema = createEditorSchema();
  let initialDoc = doc;

  if (doc && !(doc instanceof Node)) {
    initialDoc = Node.fromJSON(schema, doc);
  }

  const state = EditorState.create({
    doc: initialDoc as Node,
    plugins: createEditorPluginsArray(eventEmitter),
    schema,
    ...config,
  });

  return state.apply(state.tr.setMeta("__init__", true));
}
