import { createEditorKeymap } from "./editor-keymap";
import { history } from "prosemirror-history";
import { Emitter } from "mitt";
import { EditorState, Plugin, Transaction } from "prosemirror-state";

export type Events = {
  update: {
    tr: Transaction;
    value: unknown;
    oldState: EditorState;
    newState: EditorState;
  };
};

function createUpdateEmitter(emitter: Emitter<Events>) {
  return new Plugin({
    state: {
      init: () => {},
      apply: (tr, value, oldState, newState) => {
        emitter.emit("update", { tr, value, oldState, newState });
      },
    },
  });
}

export function createEditorPluginsArray(emitter?: Emitter<Events>) {
  const plugins = [createEditorKeymap(), history()];
  if (emitter) plugins.push(createUpdateEmitter(emitter));
  return plugins;
}
