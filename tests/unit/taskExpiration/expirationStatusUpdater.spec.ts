import jsLogger from '@map-colonies/js-logger';
import { ExpirationStatusUpdater } from '../../../src/taskExpiration/expirartionStatusUpdater';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock, setValue, init as initConfig, clear as clearConfig } from '../../mocks/config';
import { tasksClientMock, updateExpiredStatusMock } from '../../mocks/clients/tasksClient';

let updater: ExpirationStatusUpdater;

describe('UpdateTimeReleaser', () => {
  beforeEach(function () {
    initTrace();
    initConfig();
    setValue('expirationStatus.enabled', true);
  });

  afterEach(function () {
    clearConfig();
    jest.resetAllMocks();
  });

  describe('run', () => {
    it('do nothing when disabled', async function () {
      //mock data
      setValue('expirationStatus.enabled', false);

      // action
      updater = new ExpirationStatusUpdater(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock);
      await updater.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('expirationStatus.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(updateExpiredStatusMock).not.toHaveBeenCalled();
    });

    it('trigger expiration status update', async function () {
      //mock data
      // action
      updater = new ExpirationStatusUpdater(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock);
      await updater.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('expirationStatus.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(updateExpiredStatusMock).toHaveBeenCalledTimes(1);
    });
  });
});
