import {
  AllSelection,
  Command,
  Selection,
  TextSelection,
} from "prosemirror-state";
import { Fragment, NodeRange, Slice } from "prosemirror-model";
import { isTargetNodeOfType, mapChildren } from "./editor-utils";
import {
  canSplit,
  liftTarget,
  ReplaceAroundStep,
  ReplaceStep,
} from "prosemirror-transform";

export const splitNote: Command = (state, dispatch) => {
  const { $from } = state.selection;
  const noteType = state.schema.nodes.note;

  if (isTargetNodeOfType($from.parent, noteType)) return false;
  if (!canSplit(state.doc, $from.pos, 2)) return false;

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

export const liftNote: Command = (state, dispatch) => {
  const { $from, $to } = state.selection;

  const noteTextType = state.schema.nodes.note_text;

  // prevent usage in wrong nodes
  if (!isTargetNodeOfType($from.parent, noteTextType)) return false;

  const $start = state.doc.resolve($from.before($from.depth - 1));
  const $end = state.doc.resolve($to.after($from.depth - 1));
  const range = new NodeRange($start, $end, $start.depth);

  // prevent usage on the most outer level
  if (isTargetNodeOfType($start.parent, state.schema.nodes.doc)) return true;

  const target = liftTarget(range);
  if (typeof target !== "number") return false;

  if (dispatch) {
    const tr = state.tr;

    // move the item to the end of the current list
    let swapSize = 0;
    const children = mapChildren($start.parent);
    const currentChildIndex = children.indexOf($start.nodeAfter!);
    // remove the current children from the list
    children.splice(currentChildIndex, 1);
    // get the swap size
    children.forEach((child, index) => {
      if (index >= currentChildIndex) swapSize += child.nodeSize;
    });
    // add the current children to the end of the list
    children.push($start.nodeAfter!);
    // create the replacement slice
    const slice = new Slice(Fragment.fromArray(children), 0, 0);
    // todo: https://github.com/martinemmert/fleeting-notes-editor/issues/7
    //       constrain this to the actual replaced nodes
    const step = new ReplaceStep(
      $start.start($start.depth),
      $end.end($end.depth),
      slice
    );
    // apply the swap
    tr.step(step);
    // get lift range
    const liftRange = new NodeRange(
      tr.doc.resolve(range.start + swapSize),
      tr.doc.resolve(range.end + swapSize),
      range.depth
    );
    tr.setSelection(
      new TextSelection(
        tr.doc.resolve($from.pos + swapSize),
        tr.doc.resolve($to.pos + swapSize)
      )
    );
    tr.lift(liftRange, liftTarget(liftRange)!);
    tr.scrollIntoView();

    dispatch(tr);
  }

  return true;
};

export const joinNoteBackward: Command = (state, dispatch) => {
  const { $cursor } = state.selection as TextSelection;

  // cancel if no cursor is available or if it is not at the beginning of the note
  if (!$cursor || $cursor.parentOffset > 0) return false;

  const noteTextNode = state.schema.nodes.note_text;
  const noteChildrenNode = state.schema.nodes.note_children;

  // allow usage only in a note_text node
  if (!isTargetNodeOfType($cursor.parent, noteTextNode)) return false;

  // get the start position of the current note
  const $noteStart = state.doc.resolve($cursor.before($cursor.depth - 1));

  // get the end position of the current note
  const $noteEnd = state.doc.resolve($cursor.after($cursor.depth - 1));

  // check if the current note is a nested note
  const isNestedNote = isTargetNodeOfType($noteStart.parent, noteChildrenNode);

  // check if the current note is the first note
  const isFirstNote = $noteStart.nodeBefore === null;

  // check if sibling notes are present
  const hasSiblings = $noteStart.parent.childCount > 1;

  // check if note is empty
  const isEmptyNote =
    $noteStart.nodeAfter?.textContent.trim() === "" &&
    $noteStart.nodeAfter.childCount <= 1;

  // check if previous note is empty
  // note: does not guaranty that a previous note exists
  const isPreviousNoteEmpty =
    $noteStart.nodeBefore?.textContent?.trim() === "" &&
    $noteStart.nodeBefore.childCount <= 1;

  // check if previous note is a flat note (no children)
  // note: does not guaranty that a previous note exists
  const isPreviousNoteFlat =
    !isPreviousNoteEmpty &&
    isTargetNodeOfType($noteStart.nodeBefore?.lastChild, noteTextNode);

  const tr = state.tr;

  switch (true) {
    // delete note if empty, not nested, and not firstNote
    // delete note if empty, nested, and has siblings
    case isEmptyNote && !isNestedNote && !isFirstNote:
    case isEmptyNote && isNestedNote && hasSiblings:
      tr.delete($noteStart.pos, $noteEnd.pos);
      break;
    // delete note and its outer node if empty, nested, and the only child
    case isEmptyNote && isNestedNote && !hasSiblings:
      tr.delete($noteStart.pos - 1, $noteEnd.pos + 1);
      break;
    // delete previous note if current is not empty, not the first one and previous note is empty
    case !isEmptyNote && !isFirstNote && isPreviousNoteEmpty:
      tr.delete(
        $noteStart.pos - ($noteStart.nodeBefore?.nodeSize ?? 0),
        $noteStart.pos
      );
      break;
    // join with previous note if current is not empty, not the first and previous note is flat
    case !isEmptyNote && !isFirstNote && isPreviousNoteFlat:
      tr.join($noteStart.pos, 2);
      break;
    // cancel command if no case fits the current state
    default:
      return false;
  }

  if (dispatch) {
    const newTextSelection = TextSelection.findFrom(
      tr.doc.resolve(tr.mapping.map($cursor.pos)),
      -1,
      true
    );

    if (newTextSelection) tr.setSelection(newTextSelection);

    tr.scrollIntoView();

    dispatch(tr);
  }

  return true;
};

export const joinNoteForward: Command = (state, dispatch) => {
  return false;
};
