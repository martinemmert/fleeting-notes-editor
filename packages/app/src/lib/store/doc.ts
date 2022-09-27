import { Node } from "prosemirror-model";
import { pbClient } from "../api/pb-client";
import SessionStore from "../../lib/store/session";
import { createStore } from "solid-js/store";
import { Record } from "pocketbase";
import EmptyDoc from "./empty-doc.json";

type Store = {
  data?: {
    id: string;
    title: string;
    owner: string;
    content: Node | null;
  };
  isReady: boolean;
  isSyncing: boolean;
  lastUpdate: number;
};

const [store, setState] = createStore<Store>({
  isReady: false,
  isSyncing: false,
  lastUpdate: 0,
});

function setDocument(response: Record) {
  setState({
    data: {
      id: response.id,
      title: response.title,
      owner: response.owner,
      content: response.content,
    },
  });
}

async function initialize() {
  if (store.isReady) {
    console.log("DocumentStore already initialized");
  }

  const response = await pbClient().records.getList("documents");

  if (response.items.length === 0) {
    // create a new document and store it
    await create();
  } else {
    const record = response.items[0];
    setDocument(record);
  }

  await setState({ isReady: true });
}

async function create() {
  const userId = SessionStore.currentUserId;

  if (!userId) throw new Error("Not authenticated!");

  const response = await pbClient().records.create("documents", {
    owner: userId,
    title: "main",
    content: EmptyDoc,
  });
  setDocument(response);
}

async function update(doc: Node) {
  // update local doc
  setState("data", "content", doc);

  // send update to server
  await pbClient().records.update("documents", store.data!.id, {
    content: doc,
  });

  setState({ isSyncing: false, lastUpdate: Date.now() });
}

export default {
  state: store,
  initialize,
  update,
};
