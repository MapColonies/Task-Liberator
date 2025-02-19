// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { setInterval } from 'node:timers/promises';
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

async function run(logger: Logger): Promise<void> {
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
}

async function main(): Promise<void> {
  const tracing = new Tracing([
    new HttpInstrumentation({ ignoreOutgoingUrls: IGNORED_OUTGOING_TRACE_ROUTES, ignoreIncomingPaths: IGNORED_INCOMING_TRACE_ROUTES }),
  ]);

  registerExternalValues(tracing);
  const logger = container.resolve<Logger>(Services.LOGGER);
  const interval = config.get<number>('intervalMs');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/naming-convention
  for await (const _ of setInterval(interval, null)) {
    try {
      logger.info({ msg: 'Main Loop started', startTime: new Date(Date.now()) });
      await run(logger);
    } catch (err) {
      const error = err as Error;
      logger.error({ msg: `Main Loop error: ${error.message}`, err });
    }
  }

  void tracing.stop();
}

void main();
