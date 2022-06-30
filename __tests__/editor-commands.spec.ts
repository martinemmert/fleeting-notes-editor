import { afterAll, beforeAll, beforeEach, describe, it, vi } from "vitest";
import {
  applyCommand,
  createMockIdString,
  doc,
  note,
  note_text,
  resetIdCounter,
} from "./test-utils";
import { splitNote } from "../src/editor/editor-commands";

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
        note({ id: createMockIdString(1) }, note_text("hello")),
        note({ id: createMockIdString(2) }, note_text("world"))
      );
      applyCommand(testDoc, splitNote, expectedDoc);
    });

    it("should delete the current selection while splitting", () => {
      const testDoc = doc(note(note_text("hello<a>new<b>world")));
      const expectedDoc = doc(
        note({ id: createMockIdString(1) }, note_text("hello")),
        note({ id: createMockIdString(2) }, note_text("world"))
      );
      applyCommand(testDoc, splitNote, expectedDoc);
    });
  });
});
