import { keymap } from "prosemirror-keymap";
import { redo, undo } from "prosemirror-history";
import {
  chainCommands,
  createParagraphNear,
  deleteSelection,
  exitCode,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  newlineInCode,
  selectAll,
  selectNodeBackward,
  selectNodeForward,
  selectTextblockEnd,
  selectTextblockStart,
  splitBlock,
} from "prosemirror-commands";
import {
  joinNoteBackward,
  joinNoteForward,
  splitNote,
} from "./editor-commands";
import { Command } from "prosemirror-state";

let backspace = chainCommands(
  deleteSelection,
  joinNoteBackward,
  joinBackward,
  selectNodeBackward
);
let del = chainCommands(
  deleteSelection,
  joinNoteForward,
  joinForward,
  selectNodeForward
);

/// A basic keymap containing bindings not specific to any schema.
/// Binds the following keys (when multiple commands are listed, they
/// are chained with [`chainCommands`](#commands.chainCommands)):
///
/// * **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
/// * **Mod-Enter** to `exitCode`
/// * **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
/// * **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
/// * **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
/// * **Mod-a** to `selectAll`
export const pcBaseKeymap: { [key: string]: Command } = {
  Enter: chainCommands(
    // newlineInCode,
    // createParagraphNear,
    // liftEmptyBlock,
    // splitBlock,
    splitNote
  ),
  "Mod-Enter": exitCode,
  Backspace: backspace,
  "Mod-Backspace": backspace,
  "Shift-Backspace": backspace,
  Delete: del,
  "Mod-Delete": del,
  "Mod-a": selectAll,
};

/// A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
/// **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
/// **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
/// Ctrl-Delete.
export const macBaseKeymap: { [key: string]: Command } = {
  "Ctrl-h": pcBaseKeymap["Backspace"],
  "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
  "Ctrl-d": pcBaseKeymap["Delete"],
  "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
  "Alt-Delete": pcBaseKeymap["Mod-Delete"],
  "Alt-d": pcBaseKeymap["Mod-Delete"],
  "Ctrl-a": selectTextblockStart,
  "Ctrl-e": selectTextblockEnd,
};
for (let key in pcBaseKeymap) (macBaseKeymap as any)[key] = pcBaseKeymap[key];

const mac =
  typeof navigator != "undefined"
    ? /Mac|iP(hone|[oa]d)/.test(navigator.platform)
    : // @ts-ignore
    typeof os != "undefined" && os.platform
    ? os.platform() == "darwin"
    : false;

/// Depending on the detected platform, this will hold
/// [`pcBasekeymap`](#commands.pcBaseKeymap) or
/// [`macBaseKeymap`](#commands.macBaseKeymap).
export const baseKeymap: { [key: string]: Command } = mac
  ? macBaseKeymap
  : pcBaseKeymap;

export function createEditorKeymap() {
  return keymap({
    ...baseKeymap,
    "Mod-z": undo,
    "Mod-y": redo,
    Backspace: chainCommands(joinNoteBackward, baseKeymap.Backspace),
    "Mod-Backspace": chainCommands(joinNoteBackward, baseKeymap.Backspace),
    "Shift-Backspace": chainCommands(joinNoteBackward, baseKeymap.Backspace),
    Enter: chainCommands(splitNote, baseKeymap.Enter),
    // Tab: transformIntoBranchNote,
  });
}
