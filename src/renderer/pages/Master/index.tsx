import { useEffect, useState, ReactElement } from 'react';
import { Input, Button, Modal } from 'antd';
import logger from 'shared/logger';
import { MainStatus } from '../../../shared/types';

const record: Record<MainStatus, () => ReactElement | null> = {
  [MainStatus.UNLOGGED]: function unloged() {
    return <div>未登录</div>;
  },
  [MainStatus.LOGGING_IN]: function loggingIn() {
    return <div>登录中</div>;
  },
  [MainStatus.LOGGED_IN]: function loggedIn() {
    return null;
  },
  [MainStatus.LOGGED_FAILED]: function loggedIn() {
    return <div>登录失败</div>;
  },
  [MainStatus.REQUESTING_CONTROLLED]: function controlEnd() {
    return null;
  },
  [MainStatus.CONTROLLING]: function controlling() {
    return (
      <div>
        <div>正在远程控制 000000001</div>
        <div>已控制 4 分钟</div>
      </div>
    );
  },
  [MainStatus.REQUESTING_CONTROLL]: function controlling() {
    return (
      <div className="requestControl">
        <div>正在发送控制请求</div>
        <div>
          <Button type="primary">取消</Button>
        </div>
      </div>
    );
  },
  [MainStatus.CONTROL_END]: function controlEnd() {
    return null;
  },
  [MainStatus.BEING_CONTROLLED]: function controlled() {
    return <div>正在被远控中</div>;
  },
  [MainStatus.OPPONENT_NOT_AVAILABLE]: function logged() {
    return null;
  },
};

function Home() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('');
  const [status, setStatus] = useState(MainStatus.UNLOGGED);

  const login = async () => {
    logger.debug('login code runs');
    setStatus(MainStatus.LOGGING_IN);

    // machine code number
    const { code } = await window.electron.ipcRenderer.invoke('login');

    setLocalCode(`${code}`.padStart(9, '0'));

    setStatus(MainStatus.LOGGED_IN);

    logger.debug('login code after');
  };

  const requestControl = (code: string) => {
    if (localCode === code || !code) {
      Modal.warning({
        title: '识别码',
        content: !code ? '识别码不能为空' : '不能连接本机识别码',
        maskClosable: true,
      });
      return;
    }

    setStatus(MainStatus.REQUESTING_CONTROLL);

    // to ipc
    window.electron.ipcRenderer.send('control', {
      from: parseInt(localCode, 10),
      to: parseInt(code, 10),
    });
  };

  const handleControlState = (e: any, name: string, type: number) => {
    if (type === MainStatus.CONTROLLING) {
      setStatus(MainStatus.CONTROLLING);
    } else if (type === MainStatus.BEING_CONTROLLED) {
      setStatus(MainStatus.BEING_CONTROLLED);
    } else if (type === MainStatus.CONTROL_END) {
      setStatus(MainStatus.CONTROL_END);
      window.electron.ipcRenderer.send('control-end');
    } else if (type === MainStatus.OPPONENT_NOT_AVAILABLE) {
      setStatus(MainStatus.LOGGED_IN);
      Modal.warning({
        title: '识别码',
        content: '识别码不存在或不在线',
        maskClosable: true,
      });
    } else if (type === MainStatus.REQUESTING_CONTROLLED) {
      Modal.confirm({
        title: '控制请求',
        content: '有人请求控制你的电脑',
        okText: '同意',
        cancelText: '拒绝',
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
    logger.debug('start login and get machine code');

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
          <div className="codeContainer">
            <div className="code">{localCode}</div>
            <Button onClick={() => navigator.clipboard.writeText(localCode)}>
              复制
            </Button>
          </div>
          <div>远程控制设备</div>
          <div className="connect">
            <Input
              placeholder="请输入伙伴识别码"
              onChange={(e) => setRemoteCode(e.target.value)}
              onPressEnter={() => requestControl(remoteCode)}
              allowClear
            />
            <Button type="primary" onClick={() => requestControl(remoteCode)}>
              连接
            </Button>
          </div>
        </div>
      )}
      <div className="secureConnection">已连接安全加密链路</div>
    </div>
  );
}

export default Home;
