import { createEditorKeymap } from "./editor-keymap";
import { history } from "prosemirror-history";
import { Emitter } from "mitt";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { nanoid } from "nanoid";
import { isTargetNodeOfType, nodeHasAttribute } from "./editor-utils";

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

function createAddNoteIdPlugin() {
  return new Plugin({
    appendTransaction: (transactions, _prevState, nextState) => {
      const tr = nextState.tr;
      let modified = false;

      if (transactions.some((tr) => tr.docChanged || tr.getMeta("__init__"))) {
        nextState.doc.descendants((node, pos) => {
          const { note } = nextState.schema.nodes;
          if (
            isTargetNodeOfType(node, note) && //
            !nodeHasAttribute(node, "id") &&
            node.textContent.trim() !== ""
          ) {
            const attrs = node.attrs;
            tr.setNodeMarkup(pos, undefined, { ...attrs, id: nanoid(16) });
            modified = true;
          }
        });
      }

      return modified ? tr : null;
    },
  });
}

export function createEditorPluginsArray(emitter?: Emitter<Events>) {
  const plugins = [createEditorKeymap(), createAddNoteIdPlugin(), history()];
  if (emitter) plugins.push(createUpdateEmitter(emitter));
  return plugins;
}
