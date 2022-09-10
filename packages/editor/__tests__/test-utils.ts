import { Node } from "prosemirror-model";
import { builders, eq, NodeBuilder } from "prosemirror-test-builder";
import { createEditorSchema } from "../src/editor-schema";
import {
  Command,
  NodeSelection,
  Selection,
  TextSelection,
} from "prosemirror-state";
import { expect } from "vitest";
import { createEditorState } from "../src/editor-state";

export { getNextMockedId, id, resetIdCounter } from "../__mocks__/nanoid";

const schema = createEditorSchema();
const { note, note_text, note_children, text, doc } = builders(schema) as {
  schema: typeof schema;
  note: NodeBuilder;
  note_text: NodeBuilder;
  note_children: NodeBuilder;
  text: NodeBuilder;
  doc: NodeBuilder;
};

export { note, note_text, note_children, text, doc };

export function getSelection(doc: Node) {
  const a = (doc as any).tag.a;
  const b = (doc as any).tag.b;
  if (a != null) {
    let $a = doc.resolve(a);
    if ($a.parent.inlineContent)
      return new TextSelection($a, b != null ? doc.resolve(b) : undefined);
    else return new NodeSelection($a);
  }
  return Selection.atStart(doc);
}

export function applyCommand(
  doc: Node,
  command: Command,
  result: Node,
  debug = false
) {
  let state = createEditorState(doc, undefined, {
    selection: getSelection(doc),
  });

  command(state, (tr) => (state = state.apply(tr)));

  const isEqual = eq(result, state.doc);

  if (!isEqual && debug) {
    console.log(
      JSON.stringify(result.toJSON(), undefined, " "),
      JSON.stringify(state.doc.toJSON(), undefined, " ")
    );
  }

  // test if the current document is equal to the expected document
  expect(isEqual).toBe(true);

  if (result && (result as any).tag.a != null) {
    const expectedSelection = getSelection(result);
    const isEqualSelection = eq(state.selection, expectedSelection);

    if (!isEqualSelection && debug) {
      console.log(
        JSON.stringify(state.selection.toJSON(), undefined, " "),
        JSON.stringify(expectedSelection.toJSON(), undefined, " ")
      );
    }

    // test if the current selection is equal to the expected selection
    expect(isEqualSelection).toBe(true);
  }
}
