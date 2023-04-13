import { Connection, Direction } from './base';

class InviterConnection extends Connection {
  constructor() {
    super();

    this.rtcPeerConnection = this.createPeerConnection();
    this.dataChannel = this.createDataChannel('robotchannel');

    this.direction = Direction.Outbound;
  }

  public async initiate() {
    let offer: RTCSessionDescriptionInit | null = null;

    // step 1
    offer = await this.createOffer();

    // step 2
    await this.rtcPeerConnection!.setLocalDescription(offer);

    // step 3
    const { localDescription } = this.rtcPeerConnection!;
    this.emitter.emit('createOffer', localDescription?.toJSON());
  }

  public setRemoteDescription(description: RTCSessionDescriptionInit) {
    this.rtcPeerConnection!.setRemoteDescription(description);
  }

  public sendData(data: string) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(data);
    }
  }
}

export default InviterConnection;
