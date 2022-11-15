import pino, { LogFn } from 'pino';

const level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

const XRAY_ENV_NAME = '_X_AMZN_TRACE_ID';
const TRACE_ID_REGEX = /^Root=(.+);Parent=(.+);/;
export const getCorrelationId = () => {
  const tracingInfo = process.env[XRAY_ENV_NAME] || '';
  const matches = tracingInfo.match(TRACE_ID_REGEX) || ['', '', ''];
  const correlationId = matches[1];
  if (correlationId) {
    return correlationId;
  }
};

function getLogger(tag: string) {
  return pino({
    level,
    // Remove unused default fields
    base: undefined,
    mixin: () => {
      return {
        // uid: getVaylaUser()?.uid,
        correlationId: getCorrelationId(),
        tag,
      };
    },
    // Log level as text instead of number
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    // Unix time to ISO time
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    hooks: {
      logMethod(inputArgs: any[], method: LogFn) {
        for (const inputArg of inputArgs) {
          if (inputArg instanceof Error) {
            reportError(inputArg);
          }
        }
        // Flip parameters to make log("message", {object with fields}) work insted of log({object with fields}, "message")
        if (inputArgs.length >= 2) {
          const arg1 = inputArgs.shift();
          const arg2 = inputArgs.shift();
          return method.apply(this, [arg2, arg1, ...inputArgs]);
        }
        if (inputArgs[0]) {
          return method.apply(this, [inputArgs[0]]);
        }
      },
    },
  });
}

export const log = getLogger('RATAEXTRA_BACKEND');
export const auditLog = getLogger('RATAEXTRA_AUDIT');
