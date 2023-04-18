// Disable no-unused-vars, broken for spread args
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import InviteeConnection from '../connection/inviteeConnection';
import logger from '../../shared/logger';

const connection = new InviteeConnection();

function isRetinaDisplay() {
  if (window.matchMedia) {
    const mq = window.matchMedia(
      '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)'
    );
    return (mq && mq.matches) || window.devicePixelRatio > 1;
  }
  return false;
}

connection.addEventListener('datachannelMessage', (event) => {
  const { type, data } = JSON.parse(event.data);
  ipcRenderer.send('robot', type, {
    ...data,
    devicePixelRatio: isRetinaDisplay() ? window.devicePixelRatio : 1,
  });
});

async function getScreenStream() {
  const deviceId = await ipcRenderer.invoke('source');
  const displays = await ipcRenderer.invoke('getAllDisplays');
  const [mainDisplay] = displays;
  const {
    scaleFactor,
    size: { width, height },
  } = mainDisplay;

  const maxWidth = isRetinaDisplay() ? width * scaleFactor : width;
  const maxHeight = isRetinaDisplay() ? height * scaleFactor : height;

  console.log('invitee client: ', maxWidth, maxHeight, deviceId);

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: deviceId,
        maxWidth,
        maxHeight,
        minWidth: maxWidth,
        minHeight: maxHeight,
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
  logger.info('opponents candidates: ', candidates);
  connection.addIceCandidates(candidates);
});

// step 4
connection.addEventListener('icecandidates', (candidates) => {
  console.log('invitee client candidate: ', candidates);
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
