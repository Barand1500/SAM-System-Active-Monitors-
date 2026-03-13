// Frontend Logger - Temiz, Detaylı ve Okunabilir Console Mesajları

const isDev = import.meta.env.DEV;

const styles = {
  success: 'color: #10b981; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  warning: 'color: #f59e0b; font-weight: bold;',
  info: 'color: #3b82f6; font-weight: bold;',
  debug: 'color: #8b5cf6; font-weight: bold;',
  api: 'color: #06b6d4; font-weight: bold;',
  dim: 'color: #94a3b8; font-size: 0.9em;',
  caller: 'color: #6b7280; font-size: 0.85em; font-style: italic;',
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  debug: '🔍',
  api: '🌐',
};

class Logger {
  getTime() {
    return new Date().toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  getCallerInfo() {
    try {
      const error = new Error();
      const stack = error.stack.split('\n');
      // Stack: Error\n at getCallerInfo\n at logger.method\n at actual caller
      const callerLine = stack[3] || stack[2];
      
      // Parse browser format: "at functionName (http://localhost:5173/src/file.js:123:45)"
      // or "http://localhost:5173/src/file.js:123:45"
      const match = callerLine.match(/(?:at\s+.*\s+)?(?:\()?(.+?):(\d+):(\d+)\)?$/);
      if (match) {
        const fullPath = match[1];
        const fileName = fullPath.split('/').pop().split('?')[0]; // Son kısım, query string olmadan
        const line = match[2];
        const column = match[3];
        return `${fileName}:${line}:${column}`;
      }
    } catch (e) {
      // Stack parse hatası
    }
    return 'unknown';
  }

  formatError(error) {
    if (!error) return 'Bilinmeyen hata';
    if (typeof error === 'string') return error;
    
    // Axios hatalarını temizle
    if (error.isAxiosError || error.response) {
      const status = error.response?.status;
      const msg = error.response?.data?.error || error.response?.data?.message || error.message;
      return `[${status}] ${msg}`;
    }
    
    return error.message || JSON.stringify(error);
  }

  success(context, message, data = null) {
    const caller = this.getCallerInfo();
    console.log(
      `%c${symbols.success} [${this.getTime()}] %c${caller}%c ${context}%c ${message}`,
      styles.success,
      styles.caller,
      styles.success,
      'color: inherit; font-weight: normal;'
    );
    if (data && isDev) console.log('%cData:', styles.dim, data);
  }

  error(context, message, error = null) {
    const caller = this.getCallerInfo();
    console.error(
      `%c${symbols.error} [${this.getTime()}] %c${caller}%c ${context}%c ${message}`,
      styles.error,
      styles.caller,
      styles.error,
      'color: inherit; font-weight: normal;'
    );
    if (error) {
      const msg = this.formatError(error);
      console.error(`%c└─ ${msg}`, 'color: #ef4444;');
    }
  }

  warning(context, message, data = null) {
    const caller = this.getCallerInfo();
    console.warn(
      `%c${symbols.warning} [${this.getTime()}] %c${caller}%c ${context}%c ${message}`,
      styles.warning,
      styles.caller,
      styles.warning,
      'color: inherit; font-weight: normal;'
    );
    if (data && isDev) console.log('%cData:', styles.dim, data);
  }

  info(context, message, data = null) {
    const caller = this.getCallerInfo();
    console.log(
      `%c${symbols.info} [${this.getTime()}] %c${caller}%c ${context}%c ${message}`,
      styles.info,
      styles.caller,
      styles.info,
      'color: inherit; font-weight: normal;'
    );
    if (data && isDev) console.log('%cData:', styles.dim, data);
  }

  debug(context, message, data = null) {
    if (!isDev) return;
    const caller = this.getCallerInfo();
    console.log(
      `%c${symbols.debug} [${this.getTime()}] %c${caller}%c ${context}%c ${message}`,
      styles.debug,
      styles.caller,
      styles.debug,
      'color: inherit; font-weight: normal;'
    );
    if (data) console.log('%cData:', styles.dim, data);
  }

  api(method, endpoint, status = null, duration = null) {
    const caller = this.getCallerInfo();
    const statusStyle = status >= 400 ? styles.error : status >= 300 ? styles.warning : styles.success;
    const statusText = status ? `[${status}]` : '';
    const timeText = duration ? `${duration}ms` : '';
    
    console.log(
      `%c${symbols.api} [${this.getTime()}] %c${caller}%c API%c ${method} ${endpoint} ${statusText} %c${timeText}`,
      styles.api,
      styles.caller,
      styles.api,
      'color: inherit; font-weight: normal;',
      styles.dim
    );
  }

  group(title) {
    console.group(`%c${title}`, 'font-weight: bold;');
  }

  groupEnd() {
    console.groupEnd();
  }
}

export default new Logger();
