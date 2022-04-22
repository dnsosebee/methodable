// random helpers

// just synchronously waits for a bit
export const wait = (ms: number) => {
  var start = Date.now(),
    now = start;
  while (now - start < ms) {
    now = Date.now();
  }
};
