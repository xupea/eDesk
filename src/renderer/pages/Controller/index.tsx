/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import CircleLoading from 'renderer/components/CircleLoading';
import { MainIPCEvent } from 'shared/types';
import bindDOMEvents from '../../domEvents';
import styles from './index.module.css';

export enum Status {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

function Controller() {
  const [status, setStatus] = useState<Status>(Status.CONNECTING);
  const [progress, setProgress] = useState(0);
  const [isAbnormalRatio, setIsAbnormalRatio] = useState(false);

  const ref = useRef<HTMLVideoElement>(null);

  const handleControl = () => {
    setProgress(30);

    setTimeout(() => {
      setStatus(Status.CONNECTED);
    }, 1000);
  };

  const handleControlState = (e: any, data: any, type: number) => {
    Modal.confirm({
      title: '提示',
      content: '确定是否要关闭控制',
      onOk: () => {
        e.sender.send(MainIPCEvent.CONTROLLER_WINDOW_CLOSE, data, type);
      },
      okText: '确定',
      cancelText: '取消',
    });
  };

  useEffect(() => {
    window.electron.startControlling();

    window.electron.emitterOn('control-ready', handleControl);

    window.addEventListener('resize', () => {
      const v = document.getElementById('video') as HTMLVideoElement;

      setIsAbnormalRatio(
        window.innerWidth / window.innerHeight < v.videoWidth / v.videoHeight
      );
    });

    setProgress(20);

    return () => {
      window.electron.emitterOff('control-ready', handleControl);
    };
  }, []);

  useEffect(() => {
    if (status === Status.CONNECTED) {
      bindDOMEvents(ref.current!);

      const v = document.getElementById('video') as HTMLVideoElement;

      setIsAbnormalRatio(
        window.innerWidth / window.innerHeight < v.videoWidth / v.videoHeight
      );
    }
  }, [status]);

  useEffect(() => {
    window.electron.ipcRenderer.on('control-state-change', handleControlState);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'control-state-change',
        handleControlState
      );
    };
  }, []);

  return (
    <div className={styles.container}>
      {status === Status.CONNECTING && (
        <div className={styles.connecting}>
          <CircleLoading progress={progress} />
          <div>正在建立远程连接...</div>
        </div>
      )}
      <video
        className={isAbnormalRatio ? styles.abnormalVideo : styles.video}
        id="video"
        ref={ref}
      />
    </div>
  );
}

export default Controller;
