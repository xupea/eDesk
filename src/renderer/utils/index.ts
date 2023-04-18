function throttle(method, wait, { leading = true, trailing = true } = {}) {
  let timeout;
  let result;
  let methodPrevious = 0;
  // 记录上次回调触发时间（每次都更新）
  let throttledPrevious = 0;
  let throttled = function (...args) {
    let context = this;
    return new Promise((resolve) => {
      let now = new Date().getTime();
      // 两次触发的间隔
      let interval = now - throttledPrevious;
      // 更新本次触发时间供下次使用
      throttledPrevious = now;
      // 更改条件，两次间隔时间大于wait且leading为false时也重置methodPrevious，实现禁止立即执行
      if (leading === false && (!methodPrevious || interval > wait)) {
        methodPrevious = now;
      }
      let remaining = wait - (now - methodPrevious);
      const [event, type] = args;
      if (remaining <= 0 || remaining > wait || type === 6) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        methodPrevious = now;
        result = method.apply(context, args);
        resolve(result);
        // 解除引用，防止内存泄漏
        if (!timeout) context = args = null;
      } else if (!timeout && trailing !== false) {
        timeout = setTimeout(() => {
          methodPrevious = leading === false ? 0 : new Date().getTime();
          timeout = null;
          result = method.apply(context, args);
          resolve(result);
          // 解除引用，防止内存泄漏
          if (!timeout) context = args = null;
        }, remaining);
      }
    });
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    methodPrevious = 0;
    timeout = null;
  };

  return throttled;
}

function codeParser(str: string) {
  return str.replace(/ /g, '');
}

function codeFormatter(str: string) {
  let newStr = codeParser(str);
  newStr = newStr.split('').reduce((acc, cur, index) => {
    if (index % 3 === 0) {
      acc += ` ${cur}`;
    } else {
      acc += cur;
    }
    return acc;
  }, '');
  return newStr.substring(1);
}

export { throttle, codeParser, codeFormatter };
