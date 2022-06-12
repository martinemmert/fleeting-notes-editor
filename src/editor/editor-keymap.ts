import { keymap } from "prosemirror-keymap";
import { redo, undo } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";

export function createEditorKeymap() {
  return keymap({
    ...baseKeymap,
    "Mod-z": undo,
    "Mod-y": redo,
  });
}
