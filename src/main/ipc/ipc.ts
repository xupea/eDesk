import { ipcMain } from 'electron';
import {
  closeControllerWindow,
  sendControlWindow,
} from '../windows/controllerWindow';
import { sendMainWindow } from '../windows/mainWindow';
import signal from '../signal';

export default async function ipc() {
  // 按钮关闭连接
  ipcMain.on('control-end', async (event, data) => {
    // 通知对方
    await signal.invoke('control-end', data);
  });
  // 对方关闭连接
  signal.on('control-end', (data) => {
    // close connection
    sendMainWindow('control-end', data);
    // close controller window
    closeControllerWindow(true);
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
}
