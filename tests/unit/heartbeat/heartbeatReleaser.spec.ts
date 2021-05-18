import jsLogger from '@map-colonies/js-logger';
import { HeartbeatReleaser } from '../../../src/heartbeat/heartbeatReleaser';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock } from '../../mocks/config';
import { heartbeatClientMock, heartbeatInactiveTasksMock, heartbeatRemoveTasksMock } from '../../mocks/clients/heartbeatClient';
import { tasksClientMock, tasksReleaseTasksMock } from '../../mocks/clients/tasksClient';

let releaser: HeartbeatReleaser;

describe('HeartbeatReleaser', () => {
  beforeEach(function () {
    initTrace();
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe('run', () => {
    it('do noting when disabled', async function () {
      //mock data
      getMock.mockReturnValue('false');

      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).not.toHaveBeenCalled();
      expect(heartbeatRemoveTasksMock).not.toHaveBeenCalled();
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('do noting when there are no dead heartbeats', async function () {
      //mock data
      getMock.mockReturnValue(true);
      heartbeatInactiveTasksMock.mockResolvedValue([]);
      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRemoveTasksMock).not.toHaveBeenCalled();
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('release dead heartbeats from completed tasks', async function () {
      //mock data
      const deadHeartbeats = ['dead', 'completed'];
      const deadTasks = ['dead'];
      const completedTasks = ['completed'];
      getMock.mockReturnValue(true);
      heartbeatInactiveTasksMock.mockResolvedValue(deadHeartbeats);
      tasksReleaseTasksMock.mockResolvedValue(deadTasks);
      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadHeartbeats);
      expect(heartbeatRemoveTasksMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRemoveTasksMock).toHaveBeenCalledWith(completedTasks);
    });

    it('wont release dead heartbeats if there are no completed tasks', async function () {
      //mock data
      const deadHeartbeats = ['dead'];
      const deadTasks = ['dead'];
      getMock.mockReturnValue(true);
      heartbeatInactiveTasksMock.mockResolvedValue(deadHeartbeats);
      tasksReleaseTasksMock.mockResolvedValue(deadTasks);
      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      await releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadHeartbeats);
      expect(heartbeatRemoveTasksMock).toHaveBeenCalledTimes(0);
    });
  });
});
