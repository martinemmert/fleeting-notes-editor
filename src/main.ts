import "./style.css";
import { createEditor, createJSONView } from "./editor";

const app = document.querySelector<HTMLDivElement>("#app")!;
const json = document.querySelector<HTMLDivElement>("#json")!;
const editor = createEditor(app);
void createJSONView(json, editor.emitter, editor.state);

editor.view.focus();
