/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import { app, BrowserWindow, Menu } from 'electron';
import { resolveHtmlPath } from '../util';
import { createRobotjsProcess } from '../robot';
import { MainStatus } from '../../shared/types';
import globalStatus from '../status';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-assembler');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

let mainWindow: BrowserWindow | null = null;

const sendMainWindow = async (channel: string, ...args: any[]) => {
  mainWindow?.webContents.send(channel, ...args);
};

const createMainWindow = async (sid?: string) => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 500,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'mainPreload.js')
        : path.join(__dirname, '../../../.erb/dll/mainPreload.js'),
    },
    maximizable: false,
    resizable: false,
  });

  mainWindow.loadURL(resolveHtmlPath(`index.html`));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', (event) => {
    if (globalStatus.isControlling) {
      event.preventDefault();
      sendMainWindow('control-state-change', null, MainStatus.WINDOW_CLOSE);
    } else {
      app.exit();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  Menu.setApplicationMenu(null);

  createRobotjsProcess();

  return mainWindow;
};

const showMainWindow = () => {
  mainWindow?.focus();
};

const closeMainWindow = () => {
  app.exit();
};

export { createMainWindow, sendMainWindow, showMainWindow, closeMainWindow };
