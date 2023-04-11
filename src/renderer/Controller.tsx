/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import bindDOMEvents from './domEvents';

enum Status {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

function Controller() {
  const [status, setStatus] = useState<Status>(Status.CONNECTING);

  const ref = useRef<HTMLVideoElement>(null);

  const handleControl = () => {
    setStatus(Status.CONNECTED);
  };

  useEffect(() => {
    window.electron.startControlling();

    // window.electron.emitterOn('control-ready', handleControl);

    // return () => {
    //   window.electron.emmiterOff('control-ready', handleControl);
    // };
    setStatus(Status.CONNECTED);
  }, []);

  useEffect(() => {
    if (status === Status.CONNECTED) {
      bindDOMEvents(ref.current!);
    }
  }, [status]);

  return status === Status.CONNECTING ? (
    <div className="mainContainer">
      <Spin size="large">
        <div className="content" />
      </Spin>
    </div>
  ) : (
    <video id="video" ref={ref} />
  );
}

export default Controller;
