import { ipcMain } from 'electron';
import { closeControllerWindow } from '../windows/slaveWindow';
import signal from '../signal';

export default function controllerIPC() {
  // 主控端窗口关闭
  ipcMain.on('window-close', async () => {
    await signal.invoke('control-end', null);
    closeControllerWindow();
  });
}
