/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import { app, BrowserWindow } from 'electron';
import { MainStatus, SlaveStatus } from '../../shared/types';
import { resolveHtmlPath } from '../util';
import { sendMainWindow, showMainWindow } from './masterWindow';

let controlWindow: BrowserWindow | null = null;

const sendControlWindow = async (channel: string, ...args: any[]) => {
  controlWindow?.webContents.send(channel, ...args);
};

const createControlWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  controlWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 500,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'slavePreload.js')
        : path.join(__dirname, '../../../.erb/dll/slavePreload.js'),
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

  controlWindow.on('close', (event) => {
    event.preventDefault();

    sendControlWindow('control-state-change', null, SlaveStatus.WINDOW_CLOSE);
  });

  controlWindow.on('closed', () => {
    controlWindow = null;
  });
};

const closeControlWindow = () => {
  controlWindow?.destroy();
  showMainWindow();
  sendMainWindow('control-state-change', null, MainStatus.CONTROL_END);
};

export { createControlWindow, sendControlWindow, closeControlWindow };
