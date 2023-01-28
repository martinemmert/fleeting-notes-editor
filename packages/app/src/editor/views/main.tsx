import { Route, Router, Routes } from "@solidjs/router";
import EditorView from "./editor";
import NotesExplorer from "./notes-explorer";

export default function MainView() {
  return (
    <Router base="/editor">
      <div class="drawer drawer-mobile">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col items-start justify-start">
          <Routes>
            <Route path="/:id?" component={EditorView} />
          </Routes>
        </div>
        <div class="drawer-side min-w-[20rem]">
          <NotesExplorer />
        </div>
      </div>
    </Router>
  );
}
