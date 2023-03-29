/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

let controlWindow: BrowserWindow | null = null;

const createControlWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  controlWindow = new BrowserWindow({
    show: false,
    width: 1280,
    height: 690,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preloadControl.js')
        : path.join(__dirname, '../../.erb/dll/preloadControl.js'),
    },
  });

  controlWindow.loadURL(`${resolveHtmlPath('index.html')}#/control`);

  controlWindow.on('ready-to-show', () => {
    if (!controlWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      controlWindow.minimize();
    } else {
      controlWindow.show();
    }
  });

  controlWindow.on('closed', () => {
    controlWindow = null;
  });

  const menuBuilder = new MenuBuilder(controlWindow);
  menuBuilder.buildMenu();
};

const sendControlWindow = async (channel: string, ...args: any[]) => {
  controlWindow?.webContents.send(channel, ...args);
};

export { createControlWindow, sendControlWindow };
