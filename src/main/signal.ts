import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

class SignalEventEmitter extends EventEmitter {
  public socket: Socket;

  constructor(socket: Socket) {
    super();
    this.socket = socket;
  }

  send(event: string, data: any) {
    this.socket.send(
      JSON.stringify({
        event,
        data,
      })
    );
  }

  invoke(event: string, data: any, answerEvent: string) {
    return new Promise((resolve, reject) => {
      this.send(event, data);

      this.once(answerEvent, resolve);

      setTimeout(() => {
        reject(new Error('timeout error'));
      }, 1115000);
    });
  }

  connect(userName: string) {
    this.socket.auth = { userName };
    this.socket.connect();

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        resolve('connected to server');
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });
    });
  }
}

const socket = io('wss://39.108.191.135', {
  rejectUnauthorized: false,
  autoConnect: false,
});

const signal = new SignalEventEmitter(socket);

socket.on('message', (message) => {
  let data = {};
  try {
    data = JSON.parse(message);
  } catch (error) {
    console.log(error);
  }
  signal.emit(data.event, data.data);
});

export default signal;
