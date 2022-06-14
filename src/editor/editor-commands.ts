import { AllSelection, Command, TextSelection } from "prosemirror-state";
import { ContentMatch, ResolvedPos } from "prosemirror-model";
import { isTargetNodeOfType } from "./editor-utils";
import { canSplit } from "prosemirror-transform";

function atEnd($position: ResolvedPos) {
  return $position.parentOffset == $position.parent.content.size;
}

function defaultBlockAt(match: ContentMatch) {
  for (let i = 0; i < match.edgeCount; i++) {
    let { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) return type;
  }
  return null;
}

export const splitNoteTitle: Command = (state, dispatch) => {
  const { $from } = state.selection;

  if (isTargetNodeOfType($from.parent, state.schema.nodes.note)) return false;
  if (!canSplit(state.doc, $from.pos, $from.depth)) return false;

  if (dispatch) {
    const tr = state.tr;
    if (state.selection instanceof TextSelection) tr.deleteSelection();
    if (state.selection instanceof AllSelection) tr.deleteSelection();
    tr.split($from.pos, 2);
    dispatch(tr.scrollIntoView());
  }

  return true;
};

export const joinNoteBackward: Command = (state, dispatch) => {
  return false;
};

export const joinNoteForward: Command = (state, dispatch) => {
  return false;
};
