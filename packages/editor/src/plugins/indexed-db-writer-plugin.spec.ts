import { describe, expect, it, vi } from "vitest";
import { createEditorState } from "../editor-state";
import { IndexedDBWriterPlugin, openDBConnection } from "./indexed-db-writer.plugin";
import { indexedDB } from "fake-indexeddb";

vi.stubGlobal("indexedDB", indexedDB);

function awaitCallback(callback: Function, time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(callback());
      } catch (e) {
        reject(e);
      }
    }, time);
  });
}

describe("indexed-db-writer-plugin", () => {
  it("should add meta data to the editors state when the connection is open", async () => {
    let state = createEditorState();

    openDBConnection(state, (tr) => (state = state.apply(tr)));

    await awaitCallback(() => {
      const pluginState = IndexedDBWriterPlugin.getState(state);
      expect(pluginState.connectionOpen).toBeTruthy();
    }, 100);
  });
});
