import { Node } from "prosemirror-model";

export function findNoteById(doc: Node, id: string): [Node | null, number] {
  let needle: Node | null = null;
  let needlePos: number = -1;
  doc.descendants((node, pos) => {
    if (node.type.name === "note" && !needle && node.attrs.id === id) {
      needle = node;
      needlePos = pos;
      return false;
    }
    return true;
  });

  return [needle, needlePos];
}
