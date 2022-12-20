import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { isTargetNodeOfType } from "../../editor-utils";

export function createDecorateNotesPlugin() {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = [];

        state.doc.descendants((node, offset) => {
          if (isTargetNodeOfType(node, state.schema.nodes.note)) {
            decorations.push(
              Decoration.widget(
                offset + 1,
                () => {
                  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

                  svg.classList.add("note__marker-widget");

                  if (node.attrs.completed) {
                    use.setAttribute("href", "#check");
                    svg.classList.add("note__marker-widget--check");
                  } else {
                    use.setAttribute("href", "#chevron-right");
                  }

                  svg.append(use);

                  return svg;
                },
                {
                  ignoreSelection: true,
                  key: node.attrs.completed
                    ? `${node.attrs.id}--check`
                    : `${node.attrs.id}--bullet`,
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
