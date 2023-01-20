import PocketBase, { Record } from "pocketbase";
import { Node } from "prosemirror-model";
import { getCurrentUserId } from "./api-client";
import EmptyDoc from "./empty-doc.json";
import { createStore, produce } from "solid-js/store";

type Document = Record & {
  id: string;
  owner: string;
  title: string;
  content: Node | null;
  hashtags: {
    [key: string]: string;
  };
};

type DocumentData = Pick<Document, "content" | "hashtags">;

type DocumentStore = {
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  currentDocument: Document | null;
  documents: Document[];
  currentDocumentId: string | null;
  currentDocumentData: null | {
    doc: Object;
    hashtags: {
      [key: string]: string;
    };
  };
};

const [store, setState] = createStore<DocumentStore>({
  isLoading: false,
  isSaving: false,
  isInitialized: false,
  documents: [],
  currentDocumentId: null,
  get currentDocument() {
    return this.documents.find((doc: Document) => doc.id === this.currentDocumentId);
  },
  get currentDocumentData() {
    return !this.currentDocument
      ? null
      : {
          doc: this.currentDocument.content,
          hashtags: this.currentDocument.hashtags,
        };
  },
});

//todo: add initial document here
async function initialize(pb: PocketBase, preselectedDocumentId?: string) {
  setState({ isLoading: true });

  const documents = await pb.collection("documents").getFullList<Document>();

  let mainDocument = documents.find((doc) => doc.title === "main");
  let preselectedDocument = documents.find((doc) => doc.id === preselectedDocumentId);

  mainDocument = mainDocument ?? preselectedDocument;

  if (!mainDocument) mainDocument = await createDocument(pb, "main");

  setState({
    currentDocumentId: mainDocument.id,
    documents,
    isInitialized: true,
    isLoading: false,
  });
}

const selectCurrentDocument = (id: string) => {
  if (id === store.currentDocumentId) return false;
  if (!store.documents.find((doc) => doc.id === id)) return false;
  setState({ currentDocumentId: id });
  return true;
};

async function createDocument(pb: PocketBase, title: string) {
  const userId = getCurrentUserId();

  if (!userId) throw new Error("Not authenticated!");

  return await pb.collection("documents").create<Document>({
    owner: userId,
    title,
    content: EmptyDoc,
  });
}

const updateDocument = (id: string, data: DocumentData) => {
  setState(
    "documents",
    (doc) => doc.id === id,
    (doc) => ({ ...doc, ...data })
  );
};

async function saveDocument(pb: PocketBase, id: string, data: DocumentData) {
  setState({ isSaving: true });

  // send update to server
  const updatedRecord = await pb.collection("documents").update<Document>(id, data);

  // console.log(updatedRecord);

  setState(
    produce((state) => {
      const index = state.documents.findIndex((doc) => doc.id === updatedRecord.id);
      state.documents.splice(index, 1, updatedRecord);
      state.isSaving = false;
    })
  );

  return updatedRecord;
}

export default {
  state: {
    isLoading: () => store.isLoading,
    isSaving: () => store.isSaving,
    isInitialized: () => store.isInitialized,
    currentDocumentId: () => store.currentDocumentId,
    currentDocument: () => store.currentDocument,
    currentDocumentData: () => store.currentDocumentData,
    documents: () => store.documents,
  },
  actions: {
    initialize,
    selectCurrentDocument,
    updateDocument,
    saveDocument,
  },
};
