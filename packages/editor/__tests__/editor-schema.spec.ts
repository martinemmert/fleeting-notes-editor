/**
 * @vitest-environment happy-dom
 */

import matchers from "@testing-library/jest-dom/matchers";
import { beforeAll, describe, expect, it } from "vitest";
import { doc, id, note, note_children, note_text } from "./test-utils";
import { createEditorState } from "../src/editor-state";
import { createEditorView } from "../src/editor-view";
import { getByText, queryByAttribute, queryByText } from "@testing-library/dom";

beforeAll(() => {
  expect.extend(matchers);
});

describe("note_children", () => {
  it("should not render any children when expanded is set to false", () => {
    const testDoc = doc(
      note(
        { id: id(1) },
        note_text("first child"),
        note_children(
          { expanded: false },
          note(
            { id: id(2), parent: id(1) }, //
            note_text("second_child")
          )
        )
      )
    );

    const root = document.createElement("div");

    const state = createEditorState(testDoc, null);
    const view = createEditorView(root, state);

    document.append(root);

    const needle = queryByAttribute("data-id", view.dom, "mock-id-2");

    expect(needle).not.toBeInTheDocument();
  });
});
