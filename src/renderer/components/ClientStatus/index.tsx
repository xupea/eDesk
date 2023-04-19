import React from 'react';
import cx from 'classnames';
import { ConnectionStatus } from 'shared/types';
import styles from './index.module.css';

interface Props {
  status: ConnectionStatus;
}

const statusMap = {
  [ConnectionStatus.DISCONNECTED]: function disconnected() {
    return '服务器未连接';
  },
  [ConnectionStatus.CONNECTING]: function connecting() {
    return '服务器连接中';
  },
  [ConnectionStatus.CONNECTED]: function connected() {
    return '服务器连接成功';
  },
  [ConnectionStatus.CONNECT_FAILED]: function connectFailed() {
    return '服务器连接失败';
  },
};

const ClientStatus: React.FC<Props> = (props) => {
  const { status } = props;

  return (
    <div>
      <span>
        <span
          className={cx(styles.statusDot, {
            [styles.statusDisconnected]:
              status === ConnectionStatus.DISCONNECTED,
            [styles.statusConnecting]: status === ConnectionStatus.CONNECTING,
            [styles.statusConnected]: status === ConnectionStatus.CONNECTED,
            [styles.statusConnectFailed]:
              status === ConnectionStatus.CONNECT_FAILED,
          })}
        />
        <span className={styles.statusText}>{statusMap[status]()}</span>
      </span>
    </div>
  );
};

export default ClientStatus;
