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

// 控制端创建 offer 给信令服务
const rtcPeerConnection = new RTCPeerConnection();

async function createOffer() {
  const offer = await rtcPeerConnection.createOffer({
    offerToReceiveAudio: false,
    offerToReceiveVideo: true,
  });

  await rtcPeerConnection.setLocalDescription(offer);

  const { localDescription } = rtcPeerConnection;

  ipcRenderer.send('forward', 'offer', {
    type: localDescription?.type,
    sdp: localDescription?.sdp,
  });
}

// step1
createOffer();

// step2
// 傀儡端发送过来的
ipcRenderer.on('answer', async (e, offer) => {
  await rtcPeerConnection.setRemoteDescription(offer);
});

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

// step3
rtcPeerConnection.addEventListener('icecandidate', (e) => {
  ipcRenderer.send('forward', 'control-candidate', { ...e.candidate });
});

// step4
rtcPeerConnection.addEventListener('track', (e) => {
  console.log('e', e);
  const videoElement = document.getElementById('video') as HTMLVideoElement;
  videoElement.srcObject = e.streams[0];
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play();
  });
});

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
