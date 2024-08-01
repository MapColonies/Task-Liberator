import { faker } from '@faker-js/faker';
import jsLogger from '@map-colonies/js-logger';
import { UpdateTimeReleaser } from '../../../src/updateTime/updateTimeReleaser';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock, setValue, init as initConfig, clear as clearConfig } from '../../mocks/config';
import { tasksClientMock, tasksReleaseTasksMock, tasksInactiveTasksMock } from '../../mocks/clients/tasksClient';
import { heartbeatClientMock, getHeartbeatMock } from '../../mocks/clients/heartbeatClient';
import { NotFoundError } from '../../../src/common/exceptions/http/notFoundError';

let releaser: UpdateTimeReleaser;

describe('UpdateTimeReleaser', () => {
  beforeEach(function () {
    initTrace();
    initConfig();
    // setValue('updateTime.enabled', true);
  });

  afterEach(function () {
    clearConfig();
    jest.resetAllMocks();
  });

  describe('run', () => {
    describe('heartbeat check disabled', () => {
      beforeEach(function () {
        setValue('updateTime.checkHeartbeat', false);
      });
      it('do nothing when disabled', async function () {
        //mock data
        setValue('updateTime.enabled', false);

        // action
        releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
        await releaser.run();

        // expectation
        expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
        expect(getMock).toHaveBeenCalledWith('updateTime.checkHeartbeat');
        expect(getMock).toHaveBeenCalledTimes(2);
        expect(tasksInactiveTasksMock).not.toHaveBeenCalled();
        expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
      });

      it('do nothing when there are no tasks stuck in in-progress', async function () {
        //mock data
        tasksInactiveTasksMock.mockResolvedValue([]);
        // action
        releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
        await releaser.run();

        // expectation
        expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
        expect(getMock).toHaveBeenCalledWith('updateTime.checkHeartbeat');
        expect(getMock).toHaveBeenCalledTimes(2);
        expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
        expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
      });

      it('release dead task when heartbeat check is disabled and task is inactive but had a heartbeat', async function () {
        //mock data
        const deadTasks = ['dead', 'completed'];
        setValue('updateTime.checkHeartbeat', false);
        tasksInactiveTasksMock.mockResolvedValue(deadTasks);
        tasksReleaseTasksMock.mockResolvedValue([]);
        getHeartbeatMock.mockResolvedValue({});
        // action
        releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
        await releaser.run();

        // expectation
        expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
        expect(getMock).toHaveBeenCalledWith('updateTime.checkHeartbeat');
        expect(getMock).toHaveBeenCalledTimes(2);
        expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
        expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
        expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadTasks);
        expect(getHeartbeatMock).not.toHaveBeenCalled();
      });
    });

    describe('heartbeat check enabled', () => {
      beforeEach(function () {
        setValue('updateTime.checkHeartbeat', true);
      });
      it('do nothing when there are tasks stuck in in-progress but had a heartbeat', async function () {
        //mock data
        tasksInactiveTasksMock.mockResolvedValue([faker.string.uuid()]);
        getHeartbeatMock.mockResolvedValue({});
        // action
        releaser = new UpdateTimeReleaser(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock, heartbeatClientMock);
        await releaser.run();

        // expectation
        expect(getMock).toHaveBeenCalledWith('updateTime.enabled');
        expect(getMock).toHaveBeenCalledWith('updateTime.checkHeartbeat');
        expect(getMock).toHaveBeenCalledTimes(2);
        expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
        expect(getHeartbeatMock).toHaveBeenCalledTimes(1);
        expect(tasksReleaseTasksMock).not.toHaveBeenCalled();
      });

      it('release dead tasks that never had a heartbeat', async function () {
        //mock data
        const deadTasks = ['dead', 'completed'];
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
        expect(getMock).toHaveBeenCalledWith('updateTime.checkHeartbeat');
        expect(getMock).toHaveBeenCalledTimes(2);
        expect(tasksInactiveTasksMock).toHaveBeenCalledTimes(1);
        expect(tasksReleaseTasksMock).toHaveBeenCalledTimes(1);
        expect(tasksReleaseTasksMock).toHaveBeenCalledWith(deadTasks);
        expect(getHeartbeatMock).toThrow(NotFoundError);
      });
    });
  });
});
