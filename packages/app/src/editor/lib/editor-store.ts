import PocketBase, { Record } from "pocketbase";
import { Node } from "prosemirror-model";
import { createSignal } from "solid-js";
import { getCurrentUserId } from "./api-client";
import EmptyDoc from "./empty-doc.json";

type Document = Record & {
  id: string;
  owner: string;
  title: string;
  content: Node | null;
};

const [isLoading, setIsLoading] = createSignal(false);
const [isInitialized, setIsInitialized] = createSignal(false);
const [currentDocument, setCurrentDocument] = createSignal<Document | null>(null);
const [documentCollection, setDocumentCollection] = createSignal<Document[]>([]);

async function initialize(pb: PocketBase) {
  setIsLoading(true);
  const documents = await pb.collection("documents").getFullList<Document>();
  const mainDoc = documents.find((document) => document.title === "main");

  if (!mainDoc) {
    const document = await createDocument(pb, "main");
    setCurrentDocument(document);
    setDocumentCollection([document]);
  } else {
    setCurrentDocument(mainDoc);
    setDocumentCollection(documents);
  }

  setIsLoading(false);
  setIsInitialized(true);
}

async function createDocument(pb: PocketBase, title: string) {
  const userId = getCurrentUserId();

  if (!userId) throw new Error("Not authenticated!");

  return await pb.collection("documents").create<Document>({
    owner: userId,
    title,
    content: EmptyDoc,
  });
}

async function updateCurrentDocument(pb: PocketBase, content: unknown, hashtags: unknown) {
  const doc = currentDocument();

  if (!doc) return null;

  // send update to server
  return await pb.collection("documents").update(doc.id, {
    content,
    hashtags,
  });
}

export default {
  isLoading,
  isInitialized,
  currentDocument,
  documentCollection,
  initialize,
  updateCurrentDocument,
};
