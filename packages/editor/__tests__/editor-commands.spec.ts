import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyCommand,
  id,
  doc,
  note,
  note_text,
  resetIdCounter,
  note_children,
} from "./test-utils";
import { moveNoteDown, moveNoteUp, splitNote } from "../src/editor-commands";
import { nanoid } from "nanoid";

beforeAll(() => {
  vi.mock("nanoid");
});

beforeEach(() => {
  resetIdCounter();
});

afterAll(() => {
  vi.clearAllMocks();
});

describe("commands", () => {
  describe("splitNote", () => {
    it("should split the current note in two notes at the current cursor", () => {
      const testDoc = doc(note(note_text("hello<a>world")));
      const expectedDoc = doc(
        note({ id: id(1) }, note_text("hello")),
        note({ id: id(2) }, note_text("world"))
      );
      applyCommand(testDoc, splitNote, expectedDoc);
    });

    it("should delete the current selection while splitting", () => {
      const testDoc = doc(note(note_text("hello<a>new<b>world")));
      const expectedDoc = doc(
        note({ id: id(1) }, note_text("hello")),
        note({ id: id(2) }, note_text("world"))
      );
      applyCommand(testDoc, splitNote, expectedDoc);
    });

    it("should insert a new sibling note before the current note if the cursor is at the start of the current note", () => {
      const testDoc = doc(note({ id: nanoid() }, note_text("<a>hello world")));
      const expectedDoc = doc(
        note({ id: id(2) }, note_text("")),
        note({ id: id(1) }, note_text("<a>hello world"))
      );
      applyCommand(testDoc, splitNote, expectedDoc, false);
    });

    it("should move the caret one level up when enter is pressed in an empty node that follows an already empty node", () => {
      const testDoc = doc(
        note(
          note_text("Headline"),
          note_children(
            note(
              note_text("Hello World") //
            ),
            note(
              note_text("Hello World") //
            ),
            note(
              note_text("") //
            ),
            note(
              note_text("<a>") //
            )
          )
        )
      );
      const expectedDoc = doc(
        note(
          note_text("Headline"),
          note_children(
            note(
              note_text("Hello World") //
            ),
            note(
              note_text("Hello World") //
            ),
            note(
              note_text("") //
            )
          )
        ),
        note(
          note_text("<a>") //
        )
      );

      const command = vi.fn(splitNote);

      applyCommand(testDoc, command, expectedDoc, true);
    });
  });

  describe("moveNoteUp", () => {
    it.skip("should cancel if the selection is not within a note", () => {
      // todo: needed as soon as we have other node types in our schema
      const command = vi.fn(moveNoteUp);
      const testDoc = doc(note({ id: id(1) }, note_text("hello world")));
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should cancel if the current selection is not a cursor", () => {
      const command = vi.fn(moveNoteUp);
      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(2) }, note_text("<a>seco<b>nd child")),
        note({ id: id(3) }, note_text("third child"))
      );
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should cancel if the current note is the first child (scenario 1)", () => {
      const command = vi.fn(moveNoteUp);
      const testDoc = doc(
        note({ id: id(1) }, note_text("first<a> child")),
        note({ id: id(2) }, note_text("second child")),
        note({ id: id(3) }, note_text("third child"))
      );
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should cancel if the current note is the first child (scenario 2)", () => {
      const command = vi.fn(moveNoteUp);
      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo<a> 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );

      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should move the current note up on the same level (scenario 1)", () => {
      const command = vi.fn(moveNoteUp);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(2) }, note_text("second<a> child")),
        note({ id: id(3) }, note_text("third child"))
      );
      const expectedDoc = doc(
        note({ id: id(2) }, note_text("second<a> child")),
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(3) }, note_text("third child"))
      );
      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should move the current note up on the same level (scenario 2)", () => {
      const command = vi.fn(moveNoteUp);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second<a> child"),
          note_children(note({ id: id(3) }, note_text("foo")))
        ),
        note({ id: id(4) }, note_text("third child"))
      );
      const expectedDoc = doc(
        note(
          { id: id(2) },
          note_text("second<a> child"),
          note_children(note({ id: id(3) }, note_text("foo")))
        ),
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(4) }, note_text("third child"))
      );
      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should move the current note up on the same level (scenario 3)", () => {
      const command = vi.fn(moveNoteUp);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo <a>3"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );

      const expectedDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(5) }, note_text("foo <a>3")),
            note({ id: id(4) }, note_text("foo 2"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );

      applyCommand(testDoc, command, expectedDoc, true);
      expect(command).toHaveReturnedWith(true);
    });

    it("should move the current note up on the same level (scenario 4)", () => {
      const command = vi.fn(moveNoteUp);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        ),
        note({ id: id(6) }, note_text("third chi<a>ld"))
      );

      const expectedDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(6) }, note_text("third chi<a>ld")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        )
      );

      applyCommand(testDoc, command, expectedDoc, true);
      expect(command).toHaveReturnedWith(true);
    });
  });

  describe("moveNoteDown", () => {
    it.skip("should cancel if the selection is not within a note", () => {
      // todo: needed as soon as we have other node types in our schema
      const command = vi.fn(moveNoteDown);
      const testDoc = doc(note({ id: id(1) }, note_text("hello world")));
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should cancel if the current selection is not a cursor", () => {
      const command = vi.fn(moveNoteDown);
      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(2) }, note_text("<a>seco<b>nd child")),
        note({ id: id(3) }, note_text("third child"))
      );
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should cancel if the current note is the last child (scenario 1)", () => {
      const command = vi.fn(moveNoteDown);
      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(2) }, note_text("second child")),
        note({ id: id(3) }, note_text("third<a> child"))
      );
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should cancel if the current note is the last child (scenario 2)", () => {
      const command = vi.fn(moveNoteDown);
      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo<a> 3"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );
      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });

    it("should move the current note down on the same level (scenario 1)", () => {
      const command = vi.fn(moveNoteDown);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(2) }, note_text("second<a> child")),
        note({ id: id(3) }, note_text("third child"))
      );
      const expectedDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(3) }, note_text("third child")),
        note({ id: id(2) }, note_text("second<a> child"))
      );
      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should move the current note down on the same level (scenario 2)", () => {
      const command = vi.fn(moveNoteDown);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second<a> child"),
          note_children(note({ id: id(3) }, note_text("foo")))
        ),
        note({ id: id(4) }, note_text("third child"))
      );
      const expectedDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note({ id: id(4) }, note_text("third child")),
        note(
          { id: id(2) },
          note_text("second<a> child"),
          note_children(note({ id: id(3) }, note_text("foo")))
        )
      );
      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should move the current note down on the same level (scenario 3)", () => {
      const command = vi.fn(moveNoteDown);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo <a>1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );

      const expectedDoc = doc(
        note({ id: id(1) }, note_text("first child")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(3) }, note_text("foo <a>1")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );

      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should move the current note down on the same level (scenario 4)", () => {
      const command = vi.fn(moveNoteDown);

      const testDoc = doc(
        note({ id: id(1) }, note_text("first chi<a>ld")),
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        ),
        note({ id: id(6) }, note_text("third child"))
      );

      const expectedDoc = doc(
        note(
          { id: id(2) },
          note_text("second child"),
          note_children(
            note({ id: id(3) }, note_text("foo 1")),
            note({ id: id(4) }, note_text("foo 2")),
            note({ id: id(5) }, note_text("foo 3"))
          )
        ),
        note({ id: id(1) }, note_text("first chi<a>ld")),
        note({ id: id(6) }, note_text("third child"))
      );

      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });
  });
});
