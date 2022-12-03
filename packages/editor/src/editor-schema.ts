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

const createAttributes = (
  attributes: Record<string, string | string[] | number | boolean | null>
) => {
  const attr: Record<string, { default: string | string[] | number | boolean | null }> = {};
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
          expanded: true,
          tags: null,
        }),
        parseDOM: [
          {
            tag: "li[data-note]",
            getAttrs: createAttributeGetter(["id", "note", "parent", "completed", "tags"]),
          },
        ],
        toDOM(node) {
          const { id, note, completed, expanded, tags } = node.attrs;
          return [
            "li",
            {
              "data-id": id,
              "data-note": note,
              "data-completed": completed ? "" : null,
              "data-expanded": expanded ? "" : null,
              "data-tags": tags?.join(";") ?? null,
            },
            0,
          ];
        },
      },
      note_text: {
        content: "(text)*",
        marks: "_",
        parseDOM: [{ tag: "p" }],
        toDOM() {
          return ["p", { class: "note_text" }, 0];
        },
      },
      note_children: {
        content: "note*",
        selectable: false,
        attrs: createAttributes({
          expanded: true,
        }),
        parseDOM: [{ tag: "ul" }],
        toDOM(node) {
          const isExpanded = node.attrs.expanded;
          return isExpanded ? ["ul", 0] : ["ul"];
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
