import { ipcMain, desktopCapturer } from 'electron';
import { createControlWindow, sendControlWindow } from './controlWindow';
import { sendMainWindow } from './mainWindow';
import signal from './signal';

export default async function ipc() {
  ipcMain.on('control', async (event, remote: string) => {
    sendMainWindow('control-state-change', 'data.remote', 1);
    createControlWindow();
    // signal.send('control', { remote });
  });

  signal.on('controlled', (data) => {
    sendMainWindow('control-state-change', data.remote, 1);
    createControlWindow();
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
    await signal.connect(data);
    const { code } = await signal.invoke('login', null, 'logined');
    return code;
  });

  ipcMain.handle('source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id;
  });

  // 转发
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });
}
