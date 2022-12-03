import { Plugin, PluginKey } from "prosemirror-state";
import { Emitter } from "mitt";
import { Events } from "../../editor-plugins";
import { Node, ResolvedPos } from "prosemirror-model";
import { Decoration, DecorationSet } from "prosemirror-view";
import { isTargetNodeOfType } from "../../editor-utils";
import { hasDocChanged } from "../../utils/has-doc-changed";
import { equals } from "ramda";

type State = {
  decorations: DecorationSet;
  data: Map<string, string[]>;
  _updatedNotes: Map<number, string[]>;
};

const EMPTY = new Map();

export const KEY = new PluginKey("hashtags");

const HASHTAG_REGEX = /(?:^|\s)(#([A-Za-z0-9-_:]+))/dg;

function createDecorationsInTextNode(node: Node, pos: number, offset = 0) {
  const decorations: Decoration[] = [];
  // find hashtags in the text descendants
  // since there could be more than one we can't simply use
  // the text content of the note_text node
  for (const match of node.textContent.matchAll(HASHTAG_REGEX)) {
    // @ts-ignore
    const [from, to] = match.indices[1].map((i) => i + pos + offset);
    const [, , tag] = match;
    const decoration = Decoration.inline(from, to, { nodeName: "var", "data-tag": tag }, { tag });
    decorations.push(decoration);
  }
  return decorations;
}

export function createHashtagsPlugin(emitter?: Emitter<Events>) {
  return new Plugin<State>({
    key: KEY,
    state: {
      init(_, state) {
        const data = KEY.getState(state)?.data ?? new Map();
        const decorations: Decoration[] = [];

        state.doc.descendants((node, pos) => {
          decorations.concat(createDecorationsInTextNode(node, pos));
        });

        return {
          data,
          decorations: DecorationSet.create(state.doc, decorations),
          _updatedNotes: EMPTY,
        };
      },
      apply(tr, state, oldEditorState) {
        const schema = oldEditorState.schema;
        // don't do anything if the document has not changed
        if (!tr.docChanged || tr.getMeta("skip_hashtags") === true) {
          return {
            ...state,
            _updatedNotes: EMPTY,
          };
        }
        // document changes that affect the tags can't take place in a selection
        // range, therefore we use the $cursor
        // @ts-ignore $cursor is missing in the type declarations
        const $cursor: ResolvedPos = tr.selection.$cursor;

        // if no cursor is available we have a selection range and can abort
        if (!$cursor) return state;

        const data = new Map(state.data);
        const updatedNotes = new Map();
        let decorations = DecorationSet.create(tr.doc, []);

        tr.doc.descendants((descendant, offset) => {
          if (descendant.isText) {
            const tags: string[] = [];
            const toAdd = createDecorationsInTextNode(descendant, offset);

            for (const decoration of toAdd) tags.push(decoration.spec.tag);
            decorations = decorations.add(tr.doc, toAdd);

            const $pos = tr.doc.resolve(offset);
            let depth = $pos.depth;
            let node = $pos.node(depth);

            while (true) {
              if (isTargetNodeOfType(node, schema.nodes.note)) {
                const from = $pos.before(depth);
                if (tags.length) {
                  data.set(node.attrs.id, tags);
                  if (!equals(node.attrs.tags?.sort(), tags.sort())) {
                    updatedNotes.set(from, tags);
                    emitter?.emit("note:updated", { ...node.attrs, tags });
                  }
                } else {
                  data.delete(node.attrs.id);
                  if (node.attrs.tags !== null) {
                    updatedNotes.set(from, null);
                    emitter?.emit("note:updated", { ...node.attrs, tags: null });
                  }
                }
                break;
              }
              if (depth < 0) break;
              node = $pos.node(--depth);
            }
          }
        });

        return {
          data,
          decorations,
          _updatedNotes: updatedNotes,
        };
      },
      toJSON(state) {
        const data: Record<string, string[]> = {};
        for (const [id, tags] of state.data.entries()) if (tags.length) data[id] = tags;
        return data;
      },
      fromJSON: (_, value: Record<string, string[]>, state) => {
        const data = new Map<string, string[]>();
        let decorations: Decoration[] = [];

        for (const [id, tags] of Object.entries(value)) data.set(id, tags);

        state.doc.descendants((node, pos) => {
          if (node.isText) {
            decorations = decorations.concat(createDecorationsInTextNode(node, pos));
          }
        });

        return {
          data,
          decorations: DecorationSet.create(state.doc, decorations),
          _updatedNotes: new Map(),
        };
      },
    },
    appendTransaction: (transactions, _, newEditorState) => {
      if (hasDocChanged(transactions)) {
        const state = KEY.getState(newEditorState);
        if (state._updatedNotes.size === 0) return null;

        const tr = newEditorState.tr;

        for (const [pos, tags] of state._updatedNotes) {
          tr.setNodeAttribute(pos, "tags", tags);
        }

        tr.setMeta("skip_hashtags", true);
        return tr;
      }
      return null;
    },
    props: {
      decorations(state) {
        return KEY.getState(state).decorations;
      },
    },
  });
}
