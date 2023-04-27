import { Button, Modal } from 'antd';
import { MainIPCEvent } from 'shared/types';
import styles from './index.module.css';

function BeingControlled() {
  const handleClick = () => {
    Modal.confirm({
      title: '提示',
      content: '确定是否要断开控制',
      onOk: () => {
        window.electronMain.closeConnection();
        window.electronMain.ipcRenderer.send(
          MainIPCEvent.STOP_BEING_CONTROLLED,
          {
            from: 'slaved',
          }
        );
      },
      okText: '确定',
      cancelText: '取消',
    });
  };
  return (
    <div className={styles.requestControl}>
      <div>正在被远控中...</div>
      <div>
        <Button type="primary" onClick={handleClick}>
          断开连接
        </Button>
      </div>
    </div>
  );
}

export default BeingControlled;
