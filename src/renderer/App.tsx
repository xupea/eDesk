/* eslint-disable jsx-a11y/media-has-caption */
import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Input, Button } from 'antd';
import 'antd/dist/reset.css';
import './App.css';

function Home() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [controlText, setControlText] = useState('');

  const [userName, setUserName] = useState('');

  const [isLogin, setIsLogin] = useState(false);

  const login = async () => {
    const code = await window.electron.ipcRenderer.invoke('login', userName);
    setLocalCode(code);
    setIsLogin(true);
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
    window.electron.ipcRenderer.on('control-state-change', handleControlState);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'control-state-change',
        handleControlState
      );
    };
  }, []);

  return (
    <div className="mainContainer">
      {isLogin ? (
        <div>
          <div>{controlText}</div>
          <div>本设备识别码</div>
          <div className="code">{localCode}</div>
          <div className="connect">
            <Input
              placeholder="请输入伙伴识别码"
              onChange={(e) => setRemoteCode(e.target.value)}
            />
            <Button type="primary" onClick={() => startControl(remoteCode)}>
              连接
            </Button>
          </div>
        </div>
      ) : (
        <div className="login">
          <Input
            placeholder="请输入用户名"
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button type="primary" onClick={() => login()}>
            登录
          </Button>
        </div>
      )}
    </div>
  );
}

function Control() {
  useEffect(() => {
    // window.electron.createOffer();
  }, []);

  return <video id="video" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/control" element={<Control />} />
      </Routes>
    </Router>
  );
}
