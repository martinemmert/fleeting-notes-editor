import { createEditor } from "@fleeting-notes/editor";
import { createJSONView } from "./create-json-view";
import { applyDevTools } from "prosemirror-dev-toolkit";

export function create(documentState: any) {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const json = document.querySelector<HTMLDivElement>("#json")!;

  app.replaceChildren();
  json.replaceChildren();

  const editor = createEditor(app, documentState);
  void createJSONView(json, editor.emitter, editor.state);
  applyDevTools(editor.view, { devToolsExpanded: false });
  return editor;
}
