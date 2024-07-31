import config from 'config';
import { get, has } from 'lodash';
import { IConfig } from '../../src/common/interfaces';

let mockConfig: Record<string, unknown> = {};
const getMock = jest.fn();
const hasMock = jest.fn();

const configMock = {
  get: getMock,
  has: hasMock,
} as IConfig;

const init = (): void => {
  getMock.mockImplementation((key: string): unknown => {
    return mockConfig[key] ?? config.get(key);
  });
};

const setValue = (key: string | Record<string, unknown>, value?: unknown): void => {
  if (typeof key === 'string') {
    mockConfig[key] = value;
  } else {
    mockConfig = { ...mockConfig, ...key };
  }
};

const clear = (): void => {
  mockConfig = {};
};

const setConfigValues = (values: Record<string, unknown>): void => {
  getMock.mockImplementation((key: string) => {
    const value = get(values, key) ?? config.get(key);
    return value;
  });
  hasMock.mockImplementation((key: string) => has(values, key) || config.has(key));
};

const registerDefaultConfig = (): void => {
  const config = {
    logger: {
      level: 'info',
    },
    jobServiceUrl: '',
    heartbeat: {
      enabled: true,
      failedDurationMS: 1000,
      serviceUrl: '',
    },
    updateTime: {
      enabled: true,
      failedDurationSec: 300,
      taskTypes: [],
      ignoredTaskTypes: [],
      checkHeartbeat: false,
    },
    expirationStatus: {
      enabled: true,
    },
    httpRetry: {
      attempts: 3,
      delay: 'exponential',
      shouldResetTimeout: true,
    },
  };
  setConfigValues(config);
};

export { getMock, hasMock, configMock, setValue, clear, init, setConfigValues, registerDefaultConfig };
