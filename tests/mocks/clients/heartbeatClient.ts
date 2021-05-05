import { HeartbeatClient } from '../../../src/clients/heartbeatClient';

const heartbeatInactiveTasksMock = jest.fn();
const heartbeatRemoveTasksMock = jest.fn();
const heartbeatClientMock = ({
  getInactiveTasks: heartbeatInactiveTasksMock,
  removeTasks: heartbeatRemoveTasksMock,
} as unknown) as HeartbeatClient;

export { heartbeatClientMock, heartbeatInactiveTasksMock, heartbeatRemoveTasksMock };
