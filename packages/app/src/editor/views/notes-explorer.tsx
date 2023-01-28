import { createSignal, For } from "solid-js";
import DocumentCollection from "../lib/document-collection";
import { A, useNavigate } from "@solidjs/router";
import { pb } from "../lib/api-client";
import { Button } from "@kobalte/core";

export default function NotesExplorer() {
  const [isLoading, setIsLoading] = createSignal(false);
  const navigator = useNavigate();

  async function addNewSheet() {
    setIsLoading(true);
    const document = await DocumentCollection.actions.createDocument(pb(), "untitled");
    navigator(`/${document.id}`);
    setIsLoading(false);
  }

  return (
    <>
      <label for="my-drawer-2" class="drawer-overlay"></label>
      <div class="menu text-base-content py-16 px-8">
        <ul>
          <For each={DocumentCollection.state.documents()}>
            {(item) => {
              return (
                <li class="block w-full text-right">
                  <A href={`/${item.id}`} class="inline-block w-full">
                    {item.title}
                  </A>
                </li>
              );
            }}
          </For>
        </ul>
        <div class="divider"></div>
        <Button.Root
          classList={{
            btn: true,
            "btn-ghost": true,
            "gap-2": true,
            "btn-loading": isLoading(),
          }}
          isDisabled={isLoading()}
          onPress={() => addNewSheet()}
        >
          <svg class="block w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <use href="#file-plus" />
          </svg>
          <span>Add new Note</span>
        </Button.Root>
      </div>
    </>
  );
}
