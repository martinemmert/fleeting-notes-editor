import "./style.css";
import { create } from "./playground";
import { state, update } from "./store";

const editor = create(state);
editor.view.focus();

if (import.meta.hot) {
  import.meta.hot.accept();

  editor.emitter.on("update", (props) => {
    const json = props.newState.toJSON();
    update(json);
  });
}
