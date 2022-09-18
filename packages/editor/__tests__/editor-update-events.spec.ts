import { afterAll, beforeAll, beforeEach, describe, expect, vi } from "vitest";
import { resetIdCounter } from "./test-utils";
import { createEditorState } from "../src/editor-state";
import mitt from "mitt";
import { Events } from "../src/editor-plugins";

beforeAll(() => {
  vi.mock("nanoid");
});

beforeEach(() => {
  resetIdCounter();
});

afterAll(() => {
  vi.clearAllMocks();
});

function createEditor(doc?: Node | {}) {
  const eventEmitter = mitt<Events>();
  const state = createEditorState(doc, eventEmitter);
  return { emitter: eventEmitter, state };
}

describe("editor update events", () => {
  describe("update_note", () => {
    const listener = vi.fn();
    const editor = createEditor();
    editor.emitter.on("update", listener);

    expect(listener).toBeCalled();
  });
});
