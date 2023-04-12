import { EventEmitter } from 'events';

interface EventMap {
  createOffer: RTCSessionDescriptionInit;
  createAnswer: RTCSessionDescriptionInit;
  icecandidates: RTCIceCandidate[];
  datachannelMessage: MessageEvent;
  onTrack: RTCTrackEvent;
}

// eslint-disable-next-line no-shadow
export enum Direction {
  // eslint-disable-next-line no-unused-vars
  Inbound = 'inbound',
  // eslint-disable-next-line no-unused-vars
  Outbound = 'outbound',
}

export class Connection {
  private readonly forceTURN?: boolean;

  /**
   * 待发送的 candidate 数组
   */
  private candidateSendQueue: RTCIceCandidate[] = [];

  private candidateEnded = false;

  protected makingOffer = false;

  protected responsePromiseChain?: Promise<void>;

  public emitter = new EventEmitter();

  public rtcPeerConnection?: RTCPeerConnection;

  public dataChannel?: RTCDataChannel;

  public direction?: Direction;

  constructor(forceTURN?: boolean) {
    this.forceTURN = forceTURN ?? false;
  }

  protected createPeerConnection() {
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
      iceTransportPolicy: this.forceTURN ? 'relay' : undefined,
    });

    rtcPeerConnection.addEventListener('connectionstatechange', () => {});
    rtcPeerConnection.addEventListener('signalingstatechange', () => {});
    rtcPeerConnection.addEventListener(
      'icecandidate',
      this.gotLocalIceCandidate
    );
    rtcPeerConnection.addEventListener('icegatheringstatechange', () => {});
    rtcPeerConnection.addEventListener('track', this.onTrack);
    rtcPeerConnection.addEventListener('negotiationneeded', () => {});

    return rtcPeerConnection;
  }

  async createOffer() {
    const offer = await this.rtcPeerConnection!.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: true,
    });

    return offer;
  }

  async createAnswer() {
    const answer = await this.rtcPeerConnection!.createAnswer();

    return answer;
  }

  createDataChannel(label: string) {
    const dataChannel = this.rtcPeerConnection!.createDataChannel(label, {
      ordered: false,
    });

    return dataChannel;
  }

  private gotLocalIceCandidate = (event: RTCPeerConnectionIceEvent): void => {
    const { candidate } = event;

    if (candidate) {
      // if (this.candidateEnded) {
      //   return;
      // }

      this.queueCandidate(candidate);
    } else {
      this.queueCandidate(null);

      this.sendCandidateQueue();
    }
  };

  private onTrack = (event: RTCTrackEvent): void => {
    this.emitter.emit('onTrack', event);
  };

  private queueCandidate(candidate: RTCIceCandidate | null) {
    if (candidate) {
      this.candidateSendQueue.push(candidate);
    } else {
      this.candidateEnded = true;
    }

    // const delay = this.direction === Direction.Inbound ? 500 : 2000;

    // setTimeout(() => {
    //   this.sendCandidateQueue();
    // }, delay);
  }

  async sendCandidateQueue() {
    if (this.candidateSendQueue.length === 0) {
      return;
    }

    const candidates = this.candidateSendQueue;
    this.candidateSendQueue = [];

    const content = candidates.map((candidate) => candidate.toJSON());

    // if (this.candidateEnded) {
    //   content.push({
    //     candidate: '',
    //   });
    // }

    this.emitter.emit('icecandidates', content);
  }

  async addIceCandidates(candidates: RTCIceCandidate[]) {
    const results = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const candidate of candidates) {
      results.push(
        this.rtcPeerConnection!.addIceCandidate(new RTCIceCandidate(candidate))
      );
    }

    await Promise.all(results);
  }

  addEventListener<K extends keyof EventMap>(
    type: K,
    // eslint-disable-next-line no-unused-vars
    listener: (this: Connection, ev: EventMap[K]) => any
  ) {
    this.emitter.on(type, listener);
  }
}
