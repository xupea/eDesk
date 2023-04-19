import robot from 'robotjs';

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

interface MouseEventData {
  x: number;
  y: number;
  type: MouseEventType;
  devicePixelRatio: number;
}

function moveMouse(data: MouseEventData) {
  const { x, y, type, devicePixelRatio } = data;
  const [newX, newY] = [x / devicePixelRatio, y / devicePixelRatio];

  if (type === MouseEventType.CLICK) {
    robot.mouseClick('left');
  }

  if (type === MouseEventType.DBLCLICK) {
    robot.mouseClick('left', true);
  }

  if (type === MouseEventType.MOUSEMOVE) {
    robot.moveMouse(newX, newY);
  }

  if (type === MouseEventType.DRAGBEGIN) {
    robot.mouseToggle('down');
  }

  if (type === MouseEventType.DRAGMOVE) {
    robot.dragMouse(newX, newY);
  }

  if (type === MouseEventType.DRAGEND) {
    robot.mouseToggle('up');
  }
}

function typeString(data) {
  const { keyCode, isCompoundShift, isCompoundAlt, isCompoundCtrl } = data;
  const modifiers = [];
  if (isCompoundShift) {
    modifiers.push('shift');
  }
  if (isCompoundAlt) {
    modifiers.push('alt');
  }
  if (isCompoundCtrl) {
    modifiers.push('ctrl');
  }

  const parsedKey = keyCode.length > 1 ? keyCode.toLowerCase() : keyCode;

  robot.keyTap(parsedKey, modifiers);
}

export { moveMouse, typeString };
