let currentId = 0;

export function resetIdCounter() {
  currentId = 0;
}

export function getNextMockedId() {
  return `mock-id-${currentId + 1}`;
}

export function createMockIdString(id: number) {
  return `mock-id-${id}`;
}

export function nanoid() {
  return `mock-id-${++currentId}`;
}
