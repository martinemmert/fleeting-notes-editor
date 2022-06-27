import { AllSelection, Command, TextSelection } from "prosemirror-state";
import { ContentMatch, Fragment, ResolvedPos, Slice } from "prosemirror-model";
import { isTargetNodeOfType } from "./editor-utils";
import { canSplit, ReplaceAroundStep } from "prosemirror-transform";

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

export const splitNote: Command = (state, dispatch) => {
  const { $from } = state.selection;
  const noteType = state.schema.nodes.note;

  if (isTargetNodeOfType($from.parent, noteType)) return false;
  if (!canSplit(state.doc, $from.pos, $from.depth)) return false;

  if (dispatch) {
    const tr = state.tr;
    if (state.selection instanceof TextSelection) tr.deleteSelection();
    if (state.selection instanceof AllSelection) tr.deleteSelection();
    tr.split($from.pos, 2, [{ type: noteType, attrs: { id: null } }]);
    tr.scrollIntoView();
    dispatch(tr);
  }

  return true;
};

export const sinkNote: Command = (state, dispatch) => {
  const { $from } = state.selection;
  const noteType = state.schema.nodes.note;
  const noteTextType = state.schema.nodes.note_text;
  const noteChildrenType = state.schema.nodes.note_children;

  // prevent usage in wrong nodes
  if (!isTargetNodeOfType($from.parent, noteTextType)) return false;

  const $start = state.doc.resolve($from.before($from.depth - 1));
  const $end = state.doc.resolve($from.after($from.depth - 1));

  // cancel if no sibling note before current note is available
  if (!$start.nodeBefore) return false;

  if (dispatch) {
    const tr = state.tr;
    const nestedBefore = $start.nodeBefore.lastChild?.type === noteChildrenType;
    const inner = Fragment.from(nestedBefore ? noteType.create() : null);
    const outer = Fragment.from(
      noteType.create(null, Fragment.from(noteChildrenType.create(null, inner)))
    );

    const slice = new Slice(outer, nestedBefore ? 3 : 1, 0);

    const step = new ReplaceAroundStep(
      $start.pos - (nestedBefore ? 3 : 1),
      $end.pos,
      $start.pos,
      $end.pos,
      slice,
      1,
      true
    );

    dispatch(tr.step(step).scrollIntoView());
  }

  return true;
};

export const joinNoteBackward: Command = (state, dispatch) => {
  return false;
};

export const joinNoteForward: Command = (state, dispatch) => {
  return false;
};
