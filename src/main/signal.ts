import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';
import logger from '../shared/logger';

class SignalEventEmitter extends EventEmitter {
  private socket: Socket;

  private isConnected = false;

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

  invoke<T>(event: string, data: any, answerEvent?: string) {
    return new Promise<T>((resolve, reject) => {
      this.send(event, data);

      if (!answerEvent) {
        resolve(null as T);
        return;
      }

      this.once(answerEvent, resolve);

      setTimeout(() => {
        reject(new Error('timeout error'));
      }, 1115000);
    });
  }

  connect(userName: string) {
    if (this.isConnected) {
      return Promise.resolve('already connected');
    }

    this.socket.auth = { userName };
    this.socket.connect();

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        this.isConnected = true;
        resolve('connected to server');
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
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
  try {
    const data = JSON.parse(message);
    signal.emit(data.event, data.data);
  } catch (error) {
    logger.error('signal message JSON.parse error: ', error);
  }
});

export default signal;
