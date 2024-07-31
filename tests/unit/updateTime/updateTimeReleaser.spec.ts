import { v4 as uuidv4 } from 'uuid';
import jsLogger from '@map-colonies/js-logger';
import { UpdateTimeReleaser } from '../../../src/updateTime/updateTimeReleaser';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock } from '../../mocks/config';
import { tasksClientMock, tasksReleaseTasksMock, tasksInactiveTasksMock } from '../../mocks/clients/tasksClient';
import { heartbeatClientMock, getHeartbeatMock } from '../../mocks/clients/heartbeatClient';
import { NotFoundError } from '../../../src/common/exceptions/http/notFoundError';

let releaser: UpdateTimeReleaser;

describe('UpdateTimeReleaser', () => {
  beforeEach(function () {
    initTrace();
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe('run', () => {
    it('do nothing when disabled', async function () {
      //mock data
      getMock.mockReturnValue('false');

      // action
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).not.toHaveBeenCalled();
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('do nothing when there are no tasks stuck in in-progress', async function () {
      //mock data
      getMock.mockReturnValueOnce(true);
      tasksInactiveTasksMock.mockResolvedValue([]);
      // action
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('do nothing when there are tasks stuck in in-progress but had a heartbeat', async function () {
      //mock data
      getMock.mockReturnValueOnce(true);
      tasksInactiveTasksMock.mockResolvedValue([uuidv4()]);
      getHeartbeatMock.mockResolvedValue({});
      // action
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(getHeartbeatMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('release dead tasks', async function () {
      //mock data
      const deadTasks = ['dead', 'completed'];
      getMock.mockReturnValue(true);
      tasksInactiveTasksMock.mockResolvedValue(deadTasks);
      tasksReleaseTasksMock.mockResolvedValue([]);
      getHeartbeatMock.mockImplementation(() => {
        throw new NotFoundError('No Heartbeats found');
      });
      // action
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadTasks);
      expect(getHeartbeatMock).toThrow(NotFoundError);
    });
  });
});
