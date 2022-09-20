import { Schema } from "prosemirror-model";

const createAttributeGetter = (attributes: string[]) => (dom: string | HTMLElement) => {
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
        content: "note_text note_children?",
        attrs: createAttributes({
          id: null,
          note: "note",
          parent: null,
          completed: null,
        }),
        parseDOM: [
          {
            tag: "li[data-note]",
            getAttrs: createAttributeGetter(["id", "note", "parent", "completed"]),
          },
        ],
        toDOM(node) {
          const { id, note, completed } = node.attrs;
          return [
            "li",
            { "data-id": id, "data-note": note, "data-completed": completed ? "" : null },
            0,
          ];
        },
      },
      note_text: {
        content: "text*",
        marks: "_",
        parseDOM: [{ tag: "p" }],
        toDOM() {
          return ["p", { class: "note_text" }, 0];
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
    marks: {
      strong: {
        parseDOM: [{ tag: "strong" }, { tag: "b" }],
        toDOM() {
          return ["strong", 0];
        },
      },
      em: {
        parseDOM: [{ tag: "em" }, { tag: "i" }],
        toDOM() {
          return ["em", 0];
        },
      },
      highlight: {
        parseDOM: [{ tag: "mark" }],
        toDOM() {
          return ["mark", 0];
        },
      },
    },
  });
}
