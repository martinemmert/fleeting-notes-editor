import { Command, TextSelection } from "prosemirror-state";
import { findNoteById } from "../../utils/find-node-by-id";
import { isTargetNodeOfType } from "../../editor-utils";
import { Node } from "prosemirror-model";

export const collapseNoteById: (id: string) => Command = (id: string) => (state, dispatch) => {
  const [needle, pos] = findNoteById(state.doc, id);

  // check if node was found
  if (!needle) return false;

  // check if node is a note
  if (!isTargetNodeOfType(needle, state.schema.nodes.note)) return false;

  // check if children are present
  // exit if no note_children node is present within the current note
  let noteText: Node | undefined;
  let noteTextOffset: number = -1;
  let noteChildren: Node | undefined;
  let noteChildrenOffset: number = 0;

  needle.forEach((node, offset) => {
    if (isTargetNodeOfType(node, state.schema.nodes.note_text)) {
      noteText = node;
      noteTextOffset = offset;
    }
    if (isTargetNodeOfType(node, state.schema.nodes.note_children)) {
      noteChildren = node;
      noteChildrenOffset = offset;
    }
  });

  if (!noteChildren) {
    if (dispatch) {
      dispatch(
        state.tr.setMeta("message", {
          type: "blocked_command_info",
          payload: {
            command: "collapseNoteById",
            reason: "note_children_not_present",
          },
        })
      );
    }
    return false;
  }

  const isExpanded = noteChildren.attrs.expanded;

  // exit if note is already expanded
  if (!isExpanded) {
    if (dispatch) {
      dispatch(
        state.tr.setMeta("message", {
          type: "blocked_command_info",
          payload: {
            command: "collapseNoteById",
            reason: "note_children_already_collapsed",
          },
        })
      );
    }
    return false;
  }

  if (dispatch) {
    const tr = state.tr;
    tr.setNodeAttribute(pos, "expanded", false);
    tr.setNodeAttribute(pos + noteChildrenOffset + 1, "expanded", false);
    if (noteText) {
      const $pos = tr.doc.resolve(pos + noteTextOffset + noteText.nodeSize);
      tr.setSelection(new TextSelection($pos));
    }
    dispatch(tr);
  }

  return true;
};
