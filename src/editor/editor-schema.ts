import { Schema } from "prosemirror-model";

export function createEditorSchema() {
  return new Schema({
    nodes: {
      note: {
        group: "block",
        content: "text*",
        attrs: {
          id: {
            default: null,
          },
          note: {
            default: "note",
          },
        },
        parseDOM: [
          {
            tag: "li[data-note]",
            getAttrs: (dom) => ({
              id: (dom as HTMLElement).getAttribute("data-id"),
              note: (dom as HTMLElement).getAttribute("data-note"),
            }),
          },
        ],
        toDOM(node) {
          const { id, note } = node.attrs;
          return ["li", { "data-id": id, "data-note": note }, 0];
        },
      },
      text: {},
      doc: { content: "note+" },
    },
  });
}
