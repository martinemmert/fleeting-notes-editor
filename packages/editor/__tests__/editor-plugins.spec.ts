import { afterAll, beforeAll, beforeEach, describe, it, vi } from "vitest";
import {
  applyCommand,
  doc,
  id,
  note,
  note_children,
  note_text,
  resetIdCounter,
} from "./test-utils";
import { liftNote, sinkNote } from "../src/editor-commands";

beforeAll(() => {
  vi.mock("nanoid");
});

beforeEach(() => {
  resetIdCounter();
});

afterAll(() => {
  vi.clearAllMocks();
});

describe("plugins", () => {
  describe("addParentNoteId", () => {
    it("should add the parent notes id", function () {
      const testDoc = doc(
        note({ id: id(1) }, note_text("hallo 1")), //
        note({ id: id(2) }, note_text("hallo 2<a>"))
      );
      const expectedDoc = doc(
        note(
          { id: id(1) },
          note_text("hallo 1"), //
          note_children(
            note(
              {
                id: id(2),
                parent: id(1),
              },
              note_text("hallo 2<a>") //
            )
          )
        )
      );
      applyCommand(testDoc, sinkNote, expectedDoc);
    });

    it("should set the parent id to null if there isn't any", function () {
      const testDoc = doc(
        note(
          { id: id(1) },
          note_text("hallo 1"), //
          note_children(
            note(
              {
                id: id(2),
                parent: id(1),
              },
              note_text("hallo 2<a>") //
            )
          )
        )
      );
      const expectedDoc = doc(
        note({ id: id(1) }, note_text("hallo 1")), //
        note({ id: id(2) }, note_text("hallo 2<a>"))
      );
      applyCommand(testDoc, liftNote, expectedDoc);
    });
  });
});
