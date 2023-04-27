import { useEffect } from 'react';

function Controlling() {
  // const [duration, setDuration] = useState(0);
  // const timer = useRef<number>();

  useEffect(() => {
    return () => {
      // clearInterval(timer.current);
      // window?.electron?.timerStop();
    };
  }, []);

  return (
    <div>
      <div>正在远程控制中...</div>
      {/* <div>已控制 {duration} 秒</div> */}
    </div>
  );
}

export default Controlling;
