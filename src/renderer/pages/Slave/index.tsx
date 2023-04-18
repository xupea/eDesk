/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState } from 'react';
import CircleLoading from 'renderer/components/CircleLoading';
import bindDOMEvents from '../../domEvents';
import styles from './index.module.css';

export enum Status {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

function Controller() {
  const [status, setStatus] = useState<Status>(Status.CONNECTING);
  const [progress, setProgress] = useState(0);

  const ref = useRef<HTMLVideoElement>(null);

  const handleControl = () => {
    setProgress(30);

    setTimeout(() => {
      setStatus(Status.CONNECTED);
    }, 1000);
  };

  useEffect(() => {
    window.electron.startControlling();

    window.electron.emitterOn('control-ready', handleControl);

    setProgress(20);

    return () => {
      window.electron.emitterOff('control-ready', handleControl);
    };
  }, []);

  useEffect(() => {
    if (status === Status.CONNECTED) {
      bindDOMEvents(ref.current!);
    }
  }, [status]);

  return (
    <div className={styles.container}>
      {status === Status.CONNECTING && (
        <div className={styles.connecting}>
          <CircleLoading progress={progress} />
          <div>正在建立远程连接...</div>
        </div>
      )}
      <video id="video" ref={ref} />
    </div>
  );
}

export default Controller;
