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
                  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                  svg.classList.add("note__collapse-widget");

                  if (node.attrs.expanded) {
                    svg.classList.add("note__collapse-widget--expanded");
                    use.setAttribute("href", "#minus-square");
                  }

                  if (!node.attrs.expanded) {
                    svg.classList.add("note__collapse-widget--collapsed");
                    use.setAttribute("href", "#plus-circle");
                  }

                  svg.append(use);

                  svg.addEventListener("mousedown", (event) => {
                    if (node.attrs.expanded) {
                      collapseNoteById(node.attrs.id)(view.state, view.dispatch);
                    } else {
                      expandNoteById(node.attrs.id)(view.state, view.dispatch);
                    }
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  });
                  return svg;
                },
                {
                  ignoreSelection: true,
                  key: node.attrs.expanded
                    ? `${node.attrs.id}--expanded`
                    : `${node.attrs.id}--collapsed`,
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
