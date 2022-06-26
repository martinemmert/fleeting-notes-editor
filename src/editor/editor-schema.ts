import { Schema } from "prosemirror-model";

const createAttributeGetter =
  (attributes: string[]) => (dom: string | HTMLElement) => {
    if (typeof dom === "string") return {};
    const attr: Record<string, string> = {};
    for (const attribute of attributes) {
      const domAttr = dom.getAttribute(`data-${attribute}`);
      if (domAttr) attr[attribute] = domAttr;
    }
    return attr;
  };

const createAttributes = (attributes: Record<string, string | null>) => {
  const attr: Record<string, { default: string | null }> = {};
  for (const [key, value] of Object.entries(attributes)) {
    attr[key] = { default: value };
  }
  return attr;
};

export function createEditorSchema() {
  return new Schema({
    nodes: {
      note: {
        content: "note_text",
        attrs: createAttributes({ id: null, note: "note", parent: null }),
        parseDOM: [
          {
            tag: "li[data-note]",
            getAttrs: createAttributeGetter(["id", "note"]),
          },
        ],
        toDOM(node) {
          const { id, note } = node.attrs;
          return ["li", { "data-id": id, "data-note": note }, 0];
        },
      },
      note_text: {
        content: "text*",
        parseDOM: [{ tag: "p" }],
        toDOM() {
          return ["p", 0];
        },
      },
      note_children: {
        content: "note+",
        parseDOM: [{ tag: "ul" }],
        toDOM() {
          return ["ul", 0];
        },
      },
      text: {},
      doc: { content: "note+" },
    },
  });
}
