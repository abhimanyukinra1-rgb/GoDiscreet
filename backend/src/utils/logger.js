const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');
const errorFile = path.join(logsDir, 'error.log');

const logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message} ${JSON.stringify(data)}\n`;
    console.log(logMessage);
    fs.appendFileSync(logFile, logMessage);
  },
  error: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message} ${JSON.stringify(data)}\n`;
    console.error(logMessage);
    fs.appendFileSync(errorFile, logMessage);
  },
  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message} ${JSON.stringify(data)}\n`;
    console.warn(logMessage);
    fs.appendFileSync(logFile, logMessage);
  }
};

module.exports = logger;
