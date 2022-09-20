import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyCommand,
  doc,
  id,
  note,
  note_children,
  note_text,
  resetIdCounter,
} from "./test-utils";
import {
  moveNoteDown,
  moveNoteUp,
  splitNote,
  toggleNoteCompleteState,
} from "../src/editor-commands";

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
      const testDoc = doc(note({ id: id(1) }, note_text("<a>hello world")));
      const expectedDoc = doc(
        note({ id: id(2) }, note_text("")),
        note({ id: id(1) }, note_text("<a>hello world"))
      );
      applyCommand(testDoc, splitNote, expectedDoc);
    });

    it("should continue to lift the current note when enter is pressed repeatedly in an empty note that follows an empty node", () => {
      const testDoc = doc(
        note(
          { id: id(1), parent: null },
          note_text("Headline"),
          note_children(
            note(
              { id: id(2), parent: id(1) },
              note_text("Hello World") //
            ),
            note(
              { id: id(3), parent: id(1) },
              note_text("Hello World"), //
              note_children(
                //
                note(
                  { id: id(4), parent: id(3) }, //
                  note_text("one")
                ),
                note(
                  { id: id(6), parent: id(3) }, //
                  note_text("<a>")
                )
              )
            )
          )
        )
      );

      const expectedDoc1 = doc(
        note(
          { id: id(1), parent: null },
          note_text("Headline"),
          note_children(
            note(
              { id: id(2), parent: id(1) },
              note_text("Hello World") //
            ),
            note(
              { id: id(3), parent: id(1) },
              note_text("Hello World"), //
              note_children(
                //
                note(
                  { id: id(4), parent: id(3) }, //
                  note_text("one")
                )
              )
            ),
            note(
              { id: id(6), parent: id(1) }, //
              note_text("<a>")
            )
          )
        )
      );

      const expectedDoc2 = doc(
        note(
          { id: id(1), parent: null },
          note_text("Headline"),
          note_children(
            note(
              { id: id(2), parent: id(1) },
              note_text("Hello World") //
            ),
            note(
              { id: id(3), parent: id(1) },
              note_text("Hello World"), //
              note_children(
                //
                note(
                  { id: id(4), parent: id(3) }, //
                  note_text("one")
                )
              )
            )
          )
        ),
        note(
          { id: id(6), parent: null }, //
          note_text("<a>")
        )
      );

      const command = vi.fn(splitNote);

      applyCommand(testDoc, command, expectedDoc1);
      applyCommand(expectedDoc1, command, expectedDoc2);
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

      applyCommand(testDoc, command, expectedDoc);
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

      applyCommand(testDoc, command, expectedDoc);
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

  describe("toggleNoteCompleteState", () => {
    it("should add the attribute completed", () => {
      const command = vi.fn(toggleNoteCompleteState);

      const testDoc = doc(note({}, note_text("first child<a>")));
      const expectedDoc = doc(note({ completed: true }, note_text("first child<a>")));
      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should remove the attribute completed", () => {
      const command = vi.fn(toggleNoteCompleteState);

      const testDoc = doc(note({ completed: true }, note_text("first child<a>")));
      const expectedDoc = doc(note({ completed: false }, note_text("first child<a>")));
      applyCommand(testDoc, command, expectedDoc);
      expect(command).toHaveReturnedWith(true);
    });

    it("should add the attribute recursive", () => {
      const command = vi.fn(toggleNoteCompleteState);

      const testDoc = doc(
        note(
          { id: id(1) }, //
          note_text("lorem ipsum")
        ), //
        note(
          { id: id(2), completed: null },
          note_text("first child<a>"),
          note_children(
            note(
              { id: id(3), parent: id(2), completed: null }, //
              note_text("second_child")
            ),
            note(
              { id: id(4), parent: id(2), completed: null },
              note_text("third child"), //
              note_children(
                note(
                  { id: id(5), parent: id(4), completed: null }, //
                  note_text("fourth_child")
                ),
                note(
                  { id: id(6), parent: id(4), completed: null }, //
                  note_text("fifth child")
                )
              )
            )
          )
        ),
        note(
          { id: id(7), parent: null, completed: null }, //
          note_text("lorem ipsum")
        ) //
      );

      const expectedDoc = doc(
        note(
          { id: id(1) }, //
          note_text("lorem ipsum")
        ), //
        note(
          { id: id(2), completed: true },
          note_text("first child<a>"),
          note_children(
            note(
              { id: id(3), parent: id(2), completed: true }, //
              note_text("second_child")
            ),
            note(
              { id: id(4), parent: id(2), completed: true },
              note_text("third child"), //
              note_children(
                note(
                  { id: id(5), parent: id(4), completed: true }, //
                  note_text("fourth_child")
                ),
                note(
                  { id: id(6), parent: id(4), completed: true }, //
                  note_text("fifth child")
                )
              )
            )
          )
        ),
        note(
          { id: id(7), parent: null, completed: null }, //
          note_text("lorem ipsum")
        ) //
      );

      applyCommand(testDoc, command, expectedDoc, true);
      expect(command).toHaveReturnedWith(true);
    });

    it("should remove the attribute recursively", () => {
      const command = vi.fn(toggleNoteCompleteState);

      const testDoc = doc(
        note(
          { id: id(1) }, //
          note_text("lorem ipsum")
        ), //
        note(
          { id: id(2), completed: true },
          note_text("first child<a>"),
          note_children(
            note(
              { id: id(3), parent: id(2), completed: true }, //
              note_text("second_child")
            ),
            note(
              { id: id(4), parent: id(2), completed: true },
              note_text("third child"), //
              note_children(
                note(
                  { id: id(5), parent: id(4), completed: true }, //
                  note_text("fourth_child")
                ),
                note(
                  { id: id(6), parent: id(4), completed: true }, //
                  note_text("fifth child")
                )
              )
            )
          )
        ),
        note(
          { id: id(7), parent: null, completed: null }, //
          note_text("lorem ipsum")
        ) //
      );

      const expectedDoc = doc(
        note(
          { id: id(1) }, //
          note_text("lorem ipsum")
        ), //
        note(
          { id: id(2), completed: false },
          note_text("first child<a>"),
          note_children(
            note(
              { id: id(3), parent: id(2), completed: false }, //
              note_text("second_child")
            ),
            note(
              { id: id(4), parent: id(2), completed: false },
              note_text("third child"), //
              note_children(
                note(
                  { id: id(5), parent: id(4), completed: false }, //
                  note_text("fourth_child")
                ),
                note(
                  { id: id(6), parent: id(4), completed: false }, //
                  note_text("fifth child")
                )
              )
            )
          )
        ),
        note(
          { id: id(7), parent: null, completed: null }, //
          note_text("lorem ipsum")
        ) //
      );

      applyCommand(testDoc, command, expectedDoc, true);
      expect(command).toHaveReturnedWith(true);
    });

    it("should not run when current note's parent is completed", () => {
      const command = vi.fn(toggleNoteCompleteState);

      const testDoc = doc(
        note(
          { id: id(1) }, //
          note_text("lorem ipsum")
        ), //
        note(
          { id: id(2), completed: true },
          note_text("first child"),
          note_children(
            note(
              { id: id(3), parent: id(2), completed: true }, //
              note_text("second_child")
            ),
            note(
              { id: id(4), parent: id(2), completed: true },
              note_text("third child<a>"), //
              note_children(
                note(
                  { id: id(5), parent: id(4), completed: true }, //
                  note_text("fourth_child")
                ),
                note(
                  { id: id(6), parent: id(4), completed: true }, //
                  note_text("fifth child")
                )
              )
            )
          )
        ),
        note(
          { id: id(7), parent: null, completed: null }, //
          note_text("lorem ipsum")
        ) //
      );

      applyCommand(testDoc, command, testDoc);
      expect(command).toHaveReturnedWith(false);
    });
  });
});
