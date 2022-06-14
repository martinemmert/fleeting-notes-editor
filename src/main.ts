import "./style.css";
import { createEditor, createJSONView } from "./editor";
import { applyDevTools } from "prosemirror-dev-toolkit";

// const initialDoc = {
//   type: "doc",
//   content: [
//     {
//       type: "note",
//       attrs: {
//         id: "O5UiOOH2ESNzU9rM",
//         type: "note",
//       },
//       content: [
//         {
//           type: "text",
//           text: "asdsada",
//         },
//       ],
//     },
//     {
//       type: "note",
//       attrs: {
//         id: "EP2ShJOQA7bb4086",
//         type: "note",
//       },
//       content: [
//         {
//           type: "text",
//           text: "asdsad",
//         },
//       ],
//     },
//   ],
// };

const app = document.querySelector<HTMLDivElement>("#app")!;
const json = document.querySelector<HTMLDivElement>("#json")!;
const editor = createEditor(app);
void createJSONView(json, editor.emitter, editor.state);

applyDevTools(editor.view, { devToolsExpanded: true });

editor.view.focus();
