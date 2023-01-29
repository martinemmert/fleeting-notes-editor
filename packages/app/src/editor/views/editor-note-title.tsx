import DocumentsCollection from "../lib/document-collection";
import { createMemo, createSignal } from "solid-js";
import clickOutside from "../directives/click-outside";
import { pb } from "../lib/api-client";
import DOMPurify from "dompurify";

export default function EditorNoteTitle() {
  const [isEditable, setIsEditable] = createSignal(false);

  let heading: HTMLHeadingElement;
  const handleClickOutside = clickOutside;

  function sanitizeHTML(text: string) {
    return DOMPurify.sanitize(text, { USE_PROFILES: { html: false } });
  }

  function cancel() {
    setIsEditable(false);
    heading.textContent = DocumentsCollection.state.currentDocument()?.title as string;
  }

  async function save() {
    if (!heading.textContent || heading.textContent?.trim() === "") {
      return cancel();
    }
    setIsEditable(false);
    void DocumentsCollection.actions.saveDocument(
      pb(),
      DocumentsCollection.state.currentDocumentId()!,
      {
        title: sanitizeHTML(heading.textContent ?? "untitled"),
      }
    );
  }

  const title = createMemo(() => DocumentsCollection.state.currentDocument()?.title);

  return (
    <header class="text-xl mb-8 text-center border-b-2 border-b-base-200 border-b-solid">
      <h1
        classList={{
          "outline-none": true,
          "p-2": true,
          "cursor-text": true,
          "hover:bg-base-200": true,
          "bg-base-200": isEditable(),
        }}
        ref={heading}
        use:handleClickOutside={() => {
          return isEditable() && save();
        }}
        onclick={() => {
          setIsEditable(true);
          if (heading) heading.focus();
        }}
        onkeydown={(event) => {
          switch (event.key) {
            case "Escape":
              cancel();
              break;
            case "Enter":
              save();
              break;
          }
        }}
        contenteditable={isEditable()}
      >
        {title}
      </h1>
    </header>
  );
}
