import { A, Route, Router, Routes } from "@solidjs/router";
import { For } from "solid-js";
import DocumentCollection from "../lib/document-collection";
import EditorView from "./editor";

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
          <label for="my-drawer-2" class="drawer-overlay"></label>
          <ul class="menu text-base-content py-16">
            <For each={DocumentCollection.state.documents()}>
              {(item) => {
                return (
                  <li class="block w-full px-8 text-right">
                    <A href={`/${item.id}`} class="inline-block w-full">
                      {item.title}
                    </A>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
      </div>
    </Router>
  );
}
