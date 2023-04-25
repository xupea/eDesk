import { Button } from 'antd';
import styles from './index.module.css';

function RequestControlling() {
  return (
    <div className={styles.requestControl}>
      <div>正在等待对方同意...</div>
      <div>
        <Button
          type="primary"
          onClick={() => {
            window.electron.ipcRenderer.send('control-cancel');
          }}
        >
          取消控制
        </Button>
      </div>
    </div>
  );
}

export default RequestControlling;
