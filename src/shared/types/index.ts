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
  REQUESTING_CONTROLL,
  /**
   * 控制中
   */
  CONTROLLING,
  /**
   * 控制结束
   */
  CONTROL_END,
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
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  CONNECT_FAILED,
}

export enum ControllerState {}
