import jsLogger from '@map-colonies/js-logger';
import { HeartbeatReleaser } from '../../../src/heartbeat/heartbeatReleaser';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock } from '../../mocks/config';
import { heartbeatClientMock, heartbeatInactiveTasksMock, heartbeatRemoveTasksMock } from '../../mocks/clients/heartbeatClient';
import { tasksClientMock, tasksReleaseTasksMock } from '../../mocks/clients/tasksClient';

let releaser: HeartbeatReleaser;

console.log(__dirname);

describe('HeartbeatReleaser', () => {
  beforeEach(function () {
    initTrace();
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe('run', () => {
    it('do noting when disabled', function () {
      //mock data
      getMock.mockReturnValue('false');

      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).not.toHaveBeenCalled();
      expect(heartbeatRemoveTasksMock).not.toHaveBeenCalled();
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('do noting when there are no dead heartbeats', function () {
      //mock data
      getMock.mockReturnValue(true);
      heartbeatInactiveTasksMock.mockReturnValue([]);
      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRemoveTasksMock).not.toHaveBeenCalled();
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('release dead heartbeats from completed tasks', function () {
      //mock data
      const deadHeartbeats = ['dead', 'completed'];
      const deadTasks = ['dead'];
      const completedTasks = ['completed'];
      getMock.mockReturnValue(true);
      heartbeatInactiveTasksMock.mockReturnValue(deadHeartbeats);
      tasksReleaseTasksMock.mockReturnValue(deadTasks);
      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('heartbeat.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(heartbeatInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadHeartbeats);
      expect(heartbeatRemoveTasksMock).toHaveBeenCalledTimes(1);
      expect(heartbeatRemoveTasksMock).toHaveBeenCalledWith(completedTasks);
    });

    it('wont release dead heartbeats if there are no completed tasks', function () {
      //mock data
      const deadHeartbeats = ['dead'];
      const deadTasks = ['dead'];
      getMock.mockReturnValue(true);
      heartbeatInactiveTasksMock.mockReturnValue(deadHeartbeats);
      tasksReleaseTasksMock.mockReturnValue(deadTasks);
      // action
      releaser = new HeartbeatReleaser(configMock, jsLogger({ enabled: false }), tracerMock, heartbeatClientMock, tasksClientMock);
      releaser.run();

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
