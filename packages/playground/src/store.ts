export const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "note",
      attrs: {
        note: "note",
        parent: null,
      },
      content: [
        {
          type: "note_text",
          content: [],
        },
      ],
    },
  ],
};

export const state = { doc: emptyDoc };

export function update(doc: any) {
  state.doc = doc;
}

if (import.meta.hot) {
  import.meta.hot.decline();
}
