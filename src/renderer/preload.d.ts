import { ElectronHandler } from 'main/windows/slavePreload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
  }
}

export {};
