export const BLOCK_TYPES = {
  DO: Symbol("DO"),
  CHOOSE: Symbol("CHOOSE"),
  READ: Symbol("READ"),
  REFERENCE: Symbol("REFERENCE"),
};

export const OPTIONAL_BLOCK_TYPES = { ...BLOCK_TYPES, UNDEFINED: Symbol("UNDEFINED") };

export function blockType(name: symbol) {
  const blockTypesList = [
    BLOCK_TYPES.DO,
    BLOCK_TYPES.CHOOSE,
    BLOCK_TYPES.READ,
    BLOCK_TYPES.REFERENCE,
  ];

  function getNext() {
    if (blockTypesList.indexOf(name) === -1) {
      throw new Error(`Block type has no successor: ${String(name)}`);
    }
    const nextIndex = (blockTypesList.indexOf(name) + 1) % blockTypesList.length;
    return blockType(blockTypesList[nextIndex]);
  }

  return Object.freeze({
    name,
    getNext,
  });
}

export interface IBlockType {
  name: symbol;
  getNext: () => IBlockType;
}
