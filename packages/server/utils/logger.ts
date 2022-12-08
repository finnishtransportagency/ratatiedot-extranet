import pino from 'pino';

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
  });
}

export const log = getLogger('RATAEXTRA_BACKEND');
// To be used when someone makes changes
export const auditLog = getLogger('RATAEXTRA_AUDIT');
