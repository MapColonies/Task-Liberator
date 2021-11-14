import jsLogger from '@map-colonies/js-logger';
import { ExpirationStatusUpdater } from '../../../src/taskExpiration/expirartionStatusUpdater';
import { tracerMock, initTrace } from '../../mocks/openTelemetry/tracer';
import { configMock, getMock } from '../../mocks/config';
import { tasksClientMock, updateExpiredStatusMock } from '../../mocks/clients/tasksClient';

let updater: ExpirationStatusUpdater;

describe('UpdateTimeReleaser', () => {
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
      updater = new ExpirationStatusUpdater(configMock, jsLogger({ enabled: false }), tracerMock, tasksClientMock);
      await updater.run();

      // expectation
      expect(getMock).toHaveBeenCalledWith('expirationStatus.enabled');
      expect(getMock).toHaveBeenCalledTimes(1);
      expect(updateExpiredStatusMock).not.toHaveBeenCalled();
    });

    it('trigger expiration status update', async function () {
      //mock data
      getMock.mockReturnValueOnce(true);
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
