import { ipcMain, desktopCapturer } from 'electron';
import { createControlWindow, sendControlWindow } from './controlWindow';
import { sendMainWindow } from './mainWindow';

export default function ipc() {
  ipcMain.on('control', async (event, remoteCode: string) => {
    sendMainWindow('control-state-change', remoteCode, 1);
    createControlWindow();
  });

  ipcMain.on('capture', async () => {
    desktopCapturer
      .getSources({ types: ['screen'] })
      .then(async (sources) => {
        // eslint-disable-next-line no-restricted-syntax, promise/always-return
        for (const source of sources) {
          if (source.name === 'Entire screen') {
            sendControlWindow('source', source.id);
            return;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  });

  ipcMain.handle('login', async () => {
    const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    return code;
  });
}
