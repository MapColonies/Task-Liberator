import jsLogger from '@map-colonies/js-logger';
import { UpdateTimeReleaser } from '../../../src/updateTime/updateTimeReleaser';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock } from '../../mocks/config';
import { tasksClientMock, tasksReleaseTasksMock, tasksInactiveTasksMock } from '../../mocks/clients/tasksClient';

let releaser: UpdateTimeReleaser;

describe('UpdateTimeReleaser', () => {
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
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock);
      releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).not.toHaveBeenCalled();
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('do noting when there are no dead tasks', function () {
      //mock data
      getMock.mockReturnValue(true);
      tasksInactiveTasksMock.mockReturnValue([]);
      // action
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock);
      releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
    });

    it('release dead tasks', function () {
      //mock data
      const deadTasks = ['dead', 'completed'];
      getMock.mockReturnValue(true);
      tasksInactiveTasksMock.mockReturnValue(deadTasks);
      tasksReleaseTasksMock.mockReturnValue([]);
      // action
      releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock);
      releaser.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
      expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadTasks);
    });
  });
});
