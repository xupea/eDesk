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
  CONTEXTMENU,
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

  window.electronController.mouseEvent({
    type,
    x: data.offsetX,
    y: data.offsetY,
  });
}, 30);
/**
 * Handler for double click event
 */
const handleDoubleClick = (event: MouseEvent) => {
  clearTimeout(getState().preventTimer);
  setState({ preventClick: true });
  handleMouseEvent(event, MouseEventType.DBLCLICK);
};
/**
 * Handler for context menu event
 */
const handleContextMenu = (event: MouseEvent) => {
  handleMouseEvent(event, MouseEventType.CONTEXTMENU);
};
/**
 * Handler for mousedown event
 */
const handleMouseDown = (event: MouseEvent) => {
  setState({
    mouseDownX: event.x,
    mouseDownY: event.y,
  });

  handleMouseEvent(event, MouseEventType.DRAGBEGIN);
};
/**
 * Handler for mouseup event
 */
const handleMouseUp = (event: MouseEvent) => {
  setState({
    mouseUpX: event.x,
    mouseUpY: event.y,
  });

  handleMouseEvent(event, MouseEventType.DRAGEND);
};

const handleMouseMove = (event: MouseEvent) => {
  handleMouseEvent(event, MouseEventType.DRAGMOVE);
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

  window.electronController.keyEvent({
    keyCode: event.keyCode,
    isCompoundAlt: event.altKey,
    isCompoundShift: event.shiftKey,
    isCompoundCtrl: event.ctrlKey,
    isCompoundMeta: event.metaKey,
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
    dblclick: handleDoubleClick,
    contextmenu: handleContextMenu,
    mousedown: handleMouseDown,
    mouseup: handleMouseUp,
    mousemove: handleMouseMove,
    mouseleave: handleMouseLeave,
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
