import { Node } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { createEditorPluginsArray, Events } from "./editor-plugins";
import { createEditorSchema } from "./editor-schema";
import { Emitter } from "mitt";
import { Plugins } from "./index";

export function createEditorState(documentState?: any, eventEmitter?: Emitter<Events>) {
  const schema = createEditorSchema();
  const plugins = createEditorPluginsArray(schema, eventEmitter);
  const config = { schema, plugins };

  let state: EditorState;

  if (
    documentState &&
    documentState.hasOwnProperty("doc") &&
    documentState.hasOwnProperty("hashtags")
  ) {
    if (!documentState.selection) {
      documentState.selection = {
        type: "text",
        anchor: 2,
        head: 2,
      };
    }

    state = EditorState.fromJSON(config, documentState, {
      hashtags: Plugins.Hashtag,
    });
  } else {
    let initialDoc;

    if (documentState instanceof Node) {
      initialDoc = documentState;
    }

    if (documentState?.hasOwnProperty("type") && documentState.type === "doc") {
      initialDoc = Node.fromJSON(schema, documentState);
    }

    state = EditorState.create({ doc: initialDoc, ...config });
  }

  return state.apply(state.tr.setMeta("__init__", true));
}
