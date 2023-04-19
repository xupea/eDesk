import { throttle } from '../utils';
// import logger from '../../shared/logger';

const privateState: Record<string, any> = {};
function setState(newState: Record<string, any>) {
  Object.assign(privateState, newState);
}
function getState() {
  return privateState;
}

export enum MouseEventType {
  CLICK,
  DBLCLICK,
  MOUSEDOWN,
  MOUSEUP,
  MOUSEMOVE,
  MOUSELEAVE,
  DRAGBEGIN,
  DRAGMOVE,
  DRAGEND,
}

const handleMouseEvent = throttle((event: MouseEvent, type: MouseEventType) => {
  event.preventDefault();
  event.stopPropagation();

  const v = document.getElementById('video') as HTMLVideoElement;

  const { offsetX, offsetY } = event;

  const data = {
    offsetX: Math.floor((offsetX * v.videoWidth) / v.clientWidth),
    offsetY: Math.floor((offsetY * v.videoHeight) / v.clientHeight),
  };

  // logger.debug('mouse event, ', JSON.stringify({ type, data }));

  window.electron.mouseEvent({
    type,
    x: data.offsetX,
    y: data.offsetY,
  });
}, 30);
/**
 * Handler for click event
 */
const handleClick = (event: MouseEvent) => {
  const { mouseDownX, mouseDownY, mouseUpX, mouseUpY } = getState();

  setState({
    mouseDownX: undefined,
    mouseDownY: undefined,
    mouseUpX: undefined,
    mouseUpY: undefined,
  });

  if (mouseDownX !== mouseUpX && mouseDownY !== mouseUpY) {
    return;
  }

  const timer = setTimeout(() => {
    const { preventClick } = getState();

    if (!preventClick) {
      handleMouseEvent(event, MouseEventType.CLICK);
      setState({ preventClick: false });
    }
  }, 200);

  setState({ preventTimer: timer });
};
/**
 * Handler for double click event
 */
const handleDoubleClick = (event: MouseEvent) => {
  clearTimeout(getState().preventTimer);
  setState({ preventClick: true });
  handleMouseEvent(event, MouseEventType.DBLCLICK);
};
/**
 * Handler for mousedown event
 */
const handleMouseDown = (event: MouseEvent) => {
  setState({
    mouseDownX: event.x,
    mouseDownY: event.y,
  });
};
/**
 * Handler for mouseup event
 */
const handleMouseUp = (event: MouseEvent) => {
  setState({
    mouseUpX: event.x,
    mouseUpY: event.y,
  });

  const { mouseDownX, mouseDownY, mouseUpX, mouseUpY, isDragging } = getState();

  if (!isDragging) {
    return;
  }

  if (mouseDownX === mouseUpX && mouseDownY === mouseUpY) {
    return;
  }

  handleMouseEvent(event, MouseEventType.DRAGEND);
  setState({
    isDragging: false,
    mouseDownX: undefined,
    mouseDownY: undefined,
    mouseUpX: undefined,
    mouseUpY: undefined,
  });
};

const handleMouseMove = (event: MouseEvent) => {
  const { isDragging, mouseDownX, mouseDownY, mouseUpX, mouseUpY } = getState();

  if (
    !isDragging &&
    typeof mouseDownX === 'number' &&
    typeof mouseDownY === 'number' &&
    mouseUpX === undefined &&
    mouseUpY === undefined &&
    Math.abs(event.x - mouseDownX) > 0 &&
    Math.abs(event.y - mouseDownY) > 0
  ) {
    handleMouseEvent(event, MouseEventType.DRAGBEGIN);
    setState({ isDragging: true });
  }

  const { isDragging: isDraggingNew } = getState();

  handleMouseEvent(
    event,
    isDraggingNew ? MouseEventType.DRAGMOVE : MouseEventType.MOUSEMOVE
  );
};

const handleKeyupEvent = (event: KeyboardEvent) => {
  event.preventDefault();
  event.stopPropagation();

  const { isCompoundAlt, isCompoundShift, isCompoundCtrl, isCompoundMeta } =
    getState();

  if (isCompoundShift && event.key === 'Shift') {
    setState({ isCompoundShift: false });
    return;
  }

  if (isCompoundAlt && event.key === 'Alt') {
    setState({ isCompoundAlt: false });
    return;
  }

  if (isCompoundCtrl && event.key === 'Control') {
    setState({ isCompoundCtrl: false });
    return;
  }

  if (isCompoundMeta && event.key === 'Meta') {
    setState({ isCompoundMeta: false });
    return;
  }

  window.electron.keyEvent({
    keyCode: event.key,
    isCompoundAlt: event.altKey,
    isCompoundShift: event.shiftKey,
    isCompoundCtrl: event.ctrlKey,
  });
};

const handleKeydownEvent = (event: KeyboardEvent) => {
  event.preventDefault();
  event.stopPropagation();

  // if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
  //   return;
  // }

  if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
    setState({
      isCompoundAlt: event.altKey,
      isCompoundShift: event.shiftKey,
      isCompoundCtrl: event.ctrlKey,
      isCompoundMeta: event.metaKey,
    });
  }
};

const handleMouseLeave = (event: MouseEvent) => {
  console.log(event);
};

const defaultHandler = (event: Event) => event.preventDefault();

export default function bindDOMEvents(el: HTMLElement) {
  const events = {
    click: handleClick,
    mousedown: handleMouseDown,
    mouseup: handleMouseUp,
    mousemove: handleMouseMove,
    mouseleave: handleMouseLeave,
    dblclick: handleDoubleClick,
    dragover: defaultHandler,
    dragleave: defaultHandler,
    dragend: defaultHandler,
  };

  window.addEventListener('keydown', handleKeydownEvent);
  window.addEventListener('keyup', handleKeyupEvent);

  Object.keys(events).forEach((event) => {
    el.addEventListener(event, events[event]);
  });
}
