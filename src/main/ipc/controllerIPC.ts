import { ipcMain } from 'electron';
import {
  closeControllerWindow,
  createControlWindow,
} from '../windows/controllerWindow';
import { sendMainWindow } from '../windows/mainWindow';
import signal from '../signal';
import { MainIPCEvent, MainStatus } from '../../shared/types';

export default function controllerIPC() {
  // 主控端接收到傀儡端拒绝控制
  signal.on('control-deny', (data) => {
    sendMainWindow('control-state-change', data, MainStatus.CONTROL_DENY);
  });

  // 主控端接收到傀儡端同意控制
  signal.on('control-ready', (data) => {
    // 通知主窗口，控制端已经准备好
    sendMainWindow('control-state-change', data, MainStatus.CONTROLLING);
    // 创建控制窗口
    createControlWindow();
  });

  // 主控端发出控制请求
  ipcMain.on('control', async (event, data) => {
    const { status } = await signal.invoke<{ status: number }>(
      'control',
      data,
      'control'
    );

    // 当傀儡端忙碌
    if (status === 400003) {
      sendMainWindow('control-state-change', null, MainStatus.OPPONENT_BUSY);
    }
    // 当傀儡端不可用
    if (status === 400001 || status === 400002) {
      sendMainWindow(
        'control-state-change',
        null,
        MainStatus.OPPONENT_NOT_AVAILABLE
      );
    }
  });

  // 主控端取消控制请求
  ipcMain.on('control-cancel', async (event, data) => {
    signal.invoke('control-cancel', data, 'control-cancel-ack');
    sendMainWindow('control-state-change', null, MainStatus.CONTROL_END);
  });

  // 主控端窗口关闭
  ipcMain.on(MainIPCEvent.CONTROLLER_WINDOW_CLOSE, async () => {
    try {
      await signal.invoke('control-end', null);
    } finally {
      closeControllerWindow(true);
    }
  });
}
