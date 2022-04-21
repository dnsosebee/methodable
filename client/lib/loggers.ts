// Abstractions over the console.log function,
// so that we can easily disable logging on a per-feature bases

export const logMouseEvent = (s: string) => {
  //console.log("Mouse Event Log: ",s);
};

export const logAction = (s: string) => {
  console.log("Action Log: ", s);
};

export const logKeyEvent = (s: string) => {
  //console.log("Key Event Log: ",s);
}