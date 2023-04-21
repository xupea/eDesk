import { ipcMain, desktopCapturer, screen } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';
import {
  closeControlWindow,
  createControlWindow,
  sendControlWindow,
} from './windows/slaveWindow';
import { sendMainWindow, showMainWindow } from './windows/masterWindow';
import signal from './signal';
import { moveMouse, typeString } from './robot';
import { MainStatus } from '../shared/types';

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
    showMainWindow();
    sendMainWindow(
      'control-state-change',
      data,
      MainStatus.REQUESTING_CONTROLLED
    );
  });

  // 傀儡端逻辑
  ipcMain.on('control-allow', async (event, data) => {
    signal.send('control-allow', data);
  });

  ipcMain.on('control-deny', async (event, data) => {
    signal.send('control-deny', data);
    sendMainWindow('control-state-change', null, MainStatus.LOGGED_IN);
  });

  // 主控端逻辑
  ipcMain.on('control', async (event, data) => {
    const { status } = await signal.invoke<{ status: string }>(
      'control',
      data,
      'control'
    );

    // 当傀儡端不可用
    if (status !== 'online') {
      sendMainWindow(
        'control-state-change',
        null,
        MainStatus.OPPONENT_NOT_AVAILABLE
      );
    }
  });

  // 主控端逻辑
  signal.on('control-ready', (data) => {
    // 通知主窗口，控制端已经准备好
    sendMainWindow('control-state-change', data, MainStatus.CONTROLLING);
    // 创建控制窗口
    createControlWindow();
  });

  // 主控端逻辑
  ipcMain.on('control-end', async (event, data) => {
    await signal.invoke('control-end', data, 'control-end');
  });

  signal.on('control-end', (data) => {
    sendMainWindow('control-state-change', data, MainStatus.CONTROL_END);
  });

  signal.on('control-deny', (data) => {
    sendMainWindow('control-state-change', data, MainStatus.CONTROL_DENY);
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
    const uuid = (store.get('uuid') as string) || uuidv4();
    store.set('uuid', uuid);

    await signal.connect(uuid);

    const { code } = await signal.invoke<{ code: number }>(
      'login',
      null,
      'logined'
    );
    return { code, uuid };
  });

  ipcMain.handle('source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id;
  });

  ipcMain.handle('getAllDisplays', async () => {
    const results = await screen.getAllDisplays();
    return results;
  });

  ipcMain.on('window-close', () => {
    closeControlWindow();
  });
}
