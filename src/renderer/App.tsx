import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Input, Button } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

function Hello() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [controlText, setControlText] = useState('');

  const login = async () => {
    const code = await window.electron.ipcRenderer.invoke('login');
    setLocalCode(code);
  };

  const startControl = (code: string) => {
    window.electron.ipcRenderer.send('control', code);
  };

  const handleControlState = (e: any, name: string, type: number) => {
    let text = '';

    if (type === 1) {
      text = `正在远程控制${name}`;
    } else if (type === 2) {
      text = `被${name}控制中`;
    }

    setControlText(text);
  };

  useEffect(() => {
    login();

    window.electron.ipcRenderer.on('control-state-change', handleControlState);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'control-state-change',
        handleControlState
      );
    };
  }, []);

  return (
    <div>
      <div>{controlText}</div>
      <div>本设备识别码</div>
      <div>{localCode}</div>
      <Input
        placeholder="请输入伙伴识别码"
        onChange={(e) => setRemoteCode(e.target.value)}
      />
      <Button type="primary" onClick={() => startControl(remoteCode)}>
        连接
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
