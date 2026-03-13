// Gelişmiş Console Logger - Temiz, Okunabilir ve Detaylı Hatalar

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  debug: '🔍',
  api: '🌐',
  db: '💾',
  auth: '🔐',
};

class Logger {
  getTime() {
    return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  getCallerInfo() {
    try {
      const error = new Error();
      const stack = error.stack.split('\n');
      // Stack: Error\n at getCallerInfo\n at logger.method\n at actual caller
      const callerLine = stack[3] || stack[2];
      
      // Parse: "at functionName (C:\\path\\file.js:123:45)"
      const match = callerLine.match(/at\s+(?:.*\s+)?\(?([^)]+):(\d+):(\d+)\)?/);
      if (match) {
        const fullPath = match[1];
        const fileName = fullPath.split(/[\/\\]/).pop(); // Son kısım dosya adı
        const line = match[2];
        const column = match[3];
        return `${colors.gray}${fileName}:${line}:${column}${colors.reset}`;
      }
    } catch (e) {
      // Stack parse hatası
    }
    return `${colors.gray}unknown${colors.reset}`;
  }

  formatError(error) {
    if (!error) return 'Bilinmeyen hata';
    if (typeof error === 'string') return error;
    
    // Sequelize hatalarını temizle
    if (error.name === 'SequelizeValidationError') {
      return error.errors.map(e => e.message).join(', ');
    }
    if (error.name === 'SequelizeDatabaseError') {
      return error.parent?.sqlMessage || error.message;
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return `Duplicate: ${error.errors[0]?.path}`;
    }
    
    return error.message || JSON.stringify(error);
  }

  success(context, message, data = null) {
    const caller = this.getCallerInfo();
    console.log(`${colors.green}${symbols.success} [${this.getTime()}] ${caller} ${context}${colors.reset} ${colors.bright}${message}${colors.reset}`);
    if (data) console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }

  error(context, message, error = null) {
    const caller = this.getCallerInfo();
    console.log(`${colors.red}${symbols.error} [${this.getTime()}] ${caller} ${context}${colors.reset} ${colors.bright}${message}${colors.reset}`);
    if (error) {
      const msg = this.formatError(error);
      console.log(`${colors.red}└─ ${msg}${colors.reset}`);
    }
  }

  warning(context, message, data = null) {
    const caller = this.getCallerInfo();
    console.log(`${colors.yellow}${symbols.warning} [${this.getTime()}] ${caller} ${context}${colors.reset} ${message}`);
    if (data) console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }

  info(context, message, data = null) {
    const caller = this.getCallerInfo();
    console.log(`${colors.cyan}${symbols.info} [${this.getTime()}] ${caller} ${context}${colors.reset} ${message}`);
    if (data) console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }

  debug(context, message, data = null) {
    if (process.env.NODE_ENV === 'production') return;
    const caller = this.getCallerInfo();
    console.log(`${colors.magenta}${symbols.debug} [${this.getTime()}] ${caller} ${context}${colors.reset} ${message}`);
    if (data) console.log(`${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }

  api(method, endpoint, status = null, duration = null) {
    const caller = this.getCallerInfo();
    const statusColor = status >= 400 ? colors.red : status >= 300 ? colors.yellow : colors.green;
    const statusText = status ? `${statusColor}${status}${colors.reset}` : '';
    const timeText = duration ? `${colors.dim}${duration}ms${colors.reset}` : '';
    console.log(`${colors.blue}${symbols.api} [${this.getTime()}] ${caller} API${colors.reset} ${colors.bright}${method}${colors.reset} ${endpoint} ${statusText} ${timeText}`);
  }

  db(operation, table, duration = null) {
    const caller = this.getCallerInfo();
    const timeText = duration ? `${colors.dim}${duration}ms${colors.reset}` : '';
    console.log(`${colors.cyan}${symbols.db} [${this.getTime()}] ${caller} DB${colors.reset} ${colors.bright}${operation}${colors.reset} ${table} ${timeText}`);
  }

  auth(action, user = null) {
    const caller = this.getCallerInfo();
    const userInfo = user ? `${colors.dim}(${user})${colors.reset}` : '';
    console.log(`${colors.yellow}${symbols.auth} [${this.getTime()}] ${caller} AUTH${colors.reset} ${colors.bright}${action}${colors.reset} ${userInfo}`);
  }

  perf(context, operation, duration) {
    const caller = this.getCallerInfo();
    const color = duration > 1000 ? colors.red : duration > 500 ? colors.yellow : colors.green;
    console.log(`${color}⏱️  [${this.getTime()}] ${caller} PERF${colors.reset} ${context} - ${operation} ${color}${duration}ms${colors.reset}`);
  }
}

module.exports = new Logger();
