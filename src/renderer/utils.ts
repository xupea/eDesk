function throttle(fn, threshold, scope) {
  let timer;
  let prev = Date.now();
  return function () {
    let context = scope || this;
    const args = arguments;
    const [event, type] = args;
    let now = Date.now();
    if (now - prev > threshold || type === 6) {
      prev = now;
      fn.apply(context, args);
    }
  };
}

export { throttle };
