import { Schema } from "prosemirror-model";

export function createEditorSchema() {
  return new Schema({
    nodes: {
      text: {
        inline: true,
      },
      note: {
        group: "block",
        content: "text*",
        attrs: {
          id: {
            default: null,
          },
          type: {
            default: "note",
          },
        },
        parseDOM: [
          {
            tag: "p",
            getAttrs: (dom) => ({
              id: (dom as HTMLElement).getAttribute("data-id"),
              type: (dom as HTMLElement).getAttribute("data-type"),
            }),
          },
        ],
        toDOM(node) {
          const { id, type } = node.attrs;
          return ["p", { "data-id": id, "data-type": type }, 0];
        },
      },

      doc: {
        content: "note+",
      },
    },
  });
}
