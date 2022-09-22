import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { ResolvedPos, Schema } from "prosemirror-model";
import { GapCursor } from "prosemirror-gapcursor";
import { isTargetNodeOfType } from "../../editor-utils";

export const KEY = new PluginKey("skip-hidden-notes");

const isPositionCollapsed = function ($pos: ResolvedPos, schema: Schema) {
  let collapsed = false;
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    if (isTargetNodeOfType(node, schema.nodes.note_children) && !node.attrs.expanded) {
      collapsed = true;
      break;
    }
  }
  return collapsed;
};

export function createSkipCollapsedNotesPlugin() {
  return new Plugin({
    key: KEY,
    appendTransaction: (transactions, oldState, state) => {
      const { $from, $to } = state.selection;

      // only cursor selections
      if ($from.pos !== $to.pos) return null;

      const selectionSet = transactions.find((tr) => tr.selectionSet);

      if (selectionSet && isPositionCollapsed($from, state.schema)) {
        const moveDirection = state.selection.from > oldState.selection.from ? 1 : -1;
        let newPos = state.selection.from;
        let collapsed = true;
        let validTextSelection = false;
        let $pos: ResolvedPos;
        while (collapsed || !validTextSelection) {
          newPos += moveDirection;
          if (newPos === 0 || newPos === state.doc.nodeSize) {
            console.warn("SkipCollapsedNotes: Could not find any valid position");
            return null;
          }
          $pos = state.doc.resolve(newPos);
          validTextSelection = $pos.parent.inlineContent;
          collapsed = isPositionCollapsed($pos, state.schema);
        }
        const selection = validTextSelection ? new TextSelection($pos!) : new GapCursor($pos!);
        return state.tr.setSelection(selection);
      }

      return null;
    },
  });
}
