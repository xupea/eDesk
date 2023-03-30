// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
};

async function getScreenStream() {
  const deviceId = await ipcRenderer.invoke('source');
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    // video: {
    //   deviceId,
    //   width: {
    //     max: window.screen.width,
    //   },
    //   height: {
    //     max: window.screen.height,
    //   },
    // },
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

// step2
async function createAnswer(offer: RTCSessionDescriptionInit) {
  const rtcPeerConnect = new RTCPeerConnection();

  // step3
  rtcPeerConnect.addEventListener('icecandidate', (e) => {
    console.log('preload, icecandidate', e)

    if (!e || !e.candidate) {
      return;
    }

    if (e instanceof RTCPeerConnectionIceEvent) {
      const {
        address,
        candidate,
        component,
        foundation,
        port,
        priority,
        protocol,
        relatedAddress,
        relatedPort,
        sdpMLineIndex,
        sdpMid,
        tcpType,
        type,
        usernameFragment,
      } = e.candidate;

      ipcRenderer.send('forward', 'puppet-candidate', {
        address,
        candidate,
        component,
        foundation,
        port,
        priority,
        protocol,
        relatedAddress,
        relatedPort,
        sdpMLineIndex,
        sdpMid,
        tcpType,
        type,
        usernameFragment,
      });
    } else {
      const {
        address,
        candidate,
        component,
        foundation,
        port,
        priority,
        protocol,
        relatedAddress,
        relatedPort,
        sdpMLineIndex,
        sdpMid,
        tcpType,
        type,
        usernameFragment,
      } = e;

      ipcRenderer.send('forward', 'puppet-candidate', {
        address,
        candidate,
        component,
        foundation,
        port,
        priority,
        protocol,
        relatedAddress,
        relatedPort,
        sdpMLineIndex,
        sdpMid,
        tcpType,
        type,
        usernameFragment,
      });
    }
  });

  const gumSteam = await getScreenStream();
  // eslint-disable-next-line no-restricted-syntax
  for (const track of gumSteam.getTracks()) {
    rtcPeerConnect.addTrack(track, gumSteam);
  }

  await rtcPeerConnect.setRemoteDescription(offer);

  await rtcPeerConnect.setLocalDescription(await rtcPeerConnect.createAnswer());

  const { localDescription } = rtcPeerConnect;

  ipcRenderer.send('forward', 'answer', {
    type: localDescription?.type,
    sdp: localDescription?.sdp,
  });
}

// step1
ipcRenderer.on('offer', (e, offer) => {
  createAnswer(offer);
});

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
