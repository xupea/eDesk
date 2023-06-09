/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow } from 'electron';
import path from 'path';
import log from 'electron-log';
import { createMainWindow } from './windows/mainWindow';
import ipc from './ipc/ipc';
import { getParamsFromProtocol, getParamsFromArgs } from './util';
import mainIPC from './ipc/mainIPC';
import controllerIPC from './ipc/controllerIPC';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('rdc', process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient('rdc');
}

let mainWindow: BrowserWindow | null = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }

    // ipc
    if (commandLine) {
      const rdcURL = commandLine.pop();

      if (!rdcURL) {
        return;
      }

      const params = getParamsFromProtocol(rdcURL);

      if (params) {
        mainWindow?.webContents.send('rdc-protocol', params);
      }
    }
  });
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  app.quit();
});

app
  .whenReady()
  .then(async () => {
    log.info('App is ready', process.argv);
    const params = getParamsFromArgs();

    mainWindow = await createMainWindow(params?.sid);

    ipc();

    mainIPC();

    controllerIPC();

    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) {
        mainWindow = await createMainWindow();
      }
    });
  })
  .catch(console.log);
