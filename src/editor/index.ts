import { createEditorView } from "./editor-view";
import { createEditorState } from "./editor-state";
import { Node } from "prosemirror-model";
import mitt, { Emitter } from "mitt";
import { Events } from "./editor-plugins";

export function createEditor(element: HTMLElement, doc?: Node) {
  const eventEmitter = mitt<Events>();
  const state = createEditorState(doc, eventEmitter);
  const view = createEditorView(element, state);
  return { view, emitter: eventEmitter, state };
}

export async function createJSONView(
  element: HTMLElement,
  emitter: Emitter<Events>
) {
  const { default: highlight } = await import("highlight.js");
  const { default: jsonHighlighter } = await import(
    "highlight.js/lib/languages/json"
  );

  highlight.registerLanguage("json", jsonHighlighter);

  const pre = document.createElement("pre");
  const code = document.createElement("code");

  code.classList.add("language-json");

  emitter.on("update", (props) => {
    const json = props.newState.toJSON();
    code.innerHTML = highlight.highlight(JSON.stringify(json, undefined, " "), {
      language: "json",
    }).value;
  });

  pre.append(code);
  element.append(pre);

  return pre;
}
