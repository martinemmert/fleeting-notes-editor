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
        parseDOM: [{ tag: "p" }],
        toDOM() {
          return ["p", 0];
        },
      },

      doc: {
        content: "note+",
      },
    },
  });
}
