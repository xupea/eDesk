import { ElectronMainHandler } from 'main/windows/mainPreload';
import { ElectronControllerHandler } from 'main/windows/controllerPreload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electronMain: ElectronMainHandler;
    electronController: ElectronControllerHandler;
  }
}

export {};
