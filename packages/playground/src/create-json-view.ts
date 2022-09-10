import { Emitter } from "mitt";
import { EditorState } from "prosemirror-state";

export async function createJSONView(
  element: HTMLElement,
  emitter: Emitter<any>,
  state: EditorState
) {
  const { default: highlight } = await import("highlight.js");
  const { default: jsonHighlighter } = await import(
    "highlight.js/lib/languages/json"
  );

  highlight.registerLanguage("json", jsonHighlighter);

  const pre = document.createElement("pre");
  const code = document.createElement("code");

  code.classList.add("language-json");

  function highlightCode(code: any) {
    return highlight.highlight(JSON.stringify(code, undefined, " "), {
      language: "json",
    }).value;
  }

  emitter.on("update", (props) => {
    const json = props.newState.toJSON();
    code.innerHTML = highlightCode(json);
  });

  pre.append(code);
  element.append(pre);

  code.innerHTML = highlightCode(state.toJSON());

  return pre;
}
