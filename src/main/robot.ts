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
  const { key, shiftKey, metaKey, altKey, ctrlKey } = data;
  const modifiers = [];
  if (shiftKey) {
    modifiers.push('shift');
  }
  if (metaKey) {
    modifiers.push('meta');
  }
  if (altKey) {
    modifiers.push('alt');
  }
  if (ctrlKey) {
    modifiers.push('ctrl');
  }

  const parsedKey = key.length > 1 ? key.toLowerCase() : key;

  robot.keyTap(parsedKey, modifiers);
}

export { moveMouse, typeString };
