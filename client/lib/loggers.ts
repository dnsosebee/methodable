// Abstractions over the console.log function,
// so that we can easily disable logging on a per-feature bases

const PAD_LENGTH = 20;

const rightPad = (str: string) => {
  while (str.length < PAD_LENGTH) {
    str += " ";
  }
  return str;
};

export const logMouseEvent = (s: string) => {
  // console.log(rightPad("Mouse Event Log: "),s);
};

export const logAction = (s: string) => {
  // console.log(rightPad("Action Log: "), s);
};

export const logKeyEvent = (s: string) => {
  // console.log(rightPad("Key Event Log: "), s);
};

export const logEditorEvent = (s: string) => {
  // console.log(rightPad("Editor Event Log: "), s);
};

export const logEffect = (s: string) => {
  console.log(rightPad("Effect Log: "), s);
};

export const logError = (s: string) => {
  console.log(rightPad("Error Log: "), s);
};