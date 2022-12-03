import { isTargetNodeOfType } from "../editor-utils";
import { NodeType, ResolvedPos } from "prosemirror-model";

export function findParentNodeOfType($pos: ResolvedPos, nodeType: NodeType) {
  let depth = $pos.depth;
  let node = $pos.node(depth);

  while (true) {
    if (isTargetNodeOfType(node, nodeType)) return node;
    if (depth < 0) break;
    node = $pos.node(--depth);
  }

  return null;
}
