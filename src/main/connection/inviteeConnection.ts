import { Connection, Direction } from './base';

class InviteeConnection extends Connection {
  constructor() {
    super();

    this.rtcPeerConnection = this.createPeerConnection();

    this.direction = Direction.Inbound;

    this.rtcPeerConnection.addEventListener(
      'datachannel',
      (event: RTCDataChannelEvent) => {
        event.channel.addEventListener(
          'message',
          (messageEvent: MessageEvent) => {
            console.log(messageEvent);
            this.emitter.emit('datachannelMessage', messageEvent);
          }
        );
      }
    );
  }

  public async reply(offer: RTCSessionDescriptionInit, stream: MediaStream) {
    // step 1
    // eslint-disable-next-line no-restricted-syntax
    for (const track of stream.getTracks()) {
      this.rtcPeerConnection!.addTrack(track, stream);
    }

    // step 2
    await this.rtcPeerConnection!.setRemoteDescription(offer);

    // step 3
    const answer = await this.createAnswer();
    await this.rtcPeerConnection!.setLocalDescription(answer);

    // step 4
    const { localDescription } = this.rtcPeerConnection!;
    this.emitter.emit('createAnswer', localDescription?.toJSON());
  }
}

export default InviteeConnection;
