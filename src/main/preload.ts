// Disable no-unused-vars, broken for spread args
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import InviteeConnection from './connection/inviteeConnection';

const connection = new InviteeConnection();

connection.addEventListener('datachannelMessage', (event) => {
  const { type, data } = JSON.parse(event.data);
  ipcRenderer.send('robot', type, data);
});

async function getScreenStream() {
  const deviceId = await ipcRenderer.invoke('source');

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: deviceId,
        maxWidth: window.screen.width,
        maxHeight: window.screen.height,
      },
    },
  });
}

// step 1
ipcRenderer.on('offer', async (e, offer) => {
  const gumSteam = await getScreenStream();
  await connection.reply(offer, gumSteam);
});

// step 2
connection.addEventListener('createAnswer', (localDescription) => {
  ipcRenderer.send('forward', 'answer', localDescription);
});

// step 3
ipcRenderer.on('candidate', (e, candidates) => {
  console.log(candidates);
  connection.addIceCandidates(candidates);
});

// step 4
connection.addEventListener('icecandidates', (candidates) => {
  console.log(candidates);
  ipcRenderer.send('forward', 'puppet-candidate', candidates);
});

const electronHandler = {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
    send(channel: string, ...args: any[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(
      channel: string,
      // eslint-disable-next-line no-unused-vars
      listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) {
      ipcRenderer.on(channel, listener);
    },
    // eslint-disable-next-line no-unused-vars
    removeListener(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
