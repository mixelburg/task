import { createSyslogFormatter, levelToSyslog } from 'winston-syslog-formatter'
import { createLogger, format, transports } from 'winston'

const LOG_LEVEL = process.env.LOG_LEVEL || 'debug'
const APP_NAME = process.env.APP_NAME || 'tasks-manager'
const HOST = process.env.HOST || 'default'

const logger = createLogger({
  levels: levelToSyslog,
  level: LOG_LEVEL,

  format: format.combine(
    format.colorize({ message: true }),
    createSyslogFormatter({
      facility: 20,
      appName: APP_NAME,
      host: HOST,
    }),
  ),
  transports: [new transports.Console()],
})

export default logger
