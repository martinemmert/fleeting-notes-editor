import { describe, expect, it } from "vitest";
import { doc, id, note, note_children, note_text } from "../../__tests__/test-utils";
import { createEditorState } from "../editor-state";
import { findNoteById } from "./find-node-by-id";

describe("find node by ID", () => {
  it("should find a node by id", () => {
    const testDoc = doc(
      note(
        { id: id(1), expanded: true },
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

    const editorState = createEditorState(testDoc);

    const [needle, pos] = findNoteById(editorState.doc, "mock-id-2");
    expect(needle).toBeDefined();
    expect(needle?.attrs.id).toBe("mock-id-2");
    expect(pos).toBe(15);

    const [needle2, pos2] = findNoteById(editorState.doc, "mock-id-0");
    expect(needle2).toBeNull();
    expect(pos2).toBe(-1);
  });
});
