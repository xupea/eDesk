/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useRef } from 'react';
import bindDOMEvents from './domEvents';

function Controller() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    bindDOMEvents(ref!.current!);
  }, []);

  return <video id="video" ref={ref} />;
}

export default Controller;
