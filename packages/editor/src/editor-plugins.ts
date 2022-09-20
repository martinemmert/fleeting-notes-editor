import { createEditorKeymap } from "./editor-keymap";
import { history } from "prosemirror-history";
import { Emitter } from "mitt";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { nanoid } from "nanoid";
import { isTargetNodeOfType, nodeHasAttribute } from "./editor-utils";
import { Schema } from "prosemirror-model";
import { AttrStep } from "prosemirror-transform";
import { Decoration, DecorationSet } from "prosemirror-view";

export type Events = {
  update: {
    tr: Transaction;
    value: unknown;
    oldState: EditorState;
    newState: EditorState;
  };
  blocked_input_info: {
    reason: "note_completed";
  };
};

function createUpdateEmitter(emitter: Emitter<Events>) {
  return new Plugin({
    state: {
      init: () => {},
      apply: (tr, value, oldState, newState) => {
        if (!tr.docChanged) return;
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

function createAddParentNoteIdPlugin() {
  return new Plugin({
    appendTransaction: (transactions, _prevState, nextState) => {
      const tr = nextState.tr;
      let modified = false;
      if (transactions.some((tr) => tr.docChanged)) {
        const { note, note_children } = nextState.schema.nodes;
        nextState.doc.descendants((node, pos, parent) => {
          if (
            isTargetNodeOfType(parent, note_children) && //
            isTargetNodeOfType(node, note) && //
            nodeHasAttribute(node, "id")
          ) {
            const wrappingNote = nextState.doc.resolve(pos).node(-1);
            const { id } = wrappingNote.attrs;

            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              parent: id,
            });

            modified = true;
          } else if (
            isTargetNodeOfType(node, note) && //
            !isTargetNodeOfType(parent, note_children) && //
            nodeHasAttribute(node, "parent")
          ) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              parent: null,
            });

            modified = true;
          }
        });
      }

      return modified ? tr : null;
    },
  });
}

function preventBrowserShortcuts() {
  return new Plugin({
    props: {
      handleKeyDown(_, event) {
        if ((event.metaKey || event.ctrlKey) && event.key === "m") {
          event.preventDefault();
        }
        return false;
      },
    },
  });
}

function preventModifyingCompletedNotes(emitter?: Emitter<Events>) {
  return new Plugin({
    filterTransaction(tr, state) {
      if (
        !tr.steps.some((step) => step instanceof AttrStep) && //
        tr.docChanged
      ) {
        const { note } = state.schema.nodes;
        const { $from } = tr.selection;
        const wrappingNode = $from.node(-1);
        if (isTargetNodeOfType(wrappingNode, note) && wrappingNode.attrs.completed === true) {
          if (emitter) emitter.emit("blocked_input_info", { reason: "note_completed" });
          return false;
        }
      }
      return true;
    },
  });
}

function decorateCurrentNote() {
  return new Plugin({
    props: {
      decorations(state) {
        const { $from } = state.selection;
        const noteType = state.schema.nodes.note;

        if (isTargetNodeOfType($from.node(-1), noteType)) {
          return DecorationSet.create(state.doc, [
            Decoration.node($from.start(-1) - 1, $from.end(-1) + 1, { class: "note--focused" }),
          ]);
        }
        return null;
      },
    },
  });
}

export function createEditorPluginsArray(emitter?: Emitter<Events>, schema?: Schema) {
  const plugins = [
    createEditorKeymap(schema),
    preventModifyingCompletedNotes(emitter),
    preventBrowserShortcuts(),
    createAddNoteIdPlugin(),
    createAddParentNoteIdPlugin(),
    decorateCurrentNote(),
    history(),
  ];
  if (emitter) plugins.push(createUpdateEmitter(emitter));
  return plugins;
}
