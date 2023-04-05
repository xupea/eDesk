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
  // this is only supported in v22
  // return navigator.mediaDevices.getDisplayMedia({
  //   audio: false,
  //   video: {
  //     deviceId,
  //     width: {
  //       max: window.screen.width,
  //     },
  //     height: {
  //       max: window.screen.height,
  //     },
  //   },
  // });
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

const rtcPeerConnection = new RTCPeerConnection({
  iceServers: [
    {
      urls: 'stun:39.108.191.135:3478',
    },
    {
      urls: 'turn:39.108.191.135:3478',
      username: 'ninefingers',
      credential: 'youhavetoberealistic',
    },
  ],
});

rtcPeerConnection.addEventListener('datachannel', (event) => {
  event.channel.addEventListener('message', (messageEvent) => {
    const { type, data } = JSON.parse(messageEvent.data);
    ipcRenderer.send('robot', type, data);
  });
});

// step2
async function createAnswer(offer: RTCSessionDescriptionInit) {
  // step3
  rtcPeerConnection.addEventListener('icecandidate', (e) => {
    if (!e.candidate) {
      return;
    }

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
  });

  const gumSteam = await getScreenStream();
  // eslint-disable-next-line no-restricted-syntax
  for (const track of gumSteam.getTracks()) {
    rtcPeerConnection.addTrack(track, gumSteam);
  }

  await rtcPeerConnection.setRemoteDescription(offer);

  await rtcPeerConnection.setLocalDescription(
    await rtcPeerConnection.createAnswer()
  );

  const { localDescription } = rtcPeerConnection;

  ipcRenderer.send('forward', 'answer', {
    type: localDescription?.type,
    sdp: localDescription?.sdp,
  });
}

let candidates = [];

async function addCandidate(candidate) {
  if (!candidate || !candidate.type) {
    return;
  }

  candidates.push(candidate);

  if (
    rtcPeerConnection.remoteDescription &&
    rtcPeerConnection.remoteDescription.type
  ) {
    for (let i = 0; i < candidates.length; i++) {
      await rtcPeerConnection.addIceCandidate(
        new RTCIceCandidate(candidates[i])
      );
    }
    candidates = [];
  }
}

ipcRenderer.on('candidate', (e, candidate) => {
  addCandidate(candidate);
});

// step1
ipcRenderer.on('offer', (e, offer) => {
  createAnswer(offer);
});

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
