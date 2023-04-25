/**
 * 主状态
 */
export enum MainStatus {
  /**
   * 未登录
   */
  UNLOGGED,
  /**
   * 登录中
   */
  LOGGING_IN,
  /**
   * 已登录
   */
  LOGGED_IN,
  /**
   * 登录失败
   */
  LOGGED_FAILED,
  /**
   * 请求被控制
   */
  REQUESTING_CONTROLLED,
  /**
   * 请求控制中
   */
  REQUESTING_CONTROL,
  /**
   * 控制中
   */
  CONTROLLING,
  /**
   * 控制结束
   */
  CONTROL_END,
  /**
   * 傀儡端主动结束控制
   */
  STOP_BEING_CONTROLLED,
  /**
   * 取消控制
   */
  CONTROL_CANCEL,
  /**
   * 控制被拒绝
   */
  CONTROL_DENY,
  /**
   * 被控制中
   */
  BEING_CONTROLLED,
  /**
   * 对方不可用
   */
  OPPONENT_NOT_AVAILABLE,
  /**
   * 对方忙碌
   */
  OPPONENT_BUSY,
  /**
   * 窗口关闭
   */
  WINDOW_CLOSE,
}

export enum SlaveStatus {
  /**
   * 关闭窗口
   */
  WINDOW_CLOSE,
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  CONNECT_FAILED,
}

export enum MainIPCEvent {
  /**
   * 断开连接
   */
  STOP_BEING_CONTROLLED = 'stop-being-controlled',
}

export enum SingalEvent {
  RECEIVE_CONTROL_REQUEST = 'receive-control-request',
}
