import PocketBase, { Record } from "pocketbase";
import { Node } from "prosemirror-model";
import { getCurrentUserId, pb } from "./api-client";
import EmptyDoc from "./empty-doc.json";
import { createStore, produce } from "solid-js/store";
import { createResource } from "solid-js";

declare class Document extends Record {
  id: string;
  owner: string;
  title: string;
  content: Node | null;
  hashtags: {
    [key: string]: string;
  };
}

type DocumentData = Partial<Pick<Document, "title" | "content" | "hashtags">>;

type DocumentStore = {
  isLoading: boolean;
  isSaving: boolean;
  isInitialized: boolean;
  currentDocument: Document | undefined;
  currentDocumentId: string | null;
  currentDocumentData: null | {
    doc: Object;
    hashtags: {
      [key: string]: string;
    };
  };
};

const [documents, documentsResource] = createResource<Document[], true>(
  async (_, { value, refetching }) => {
    if (!refetching) return value ?? [];
    return pb().collection("documents").getFullList<Document>();
  },
  {
    name: "DocumentsResource",
    initialValue: [],
  }
);

const [store, setState] = createStore<DocumentStore>({
  isLoading: false,
  isSaving: false,
  isInitialized: false,
  currentDocumentId: null,
  get currentDocument() {
    return documents()?.find((doc: Document) => doc.id === this.currentDocumentId);
  },
  get currentDocumentData() {
    return !this.currentDocument
      ? null
      : {
          title: this.currentDocument.title,
          doc: this.currentDocument.content,
          hashtags: this.currentDocument.hashtags,
        };
  },
});

//todo: add initial document here
async function initialize(pb: PocketBase, preselectedDocumentId?: string) {
  setState({ isLoading: true });

  await documentsResource.refetch();

  let mainDocument = documents()?.find((doc) => doc.title === "main");
  let preselectedDocument = documents()?.find((doc) => doc.id === preselectedDocumentId);

  mainDocument = mainDocument ?? preselectedDocument;

  if (!mainDocument) {
    mainDocument = await createDocument(pb, "main");
  }

  setState({
    currentDocumentId: mainDocument.id,
    isInitialized: true,
    isLoading: false,
  });
}

const selectCurrentDocument = (id: string) => {
  if (id === store.currentDocumentId) return false;
  if (!documents()?.find((doc) => doc.id === id)) return false;
  setState({ currentDocumentId: id });
  return true;
};

async function createDocument(pb: PocketBase, title: string) {
  const userId = getCurrentUserId();

  if (!userId) throw new Error("Not authenticated!");

  const document = await pb.collection("documents").create<Document>({
    owner: userId,
    title,
    content: EmptyDoc,
    hashtags: {},
  });

  await documentsResource.refetch();

  return document;
}

const updateDocument = (id: string, data: DocumentData) => {
  documentsResource.mutate((prev) => {
    return prev.map((doc) => {
      if (doc.id === id) {
        const newDoc = doc.clone() as Document;
        newDoc.load({ ...newDoc, ...data });
        return newDoc;
      }
      return doc;
    });
  });
};

async function saveDocument(pb: PocketBase, id: string, data: DocumentData) {
  setState({ isSaving: true });

  // send update to server
  const updatedRecord = await pb.collection("documents").update<Document>(id, data);

  // console.log(updatedRecord);
  updateDocument(updatedRecord.id, updatedRecord);
  setState(
    produce((state) => {
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
    documents: documents,
  },
  actions: {
    initialize,
    selectCurrentDocument,
    createDocument,
    updateDocument,
    saveDocument,
  },
};
