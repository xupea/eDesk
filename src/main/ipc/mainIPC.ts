import { ipcMain } from 'electron';
import { MainIPCEvent, MainStatus } from '../../shared/types';
import { sendMainWindow } from '../windows/masterWindow';
import signal from '../signal';

export default function mainIPC() {
  // 傀儡端主动断开连接
  ipcMain.on(MainIPCEvent.STOP_BEING_CONTROLLED, (e, event, data) => {
    // 1. 通知主控端
    signal.invoke('control-end', data);
    // 2. 更新傀儡端界面
    sendMainWindow(
      'control-state-change',
      data,
      MainStatus.STOP_BEING_CONTROLLED
    );
  });
}
