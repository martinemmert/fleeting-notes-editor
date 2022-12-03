import { Transaction } from "prosemirror-state";

export function hasDocChanged(transactions: readonly Transaction[]) {
  let docChanged = false;

  for (const transaction of transactions) {
    if (transaction.docChanged) {
      docChanged = true;
      break;
    }
  }

  return docChanged;
}
