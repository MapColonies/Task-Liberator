/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { Tracing } from '@map-colonies/telemetry';
import { Logger } from '@map-colonies/js-logger';
import config from 'config';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { container } from 'tsyringe';
import { IGNORED_INCOMING_TRACE_ROUTES, IGNORED_OUTGOING_TRACE_ROUTES, Services } from './common/constants';
import { registerExternalValues } from './containerConfig';
import { UpdateTimeReleaser } from './updateTime/updateTimeReleaser';
import { HeartbeatReleaser } from './heartbeat/heartbeatReleaser';
import { ExpirationStatusUpdater } from './taskExpiration/expirartionStatusUpdater';

let isActive = false;

async function run(logger: Logger): Promise<void> {
  if (isActive) {
    return;
  }
  isActive = true;

  try {
    await container.resolve(UpdateTimeReleaser).run();
  } catch (err) {
    const error = err as Error;
    logger.error(error.message);
  }
  try {
    await container.resolve(HeartbeatReleaser).run();
  } catch (err) {
    const error = err as Error;
    logger.error(error.message);
  }
  try {
    await container.resolve(ExpirationStatusUpdater).run();
  } catch (err) {
    const error = err as Error;
    logger.error(error.message);
  }
  
  isActive = false;
}

function main(): void {
  const tracing = new Tracing([
    new HttpInstrumentation({ ignoreOutgoingUrls: IGNORED_OUTGOING_TRACE_ROUTES, ignoreIncomingPaths: IGNORED_INCOMING_TRACE_ROUTES }),
  ]);

  registerExternalValues(tracing);
  const logger = container.resolve<Logger>(Services.LOGGER);
  setInterval(() => {
    void (async (): Promise<void> => {
      try {
        await run(logger);
      } catch (err) {
        const error = err as Error;
        logger.error(error.message);
      }
    })();
  }, config.get<number>('intervalMs'));

  void tracing.stop();
}

main();
