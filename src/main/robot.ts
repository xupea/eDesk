import robot from 'robotjs';

enum MouseEventType {
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

function moveMouse(data) {
  const { x, y, type } = data;

  if (type === MouseEventType.CLICK) {
    robot.mouseClick('left');
  }

  if (type === MouseEventType.DBLCLICK) {
    robot.mouseClick('left', true);
  }

  if (type === MouseEventType.MOUSEMOVE) {
    robot.moveMouse(x, y);
  }

  if (type === MouseEventType.DRAGBEGIN) {
    robot.mouseToggle('down');
  }

  if (type === MouseEventType.DRAGMOVE) {
    robot.dragMouse(x, y);
  }

  if (type === MouseEventType.DRAGEND) {
    robot.mouseToggle('up');
  }

  console.log('moveMouse', data);
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
