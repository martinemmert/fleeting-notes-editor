import { Node, NodeType, ResolvedPos } from "prosemirror-model";

export const isTargetNodeOfType = (
  node: Node | null | undefined,
  type: NodeType
) => node !== null && typeof node !== "undefined" && node.type === type;

export const nodeHasAttribute = (node: Node, attrName: string) =>
  Boolean(node.attrs && node.attrs[attrName]);

const _default_cb = (node: Node) => node;

export const mapChildren = (
  node: Node,
  callback?: (child: Node, index: number, parentNode: Node) => Node | null
) => {
  const arr: Node[] = [];
  for (let i = 0; i < node.childCount; i++) {
    const child = (callback ?? _default_cb)(node.child(i), i, node);
    if (child) arr.push(child);
  }
  return arr;
};

export function positionAtEnd($position: ResolvedPos) {
  return $position.parentOffset === $position.parent.textContent.length;
}
