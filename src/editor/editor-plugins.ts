import { createEditorKeymap } from "./editor-keymap";
import { history } from "prosemirror-history";
import { Emitter } from "mitt";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { Node, NodeType } from "prosemirror-model";
import { nanoid } from "nanoid";

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
  const isTargetNodeOfType = (node: Node, type: NodeType) => node.type === type;
  const nodeHasAttribute = (node: Node, attrName: string) =>
    Boolean(node.attrs && node.attrs[attrName]);

  return new Plugin({
    appendTransaction: (transactions, _prevState, nextState) => {
      const tr = nextState.tr;
      let modified = false;

      if (transactions.some((transaction) => transaction.docChanged)) {
        nextState.doc.descendants((node, pos) => {
          const { note } = nextState.schema.nodes;
          if (isTargetNodeOfType(node, note) && !nodeHasAttribute(node, "id")) {
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
