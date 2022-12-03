export const emptyDoc = {
  type: "doc",
  content: [
    {
      type: "note",
      attrs: {
        note: "note",
        parent: null,
        id: "PXKF6nSN2op2Xnu1",
        tags: ["hashtag"],
      },
      content: [
        {
          type: "note_text",
          content: [
            {
              type: "text",
              text: "asdad #hashtag",
            },
          ],
        },
      ],
    },
  ],
};

export const state = {
  doc: emptyDoc,
  hashtags: {
    PXKF6nSN2op2Xnu1: ["hashtag"],
  },
};

export function update(doc: any) {
  state.doc = doc;
}

if (import.meta.hot) {
  import.meta.hot.decline();
}
