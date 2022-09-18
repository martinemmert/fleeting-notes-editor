import { Command, EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { Step } from "prosemirror-transform";
import { indexedDB } from "fake-indexeddb";

interface WriterState {
  unwrittenSteps: Step[];
  lastTimeWritten: number;
  connectionOpen: boolean;
  db: IDBDatabase | null;
}

interface WriterMeta {
  type: string;
  payload: any;
}

function processMeta(tr: Transaction, state: WriterState) {
  const meta = tr.getMeta(IndexedDBWriterPlugin) as WriterMeta | null;

  if (!meta) return state;

  const update = { ...state };

  switch (meta.type) {
    case "db-opened":
      update.connectionOpen = true;
      update.db = meta.payload;
      break;
  }

  return update;
}

function appendSteps(steps: Step[], state: WriterState) {
  return {
    ...state,
    unwrittenSteps: state.unwrittenSteps.concat(steps),
  };
}

function writeToDatabase(state: WriterState) {}

export const IndexedDBWriterPlugin = new PluginKey("indexed-db-writer");

export function createIndexedDBWriterPlugin() {
  return new Plugin<WriterState>({
    key: IndexedDBWriterPlugin,
    state: {
      init: () => ({
        unwrittenSteps: [],
        lastTimeWritten: 0,
        connectionOpen: false,
        db: null,
      }),
      apply: (tr, state) => {
        let update: WriterState;

        update = processMeta(tr, state);

        if (!tr.docChanged) return update;

        // update = appendSteps(tr.steps, state);
        //
        // if (Date.now() - state.lastTimeWritten < 100) {
        // }
        //
        return update;
      },
    },
  });
}

export const openDBConnection: Command = (state, dispatch) => {
  const currentState = IndexedDBWriterPlugin.getState(state);

  if (currentState.connectionOpen) return false;

  if (dispatch) {
    const tr = state.tr;

    const request = indexedDB.open("fleeting-notes", 1);

    request.onsuccess = () => {
      tr.setMeta(IndexedDBWriterPlugin, { type: "db-opened", payload: request.result });
      dispatch(tr);
    };
  }

  return true;
};
