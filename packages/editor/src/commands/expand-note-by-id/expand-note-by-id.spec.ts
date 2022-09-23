import { describe, expect, it, vi } from "vitest";
import {
  applyCommand,
  doc,
  id,
  note,
  note_children,
  note_text,
} from "../../../__tests__/test-utils";
import { expandNoteById } from "./expand-note-by-id";

describe("expand note by id", () => {
  it("should expand the designated note", () => {
    const command = vi.fn(expandNoteById("mock-id-2"));

    const testDoc = doc(
      note({ id: id(1) }, note_text("foobar")),
      note(
        { id: id(2), expanded: false },
        note_text("first child"),
        note_children(
          { expanded: false }, //
          note(
            { id: id(3), parent: id(2) }, //
            note_text("second_child")
          )
        )
      )
    );

    const expectedDoc = doc(
      note({ id: id(1) }, note_text("foobar")),
      note(
        { id: id(2), expanded: true },
        note_text("first child<a>"),
        note_children(
          { expanded: true }, //
          note(
            { id: id(3), parent: id(2) }, //
            note_text("second_child")
          )
        )
      )
    );

    applyCommand(testDoc, command, expectedDoc);
    expect(command).toHaveReturnedWith(true);
  });
});
