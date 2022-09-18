import { vi } from "vitest";
import { indexedDB } from "fake-indexeddb";

vi.stubGlobal("indexedDB", indexedDB);
