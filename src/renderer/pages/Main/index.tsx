import { useEffect, useState, ReactElement } from 'react';
import { Input, Button, Modal, message } from 'antd';
import cx from 'classnames';
import logger from 'shared/logger';
import useVersion from 'renderer/hooks/useVersion';
import ClientStatus from 'renderer/components/ClientStatus';
import { codeParser, codeFormatter, codePadding } from 'renderer/utils';
import { ConnectionStatus, MainIPCEvent, MainStatus } from 'shared/types';
import Controlling from 'renderer/components/Controlling';
import RequestControlling from 'renderer/components/RequestControlling';
import BeingControlled from 'renderer/components/BeingControlled';
import styles from './index.module.css';

const record: Record<Partial<MainStatus>, ReactElement> = {
  [MainStatus.CONTROLLING]: <Controlling />,
  [MainStatus.REQUESTING_CONTROL]: <RequestControlling />,
  [MainStatus.BEING_CONTROLLED]: <BeingControlled />,
};

const statusConverter = (status: MainStatus) => {
  return status > MainStatus.LOGGED_FAILED
    ? ConnectionStatus.CONNECTED
    : (status as unknown as ConnectionStatus);
};

function clearPrompt() {
  Modal.destroyAll();
  message.destroy();
}

function Main() {
  const [remoteCode, setRemoteCode] = useState('');
  const [localCode, setLocalCode] = useState('--- --- ---');
  const [status, setStatus] = useState(MainStatus.UNLOGGED);

  const [appVersion] = useVersion();

  const login = async () => {
    logger.debug('login code runs');
    setStatus(MainStatus.LOGGING_IN);

    try {
      // machine code number
      const { code } = await window.electronMain.ipcRenderer.invoke('login');

      setLocalCode(codePadding(code));

      setStatus(MainStatus.LOGGED_IN);

      logger.debug('login code after');
    } catch (error) {
      logger.error('login', error);
      setStatus(MainStatus.LOGGED_FAILED);
    }
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

    setStatus(MainStatus.REQUESTING_CONTROL);

    // to ipc
    window.electronMain.ipcRenderer.send('control', {
      from: parseInt(localCode, 10),
      to: parseInt(parsedCode, 10),
    });
  };

  const handleControlState = (e: any, data: any, type: number) => {
    logger.debug('handleControlState', data, type);
    if (type === MainStatus.CONTROLLING) {
      setStatus(MainStatus.CONTROLLING);
    } else if (type === MainStatus.CONTROL_CANCEL) {
      setStatus(MainStatus.CONTROL_CANCEL);
      Modal.destroyAll();
      message.info('对方取消了控制请求');
    } else if (type === MainStatus.BEING_CONTROLLED) {
      setStatus(MainStatus.BEING_CONTROLLED);
    } else if (type === MainStatus.CONTROL_DENY) {
      setStatus(MainStatus.CONTROL_DENY);
      message.warning('对方拒绝了你的控制请求');
    } else if (type === MainStatus.CONTROL_END) {
      clearPrompt();
      setStatus(MainStatus.CONTROL_END);
    } else if (type === MainStatus.STOP_BEING_CONTROLLED) {
      setStatus(MainStatus.STOP_BEING_CONTROLLED);
    } else if (type === MainStatus.OPPONENT_NOT_AVAILABLE) {
      setStatus(MainStatus.OPPONENT_NOT_AVAILABLE);
      Modal.warning({
        title: '识别码',
        content: '识别码不存在或不在线',
        maskClosable: true,
      });
    } else if (type === MainStatus.OPPONENT_BUSY) {
      setStatus(MainStatus.OPPONENT_BUSY);
      Modal.warning({
        title: '识别码',
        content: '对方正忙',
        maskClosable: true,
      });
    } else if (type === MainStatus.REQUESTING_CONTROLLED) {
      Modal.confirm({
        title: '控制请求',
        content: `${codePadding(data.from)} 请求控制你的电脑`,
        okText: '同意',
        cancelText: '拒绝',
        onOk: () => {
          window.electronMain.ipcRenderer.send('control-allow', {
            from: parseInt(localCode, 10),
            to: parseInt(remoteCode, 10),
          });
          setStatus(MainStatus.BEING_CONTROLLED);
        },
        onCancel: () => {
          window.electronMain.ipcRenderer.send('control-deny', {
            from: parseInt(localCode, 10),
            to: parseInt(remoteCode, 10),
          });
        },
      });
    } else if (type === MainStatus.WINDOW_CLOSE) {
      Modal.destroyAll();
      Modal.confirm({
        title: '提示',
        content: '确定是否要断开控制',
        onOk: () => {
          window.electronMain.ipcRenderer.send(MainIPCEvent.MAIN_WINDOW_CLOSE);
        },
        okText: '确定',
        cancelText: '取消',
      });
    }
  };

  const handleRDCProtocol = (e: any, data: any) => {
    const { sid } = data;
    if (sid) {
      setRemoteCode(sid);
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    const parsedValue = codeParser(value);

    setRemoteCode(codeFormatter(parsedValue));
  };

  useEffect(() => {
    logger.debug('start login and get machine code');

    login();

    window.electronMain.ipcRenderer.on(
      'control-state-change',
      handleControlState
    );

    return () => {
      window.electronMain.ipcRenderer.removeListener(
        'control-state-change',
        handleControlState
      );
    };
  }, []);

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const sid = queryParameters.get('sid');
    if (sid) {
      setRemoteCode(sid);
    }
  }, []);

  useEffect(() => {
    window.electronMain.ipcRenderer.on('rdc-protocol', handleRDCProtocol);

    return () =>
      window.electronMain.ipcRenderer.removeListener(
        'rdc-protocol',
        handleRDCProtocol
      );
  }, []);

  return (
    <div className={styles.container}>
      {record[status] || (
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
      <div className={styles.footer}>
        <ClientStatus status={statusConverter(status)} />
        <div className={styles.version}>v{appVersion}</div>
      </div>
    </div>
  );
}

export default Main;
