import { ipcMain } from 'electron';

export default function ipc() {
  ipcMain.on('control', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  ipcMain.handle('login', async () => {
    const code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    return code;
  });
}
