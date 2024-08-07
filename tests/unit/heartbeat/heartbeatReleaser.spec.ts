import jsLogger from '@map-colonies/js-logger';
import { HeartbeatReleaser } from '../../../src/heartbeat/heartbeatReleaser';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock, setValue, init as initConfig, clear as clearConfig } from '../../mocks/config';
import { heartbeatClientMock, heartbeatInactiveTasksMock, heartbeatRemoveTasksMock } from '../../mocks/clients/heartbeatClient';
import { tasksClientMock, tasksReleaseTasksMock } from '../../mocks/clients/tasksClient';

let releaser: HeartbeatReleaser;

describe('HeartbeatReleaser', () => {
  beforeEach(function () {
    initTrace();
    initConfig();
    setValue('updateTime.enabled', true);
  });

  afterEach(function () {
    clearConfig();
    jest.resetAllMocks();
  });

  describe('run', () => {
    it('do nothing when disabled', async function () {
      //mock data
      setValue('heartbeat.enabled', false);

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

    it('do nothing when there are no dead heartbeats', async function () {
      //mock data
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
