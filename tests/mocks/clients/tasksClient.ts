import { TasksClient } from '../../../src/clients/tasksClient';

const tasksInactiveTasksMock = jest.fn();
const tasksReleaseTasksMock = jest.fn();
const tasksClientMock = ({
  getInactiveTasks: tasksInactiveTasksMock,
  releaseTasks: tasksReleaseTasksMock,
} as unknown) as TasksClient;

export { tasksClientMock, tasksInactiveTasksMock, tasksReleaseTasksMock };
