import { AllSelection, Command, TextSelection } from "prosemirror-state";
import { Fragment, NodeRange, Slice } from "prosemirror-model";
import { isTargetNodeOfType, mapChildren, positionAtEnd } from "./editor-utils";
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

    // insert a new node before the selection is at the start of the note
    if (state.selection.$from.parentOffset === 0) {
      tr.split($from.pos, 2);
      tr.setNodeMarkup($from.pos - 2, undefined, { id: null });
    } else {
      tr.split($from.pos, 2, [{ type: noteType, attrs: { id: null } }]);
    }

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
  const $start = state.doc.resolve($cursor.before($cursor.depth - 1));

  // get the end position of the current note
  const $end = state.doc.resolve($cursor.after($cursor.depth - 1));

  // check if the current note is a nested note
  const isNestedNote = isTargetNodeOfType($start.parent, noteChildrenNode);

  // check if the current note is the first note
  const isFirstNote = $start.nodeBefore === null;

  // check if sibling notes are present
  const hasSiblings = $start.parent.childCount > 1;

  // check if note is empty
  const isEmptyNote =
    $start.nodeAfter?.textContent.trim() === "" &&
    $start.nodeAfter.childCount <= 1;

  // check if previous note is a flat note (no children)
  // note: does not guaranty that a previous note exists
  const isPreviousNoteFlat = isTargetNodeOfType(
    $start.nodeBefore?.lastChild,
    noteTextNode
  );

  // check if previous note is empty
  // note: does not guaranty that a previous note exists
  const isPreviousNoteEmpty =
    $start.nodeBefore?.textContent?.trim() === "" &&
    $start.nodeBefore.childCount <= 1;

  const tr = state.tr;

  switch (true) {
    // join with previous note if it is flat and not empty
    case !isFirstNote && isPreviousNoteFlat && !isPreviousNoteEmpty:
      tr.join($start.pos, 2);
      break;
    // delete previous note if it is flat and empty
    case !isFirstNote && isPreviousNoteFlat && isPreviousNoteEmpty:
      tr.delete($start.pos - $start.nodeBefore!.nodeSize, $start.pos);
      break;
    // delete current note if it is empty and has siblings
    case isEmptyNote && hasSiblings:
      tr.delete($start.pos, $end.pos);
      break;
    // delete current note and its wrapping node if it is empty, has no siblings and is nested
    case isEmptyNote && !hasSiblings && isNestedNote:
      tr.delete($start.pos - 1, $end.pos + 1);
      break;
    // cancel if no case
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
  const schemaNodes = state.schema.nodes;
  const { $cursor } = state.selection as TextSelection;

  // cancel if no cursor is available or if it is not at the beginning of the note
  if (!$cursor || !positionAtEnd($cursor)) return false;

  // allow usage only in a note_text node
  if (!isTargetNodeOfType($cursor.parent, schemaNodes.note_text)) return false;

  // get the end position of the current note
  const $noteEnd = state.doc.resolve($cursor.after($cursor.depth - 1));

  // prevent joining when the current note is the last one on the current level
  if ($noteEnd.nodeAfter === null) return false;

  // check if current note is flat
  const isNoteFlat = isTargetNodeOfType(
    $noteEnd.nodeBefore?.lastChild,
    schemaNodes.note_children
  );

  // prevent joining when the current note is not flat
  if (isNoteFlat) return false;

  if (dispatch) {
    // dispatch the join transformation
    const tr = state.tr.join($noteEnd.pos, 2);
    tr.scrollIntoView();
    dispatch(tr);
  }

  return true;
};

export const moveNoteUp: Command = (state, dispatch) => {
  const schemaNodes = state.schema.nodes;
  const { $cursor } = state.selection as TextSelection;

  // cancel if no cursor is available or if it is not at the beginning of the note
  if (!$cursor) return false;

  // allow usage only in a note_text node
  if (!isTargetNodeOfType($cursor.parent, schemaNodes.note_text)) return false;

  // get the end position of the current note
  const $start = state.doc.resolve($cursor.before($cursor.depth - 1));

  // prevent joining when the current note is the last one on the current level
  if ($start.nodeBefore === null) return false;

  if (dispatch) {
    const tr = state.tr;
    // move the item to the end of the current list

    const children = mapChildren($start.parent);
    const childIndex = children.indexOf($start.nodeAfter!);
    const prevChildIndex = childIndex - 1;
    const swappedChildren = [children[childIndex], children[prevChildIndex]];

    let swapSize = 0;
    let sizeBeforeSwap = 0;

    children.forEach((child, index) => {
      if (index < prevChildIndex) sizeBeforeSwap += child.nodeSize;
    });

    swappedChildren.forEach((child) => (swapSize += child.nodeSize));

    const replaceStart = $cursor.start($cursor.depth - 2) + sizeBeforeSwap;
    const replaceEnd = replaceStart + swapSize;

    // create the replacement slice
    const slice = new Slice(Fragment.fromArray(swappedChildren), 0, 0);

    // create the replacement step
    const step = new ReplaceStep(replaceStart, replaceEnd, slice);

    // apply the swap
    tr.step(step);

    // new cursor position
    const $newCursor = tr.doc.resolve(
      $cursor.pos - swappedChildren[1].nodeSize
    );

    tr.setSelection(new TextSelection($newCursor));

    tr.scrollIntoView();

    dispatch(tr);
  }

  return true;
};

export const moveNoteDown: Command = (state, dispatch) => {
  const schemaNodes = state.schema.nodes;
  const { $cursor } = state.selection as TextSelection;

  // cancel if no cursor is available or if it is not at the beginning of the note
  if (!$cursor) return false;

  // allow usage only in a note_text node
  if (!isTargetNodeOfType($cursor.parent, schemaNodes.note_text)) return false;

  // get the end position of the current note
  const $start = state.doc.resolve($cursor.before($cursor.depth - 1));
  const $end = state.doc.resolve($cursor.after($cursor.depth - 1));

  // prevent joining when the current note is the last one on the current level
  if ($end.nodeAfter === null) return false;

  if (dispatch) {
    const tr = state.tr;
    // move the item to the end of the current list

    const children = mapChildren($start.parent);
    const childIndex = children.indexOf($start.nodeAfter!);
    const nextChildIndex = childIndex + 1;
    const swappedChildren = [children[nextChildIndex], children[childIndex]];

    let swapSize = 0;
    let sizeBeforeSwap = 0;

    children.forEach((child, index) => {
      if (index < childIndex) sizeBeforeSwap += child.nodeSize;
    });

    swappedChildren.forEach((child) => (swapSize += child.nodeSize));

    const replaceStart = $cursor.start($cursor.depth - 2) + sizeBeforeSwap;
    const replaceEnd = replaceStart + swapSize;

    // create the replacement slice
    const slice = new Slice(Fragment.fromArray(swappedChildren), 0, 0);

    // create the replacement step
    const step = new ReplaceStep(replaceStart, replaceEnd, slice);

    // apply the swap
    tr.step(step);

    // new cursor position
    const $newCursor = tr.doc.resolve(
      $cursor.pos + swappedChildren[0].nodeSize
    );

    tr.setSelection(new TextSelection($newCursor));

    tr.scrollIntoView();

    dispatch(tr);
  }

  return true;
};
