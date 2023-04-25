import { ipcMain, desktopCapturer, screen, app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';
import { sendControlWindow } from './windows/slaveWindow';
import { sendMainWindow } from './windows/masterWindow';
import signal from './signal';

import { MainStatus } from '../shared/types';

export default async function ipc() {
  // 转发
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });

  // 主控端逻辑
  ipcMain.on('control-end', async (event, data) => {
    await signal.invoke('control-end', data, 'control-end');
  });

  signal.on('control-end', (data) => {
    sendMainWindow('control-state-change', data, MainStatus.CONTROL_END);
    sendMainWindow('control-end', data);
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

  ipcMain.handle('app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id;
  });

  ipcMain.handle('getAllDisplays', async () => {
    const results = await screen.getAllDisplays();
    return results;
  });
}
