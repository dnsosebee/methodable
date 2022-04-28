export const BLOCK_TYPES = {
  INSTRUCTION: "instruction",
  QUESTION: "question",
  READING: "reading",
};

export function blockType(name: string) {
  const blockTypesList = [BLOCK_TYPES.INSTRUCTION, BLOCK_TYPES.QUESTION, BLOCK_TYPES.READING];
  if (blockTypesList.indexOf(name) === -1) {
    throw new Error(`Invalid block type: ${name}`);
  }

  function getNext() {
    const nextIndex = (blockTypesList.indexOf(name) + 1) % blockTypesList.length;
    return blockType(blockTypesList[nextIndex]);
  }

  return Object.freeze({
    name,
    getNext,
  });
}

export interface BlockType {
  name: string;
  getNext: () => BlockType;
}
