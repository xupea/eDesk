import { ipcMain, desktopCapturer } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';
import { createControlWindow, sendControlWindow } from './controlWindow';
import { sendMainWindow, showMainWindow } from './mainWindow';
import signal from './signal';
import { moveMouse, typeString } from './robot';

export default async function ipc() {
  // 转发
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });

  // 鼠标和键盘控制
  ipcMain.on('robot', (e, event, data) => {
    if (event === 'key') {
      typeString(data);
    }

    if (event === 'mouse') {
      moveMouse(data);
    }
  });

  // 傀儡端逻辑
  signal.on('asking-control', (data) => {
    console.log('asking-control', data);
    // 提示用户是否接受控制
    sendMainWindow('control-state-change', null, 5);
  });

  // 傀儡端逻辑
  ipcMain.on('control-allow', async (event, data) => {
    signal.send('control-allow', data);
    showMainWindow();
    sendMainWindow('control-state-change', null, 2);
  });

  // 主控端逻辑
  ipcMain.on('control', async (event, data) => {
    const { status } = await signal.invoke('control', data, 'control');

    // 当傀儡端不可用
    if (status !== 'online') {
      sendMainWindow('control-state-change', null, 4);
    }
  });

  // 主控端逻辑
  signal.on('control-ready', (data) => {
    // 通知主窗口，控制端已经准备好
    sendMainWindow('control-state-change', data, 1);
    // 创建控制窗口
    createControlWindow();
  });

  signal.on('offer', (data) => {
    sendMainWindow('offer', data);
  });

  signal.on('answer', (data) => {
    sendControlWindow('answer', data);
  });

  signal.on('puppet-candidate', (data) => {
    sendControlWindow('candidate', data);
  });

  signal.on('control-candidate', (data) => {
    sendMainWindow('candidate', data);
  });

  ipcMain.handle('login', async () => {
    const store = new Store();
    const uuid = store.get('uuid') || uuidv4();
    store.set('uuid', uuid);
    await signal.connect(uuid);
    const { code } = await signal.invoke('login', null, 'logined');
    return { code, uuid };
  });

  ipcMain.handle('source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id;
  });
}
