import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Input, Button, Modal } from 'antd';
import Controller from './Controller';
import 'antd/dist/reset.css';
import './App.css';

enum Status {
  LOGGING = 'logging',
  LOGGED = 'logged',
  BEING_CONTROLLED = 'being-controlled',
  CONTROLLING = 'controlling',
  ASK_CONTROL = 'ask-control',
}

const record = {
  [Status.LOGGING]: function logging() {
    return <div>logging</div>;
  },
  [Status.LOGGED]: function logged() {
    return null;
  },
  [Status.BEING_CONTROLLED]: function controlled() {
    return <div>Being controlled / Stop being controlled</div>;
  },
  [Status.CONTROLLING]: function controlling() {
    return <div>Controlling</div>;
  },
  [Status.ASK_CONTROL]: function controlling() {
    return <div>Somebody ask to control your desktop</div>;
  },
};

function Home() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [status, setStatus] = useState(Status.LOGGING);

  const login = async () => {
    setStatus(Status.LOGGING);
    const { code } = await window.electron.ipcRenderer.invoke('login');
    setLocalCode(`${code}`.padStart(9, '0'));
    setStatus(Status.LOGGED);
  };

  const startControl = (code: string) => {
    if (localCode === code) {
      Modal.warning({
        title: '识别码',
        content: '不能连接本机识别码',
        maskClosable: true,
      });
      return;
    }

    setStatus(Status.CONTROLLING);

    window.electron.ipcRenderer.send('control', {
      from: parseInt(localCode, 10),
      to: parseInt(code, 10),
    });
  };

  const handleControlState = (e: any, name: string, type: number) => {
    // let text = '';
    if (type === 1) {
      // text = `正在远程控制${name}`;
      setStatus(Status.CONTROLLING);
    } else if (type === 2) {
      // text = `被${name}控制中`;
      setStatus(Status.BEING_CONTROLLED);
    } else if (type === 3) {
      // text = `连接已断开`;
      setStatus(Status.LOGGED);
      window.electron.ipcRenderer.send('control-end');
    } else if (type === 4) {
      // 不在线不可用
      setStatus(Status.LOGGED);
      Modal.warning({
        title: '识别码',
        content: '识别码不存在或不在线',
        maskClosable: true,
      });
    } else if (type === 5) {
      // 请求控制
      Modal.confirm({
        title: 'Warning',
        content: 'Somebody ask to control your desktop',
        okText: 'Yes',
        cancelText: 'No',
        onOk: () => {
          window.electron.ipcRenderer.send('control-allow', {
            from: parseInt(localCode, 10),
            to: parseInt(remoteCode, 10),
          });
        },
      });
    }
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
    <div className="mainContainer">
      {record[status]() || (
        <div>
          <div>本设备识别码</div>
          <div className="code">{localCode}</div>
          <div className="connect">
            <Input
              placeholder="请输入伙伴识别码"
              onChange={(e) => setRemoteCode(e.target.value)}
              onPressEnter={() => startControl(remoteCode)}
              allowClear
            />
            <Button type="primary" onClick={() => startControl(remoteCode)}>
              连接
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/control" element={<Controller />} />
      </Routes>
    </Router>
  );
}
