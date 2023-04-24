import robot from 'robotjs-ex';
import vkey from 'vkey';

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

  if (type === MouseEventType.CONTEXTMENU) {
    robot.mouseClick('right', true);
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

const isMac = process.platform === 'darwin';

const keyMap = {
  '<delete>': 'delete',
  '<backspace>': 'backspace',
  '<enter>': 'enter',
  '<tab>': 'tab',
  '<escape>': 'escape',
  '<up>': 'up',
  '<down>': 'down',
  '<left>': 'left',
  '<right>': 'right',
  '<page-up>': 'pageup',
  '<page-down>': 'pagedown',
  '<home>': 'home',
  '<end>': 'end',
  '<insert>': 'insert',
  '<space>': 'space',
  '<num-1>': '1',
  '<num-2>': '2',
  '<num-3>': '3',
  '<num-4>': '4',
  '<num-5>': '5',
  '<num-6>': '6',
  '<num-7>': '7',
  '<num-8>': '8',
  '<num-9>': '9',
  '<num-0>': '0',
  f1: 'f1',
  f2: 'f2',
  f3: 'f3',
  f4: 'f4',
  f5: 'f5',
  f6: 'f6',
  f7: 'f7',
  f8: 'f8',
  f9: 'f9',
  f10: 'f10',
  f11: 'f11',
  f12: 'f12',
};

function typeString(data) {
  const {
    keyCode,
    isCompoundShift,
    isCompoundAlt,
    isCompoundCtrl,
    isCompoundMeta,
  } = data;

  const modifiers = [];
  if (isCompoundShift) {
    modifiers.push('shift');
  }
  if (isCompoundAlt) {
    modifiers.push('alt');
  }
  if (isCompoundCtrl) {
    if (isMac) {
      modifiers.push('command');
    } else {
      modifiers.push('control');
    }
  }

  if (isCompoundMeta) {
    modifiers.push('command');
  }

  let parsedKey = vkey[keyCode].toLowerCase();

  if (parsedKey.length > 1) {
    parsedKey = keyMap[parsedKey];

    if (!parsedKey) {
      return;
    }
  }

  robot.keyTap(parsedKey, modifiers);
}

export { moveMouse, typeString };
