enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
}

class Logger {
  private logLevel = LogLevel.DEBUG;

  debug(...args: any[]) {
    this.log.apply(this, [LogLevel.DEBUG, ...args]);
  }

  info(...args: any[]) {
    this.log.apply(this, [LogLevel.INFO, ...args]);
  }

  warn(...args: any[]) {
    this.log.apply(this, [LogLevel.WARN, ...args]);
  }

  error(...args: any[]) {
    this.log.apply(this, [LogLevel.ERROR, ...args]);
  }

  log(...args: any[]) {
    const logLevel = Math.max(
      LogLevel.DEBUG,
      Math.min(LogLevel.FATAL, args[0])
    );

    if (logLevel < this.logLevel) return;

    const o = `%c [${LogLevel[logLevel]}]:`;
    let r = [];
    switch (logLevel) {
      case LogLevel.DEBUG:
        r = [o, 'color: #64B5F6;'].concat(args.slice(1));
        console.log.apply(console, r);
        break;
      case LogLevel.INFO:
        r = [o, 'color: #1E88E5; font-weight: bold;'].concat(args.slice(1));
        console.log.apply(console, r);
        break;
      case LogLevel.WARN:
        r = [o, 'color: #FB8C00; font-weight: bold;'].concat(args.slice(1));
        console.warn.apply(console, r);
        break;
      case LogLevel.ERROR:
        r = [o, 'color: #B00020; font-weight: bold;'].concat(args.slice(1));
        console.error.apply(console, r);
        break;
      default:
        break;
    }
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = Math.min(LogLevel.FATAL, Math.max(LogLevel.DEBUG, level));
  }
}

export default new Logger();
