import winston, { format } from "winston";
const { combine, colorize, printf, timestamp } = format;

export const logger = winston.createLogger({
  level: "info",
  format: combine(
  	timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    printf(({ level, message, timestamp, ...meta }) => {
      const metaFormatted = Object.keys(meta).length
        ? JSON.stringify(meta, null, 2)
        : "";
      return `${timestamp} ${level}: ${message} ${metaFormatted}`;
    }),
    colorize({ all: true }),
  ),
  transports: [new winston.transports.Console()],
});