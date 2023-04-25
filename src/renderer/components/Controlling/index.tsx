import { useEffect, useState } from 'react';

function Controlling() {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    window.electron.timerStart();

    setInterval(() => {
      setDuration(window.electron.duration() as number);
    }, 1000);

    return () => window.electron.timerStop();
  }, []);

  return (
    <div>
      <div>正在远程控制中...</div>
      <div>已控制 {duration} 秒</div>
    </div>
  );
}

export default Controlling;
