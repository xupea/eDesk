// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { EventEmitter } from 'events';
import InviterConnection from './connection/inviterConnection';

const connection = new InviterConnection();

connection.addEventListener('createOffer', (localDescription) => {
  ipcRenderer.send('forward', 'offer', localDescription);
});

connection.addEventListener('icecandidates', (candidates) => {
  console.log('invitor candidates: ', candidates);
  ipcRenderer.send('forward', 'control-candidate', candidates);
});

const emmiter = new EventEmitter();

connection.addEventListener('onTrack', (event) => {
  emmiter.emit('control-ready');
  const videoElement = document.getElementById('video') as HTMLVideoElement;
  [videoElement.srcObject] = event.streams;
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
  });
});

ipcRenderer.on('answer', (e, description) => {
  connection.setRemoteDescription(description);
});

ipcRenderer.on('control-end', () => {
  connection.close();
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
      listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) {
      ipcRenderer.on(channel, listener);
    },
    removeListener(channel: string, listener: (...args: any[]) => void) {
      ipcRenderer.removeListener(channel, listener);
    },
  },
  startControlling() {
    // step1
    connection.initiate();
  },
  emitterOn(event: string, listener: (...args: any[]) => void) {
    emmiter.on(event, listener);
  },
  emitterOff(event: string, listener: (...args: any[]) => void) {
    emmiter.off(event, listener);
  },
  mouseEvent(data: any) {
    connection.sendData(
      JSON.stringify({
        type: 'mouse',
        data,
      })
    );
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
