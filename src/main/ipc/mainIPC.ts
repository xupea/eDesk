import { app, desktopCapturer, ipcMain, screen } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import Store from 'electron-store';
import { MainIPCEvent, MainStatus } from '../../shared/types';
import {
  sendMainWindow,
  showMainWindow,
  closeMainWindow,
} from '../windows/mainWindow';
import signal from '../signal';
import { mouseAction, keyboardAction } from '../robot';

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
  ipcMain.on(MainIPCEvent.STOP_BEING_CONTROLLED, async (event, data) => {
    const { closeWindow } = data || {};
    // 1. 通知主控端
    try {
      await signal.invoke('control-end', data);
    } catch {
      // do nothing
    }

    // 2. 更新傀儡端界面
    sendMainWindow(
      'control-state-change',
      data,
      MainStatus.STOP_BEING_CONTROLLED
    );

    if (closeWindow) {
      closeMainWindow();
    }
  });
  // 傀儡端鼠标和键盘控制
  ipcMain.on('robot', (e, event, data) => {
    if (event === 'keyboard') {
      keyboardAction(data);
    }

    if (event === 'mouse') {
      console.log('mouse', data);
      mouseAction(data);
    }
  });
  // 主控端/傀儡端窗口关闭
  ipcMain.on(MainIPCEvent.MAIN_WINDOW_CLOSE, async () => {
    closeMainWindow();
  });
  // 转发主控端/傀儡端之间的消息
  ipcMain.on('forward', (e, event, data) => {
    signal.send('forward', { event, data });
  });
  // 登录
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
  // 获取版本号
  ipcMain.handle('app-version', () => {
    return app.getVersion();
  });
  // 获取桌面源 id
  ipcMain.handle('source', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id;
  });
  // 获取所有屏幕
  ipcMain.handle('getAllDisplays', async () => {
    const results = await screen.getAllDisplays();
    return results;
  });
}
