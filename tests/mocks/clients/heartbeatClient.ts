import { HeartbeatClient } from '../../../src/clients/heartbeatClient';

const getHeartbeatMock = jest.fn();
const heartbeatInactiveTasksMock = jest.fn();
const heartbeatRemoveTasksMock = jest.fn();
const heartbeatClientMock = {
  getHeartbeat: getHeartbeatMock,
  getInactiveTasks: heartbeatInactiveTasksMock,
  removeTasks: heartbeatRemoveTasksMock,
} as unknown as HeartbeatClient;

export { heartbeatClientMock, getHeartbeatMock, heartbeatInactiveTasksMock, heartbeatRemoveTasksMock };
