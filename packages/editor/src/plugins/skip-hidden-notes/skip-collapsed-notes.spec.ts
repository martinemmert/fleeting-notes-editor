import {
  applyCommand,
  doc,
  id,
  note,
  note_children,
  note_text,
} from "../../../__tests__/test-utils";
import { Command, TextSelection } from "prosemirror-state";
import { describe, it } from "vitest";

describe("skip-collapsed-notes", () => {
  it("should skip collapsed notes", () => {
    const testDoc = doc(
      note(
        { id: id(1), expanded: false },
        note_text("first child<a>"),
        note_children(
          { expanded: false }, //
          note(
            { id: id(2), parent: id(1) }, //
            note_text("second_child")
          )
        )
      ),
      note(
        { id: id(3), expanded: true }, //
        note_text("third")
      )
    );

    const expectedDoc = doc(
      note(
        { id: id(1), expanded: false },
        note_text("first child"),
        note_children(
          { expanded: false },
          note(
            { id: id(2), parent: id(1) }, //
            note_text("second_child")
          )
        )
      ),
      note(
        { id: id(3), expanded: true }, //
        note_text("<a>third")
      )
    );

    const command: Command = (state, dispatch) => {
      if (dispatch) {
        const { $from } = state.selection;
        const tr = state.tr;
        let offset = 0;
        let $pos = state.doc.resolve($from.after() + offset);
        while (!$pos.parent.inlineContent) {
          offset++;
          $pos = state.doc.resolve($from.after() + offset);
        }
        tr.setSelection(new TextSelection($pos));
        dispatch(tr);
      }
      return true;
    };

    applyCommand(testDoc, command, expectedDoc);
  });
});
