import { Node, Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { isTargetNodeOfType } from "../../editor-utils";
import { collapseNoteById } from "../../commands/collapse-note-by-id/collapse-note-by-id";
import { expandNoteById } from "../../commands/expand-note-by-id/expand-note-by-id";

function hasNoteChildren(node: Node, schema: Schema) {
  let hasChildren = false;
  node.forEach((node) => {
    if (!hasChildren) hasChildren = isTargetNodeOfType(node, schema.nodes.note_children);
  });
  return hasChildren;
}

export function createDecorateCollapsedNotesPlugin() {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];

        state.doc.descendants((node, offset) => {
          if (
            isTargetNodeOfType(node, state.schema.nodes.note) &&
            hasNoteChildren(node, state.schema)
          ) {
            decorations.push(
              Decoration.widget(
                offset + 1,
                (view) => {
                  const el = document.createElement("div");
                  el.classList.add("note__collapse-widget");

                  if (node.attrs.expanded) el.classList.add("note__collapse-widget--expanded");
                  if (!node.attrs.expanded) el.classList.add("note__collapse-widget--collapsed");

                  el.addEventListener("mousedown", (event) => {
                    if (node.attrs.expanded) {
                      collapseNoteById(node.attrs.id)(view.state, view.dispatch);
                    } else {
                      expandNoteById(node.attrs.id)(view.state, view.dispatch);
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  });
                  return el;
                },
                {
                  ignoreSelection: true,
                }
              )
            );
          }
        });

        return decorations.length > 0 ? DecorationSet.create(state.doc, decorations) : null;
      },
    },
  });
}
