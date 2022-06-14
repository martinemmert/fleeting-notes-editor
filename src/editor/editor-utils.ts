import { Node, NodeType } from "prosemirror-model";

export const isTargetNodeOfType = (node: Node, type: NodeType) =>
  node.type === type;

export const nodeHasAttribute = (node: Node, attrName: string) =>
  Boolean(node.attrs && node.attrs[attrName]);
