import { ipcMain, desktopCapturer } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { createControlWindow, sendControlWindow } from './controlWindow';
import { sendMainWindow } from './mainWindow';
import signal from './signal';
import { moveMouse, typeString } from './robot';

export default async function ipc() {
  ipcMain.on('control', async (event, data) => {
    const { status } = await signal.invoke('control', data, 'control');

    if (status !== 'online') {
      sendMainWindow('control-state-change', null, 4);
    } else {
      sendMainWindow('control-state-change', data.remote, 1);
      createControlWindow();
    }
  });

  signal.on('be-controlled', (data) => {
    sendMainWindow('control-state-change', data.remote, 2);
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

  ipcMain.handle('login', async (e, data) => {
    const uuid = uuidv4();
    await signal.connect(data || uuid);
    const { code } = await signal.invoke('login', null, 'logined');
    return { code, uuid };
  });

  ipcMain.handle('source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id;
  });

  // 转发
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });

  ipcMain.on('robot', (e, event, data) => {
    if (event === 'key') {
      typeString(data);
    }

    if (event === 'mouse') {
      moveMouse(data);
    }
  });
}
