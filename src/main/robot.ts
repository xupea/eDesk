import path from 'path';
import { spawn } from 'child_process';
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

let robotjsProcess: any;

function createRobotjsProcess() {
  if (!robotjsProcess) {
    const robotjsBinary = path.join(__dirname, '../../assets', 'robotjs');
    robotjsProcess = spawn(robotjsBinary);
    robotjsProcess.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
    });
  }
}

function sendAction(action: string) {
  robotjsProcess.stdin.write(`${action}\n`);
}

function mouseAction(data: MouseEventData) {
  const { x, y, type, devicePixelRatio } = data;
  const [newX, newY] = [x / devicePixelRatio, y / devicePixelRatio];

  let action = '';
  let params = '';

  if (type === MouseEventType.DBLCLICK) {
    action = 'mouseClick';
    params = ['left', true].join(',');
  }

  if (type === MouseEventType.CONTEXTMENU) {
    action = 'mouseClick';
    params = 'right';
  }

  if (type === MouseEventType.MOUSEMOVE) {
    action = 'moveMouse';
    params = [newX, newY].join(',');
  }

  if (type === MouseEventType.DRAGBEGIN) {
    action = 'mouseToggle';
    params = 'down';
  }

  if (type === MouseEventType.DRAGMOVE) {
    action = 'dragMouse';
    params = [newX, newY].join(',');
  }

  if (type === MouseEventType.DRAGEND) {
    action = 'mouseToggle';
    params = 'up';
  }

  const allParams = [action, params].filter(Boolean).join(' ');

  console.log('allParams: ', allParams);

  sendAction(allParams);
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

function keyboardAction(data: any) {
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

  const params = [parsedKey, ...modifiers].filter(Boolean).join(',');
  const allParams = ['keyTap', params].filter(Boolean).join(' ');

  sendAction(allParams);
}

export { mouseAction, keyboardAction, createRobotjsProcess };
