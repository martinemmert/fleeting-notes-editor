import { Node, Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { isTargetNodeOfType } from "../../editor-utils";

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
                offset,
                (view, getPos) => {
                  const el = document.createElement("div");
                  el.classList.add("note__collapse-widget");
                  if (node.attrs.expanded) el.classList.add("note__collapse-widget--expanded");
                  if (!node.attrs.expanded) el.classList.add("note__collapse-widget--collapsed");
                  // // el.style.top = `${getPos()}px`;
                  // el.addEventListener("mousedown", () => {
                  //   if (node.attrs.expanded) {
                  //     collapseNoteChildren(view.state, view.dispatch);
                  //   } else {
                  //     expandNoteChildren(view.state, view.dispatch);
                  //   }
                  // });
                  return el;
                },
                {
                  // key: `${node.attrs.id}-widget`,
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
