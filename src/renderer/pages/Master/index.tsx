import { useEffect, useState, ReactElement } from 'react';
import { Input, Button, Modal, message } from 'antd';
import cx from 'classnames';
import logger from 'shared/logger';
import ClientStatus from 'renderer/components/ClientStatus';
import { codeParser, codeFormatter, codePadding } from 'renderer/utils';
import { ConnectionStatus, MainStatus } from '../../../shared/types';
import styles from './index.module.css';

const record: Record<MainStatus, () => ReactElement | null> = {
  [MainStatus.UNLOGGED]: function unloged() {
    return null;
  },
  [MainStatus.LOGGING_IN]: function loggingIn() {
    return null;
  },
  [MainStatus.LOGGED_IN]: function loggedIn() {
    return null;
  },
  [MainStatus.LOGGED_FAILED]: function loggedIn() {
    return null;
  },
  [MainStatus.REQUESTING_CONTROLLED]: function controlEnd() {
    return null;
  },
  [MainStatus.CONTROL_END]: function controlEnd() {
    return null;
  },
  [MainStatus.CONTROL_DENY]: function controlDeny() {
    return null;
  },
  [MainStatus.OPPONENT_NOT_AVAILABLE]: function logged() {
    return null;
  },
  [MainStatus.CONTROLLING]: function controlling() {
    return (
      <div>
        <div>正在远程控制中...</div>
        <div>已控制 4 分钟</div>
      </div>
    );
  },
  [MainStatus.REQUESTING_CONTROLL]: function requestControlling() {
    return (
      <div className={styles.requestControl}>
        <div>正在等待对方同意...</div>
        <div>
          <Button type="primary">取消控制</Button>
        </div>
      </div>
    );
  },
  [MainStatus.BEING_CONTROLLED]: function controlled() {
    return (
      <div className={styles.requestControl}>
        <div>正在被远控中...</div>
        <div>
          <Button type="primary">断开连接</Button>
        </div>
      </div>
    );
  },
};

const statusConverter = (status: MainStatus) => {
  return status > MainStatus.LOGGED_FAILED
    ? ConnectionStatus.CONNECTED
    : (status as unknown as ConnectionStatus);
};

function Master() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('--- --- ---');
  const [status, setStatus] = useState(MainStatus.UNLOGGED);

  const login = async () => {
    logger.debug('login code runs');
    setStatus(MainStatus.LOGGING_IN);

    // machine code number
    const { code } = await window.electron.ipcRenderer.invoke('login');

    setLocalCode(codePadding(code));

    setStatus(MainStatus.LOGGED_IN);

    logger.debug('login code after');
  };

  const requestControl = (code: string) => {
    const parsedCode = codeParser(code);
    if (localCode === parsedCode || !parsedCode) {
      Modal.warning({
        title: '识别码',
        content: !code ? '识别码不能为空' : '请输入非本机识别码',
        maskClosable: true,
      });
      return;
    }

    setStatus(MainStatus.REQUESTING_CONTROLL);

    // to ipc
    window.electron.ipcRenderer.send('control', {
      from: parseInt(localCode, 10),
      to: parseInt(parsedCode, 10),
    });
  };

  const handleControlState = (e: any, data: any, type: number) => {
    if (type === MainStatus.CONTROLLING) {
      setStatus(MainStatus.CONTROLLING);
    } else if (type === MainStatus.BEING_CONTROLLED) {
      setStatus(MainStatus.BEING_CONTROLLED);
    } else if (type === MainStatus.CONTROL_DENY) {
      setStatus(MainStatus.CONTROL_DENY);
      message.warning('对方拒绝了你的控制请求');
    } else if (type === MainStatus.CONTROL_END) {
      setStatus(MainStatus.CONTROL_END);
    } else if (type === MainStatus.OPPONENT_NOT_AVAILABLE) {
      setStatus(MainStatus.OPPONENT_NOT_AVAILABLE);
      Modal.warning({
        title: '识别码',
        content: '识别码不存在或不在线',
        maskClosable: true,
      });
    } else if (type === MainStatus.REQUESTING_CONTROLLED) {
      Modal.confirm({
        title: '控制请求',
        content: `${codePadding(data.from)} 请求控制你的电脑`,
        okText: '同意',
        cancelText: '拒绝',
        onOk: () => {
          window.electron.ipcRenderer.send('control-allow', {
            from: parseInt(localCode, 10),
            to: parseInt(remoteCode, 10),
          });
          setStatus(MainStatus.BEING_CONTROLLED);
        },
        onCancel: () => {
          window.electron.ipcRenderer.send('control-deny', {
            from: parseInt(localCode, 10),
            to: parseInt(remoteCode, 10),
          });
        },
      });
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    const parsedValue = codeParser(value);
    // if (parsedValue === remoteCode) {
    //   return;
    // }
    setRemoteCode(codeFormatter(parsedValue));
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
    <div className={styles.container}>
      {record[status]() || (
        <div className={styles.main}>
          <div className={styles.left}>
            <div className={cx(styles.primaryText, styles.title)}>
              允许控制本机
            </div>
            <div className={cx(styles.secondaryText, styles.label)}>
              本设备识别码
            </div>
            <div
              className={cx(
                styles.primaryText,
                styles.title,
                styles.inputHeight
              )}
            >
              {codeFormatter(localCode)}
            </div>
            <Button
              type="primary"
              onClick={() => {
                navigator.clipboard.writeText(localCode);
                message.success('已复制');
              }}
            >
              复制识别码
            </Button>
          </div>
          <div className={styles.middle} />
          <div className={styles.right}>
            <div className={cx(styles.primaryText, styles.title)}>
              控制远程设备
            </div>
            <div className={cx(styles.secondaryText, styles.label)}>
              伙伴识别码
            </div>
            <Input
              placeholder="输入识别码，远程伙伴"
              onChange={handleInputChange}
              onPressEnter={() => requestControl(remoteCode)}
              value={codeFormatter(remoteCode)}
              allowClear
              className={styles.input}
              maxLength={11}
            />
            <Button
              disabled={!remoteCode}
              type="primary"
              onClick={() => requestControl(remoteCode)}
            >
              远程协助
            </Button>
          </div>
        </div>
      )}
      <div className={styles.secureConnection}>
        <ClientStatus status={statusConverter(status)} />
        <div className={styles.version}>v0.0.0-alpha.1</div>
      </div>
    </div>
  );
}

export default Master;
