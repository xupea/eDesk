import { ipcMain } from 'electron';
import { MainIPCEvent, MainStatus } from '../../shared/types';
import {
  sendMainWindow,
  showMainWindow,
  closeMainWindow,
} from '../windows/mainWindow';
import signal from '../signal';
import { moveMouse, typeString } from '../robot';

export default function mainIPC() {
  // 傀儡端收到控制邀请
  signal.on('asking-control', (data) => {
    showMainWindow();
    sendMainWindow(
      'control-state-change',
      data,
      MainStatus.REQUESTING_CONTROLLED
    );
  });
  // 傀儡端收到取消控制请求
  signal.on('control-cancel-ack', (data) => {
    sendMainWindow('control-state-change', data, MainStatus.CONTROL_CANCEL);
  });
  // 傀儡端允许控制
  ipcMain.on('control-allow', async (event, data) => {
    signal.send('control-allow', data);
    // TODO: waiting for connection
  });
  // 傀儡端拒绝控制
  ipcMain.on('control-deny', async (event, data) => {
    signal.send('control-deny', data);
    sendMainWindow('control-state-change', null, MainStatus.CONTROL_END);
  });
  // 傀儡端主动断开连接
  ipcMain.on(MainIPCEvent.STOP_BEING_CONTROLLED, async (e, event, data) => {
    const { closeWindow } = data || {};
    // 1. 通知主控端
    await signal.invoke('control-end', data);

    if (closeWindow) {
      closeMainWindow();
      return;
    }

    // 2. 更新傀儡端界面
    sendMainWindow(
      'control-state-change',
      data,
      MainStatus.STOP_BEING_CONTROLLED
    );
  });
  // 傀儡端鼠标和键盘控制
  ipcMain.on('robot', (e, event, data) => {
    if (event === 'key') {
      typeString(data);
    }

    if (event === 'mouse') {
      moveMouse(data);
    }
  });
  // 傀儡端窗口关闭
  ipcMain.on('main-window-close', async () => {
    await signal.invoke('control-end', null);
    closeMainWindow();
  });
}
