import { container } from 'tsyringe';
import config from 'config';
import { getOtelMixin } from '@map-colonies/telemetry';
import jsLogger, { LoggerOptions } from '@map-colonies/js-logger';
import { Tracing } from '@map-colonies/telemetry';
import { trace } from '@opentelemetry/api';
import { SERVICE_NAME, Services } from './common/constants';

function registerExternalValues(tracing: Tracing): void {
  const loggerConfig = config.get<LoggerOptions>('logger');
  const logger = jsLogger({ ...loggerConfig, prettyPrint: false, mixin: getOtelMixin() });
  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: logger });

  tracing.start();
  const tracer = trace.getTracer(SERVICE_NAME);
  container.register(Services.TRACER, { useValue: tracer });

  container.register('onSignal', {
    useValue: async (): Promise<void> => {
      await Promise.all([tracing.stop()]);
    },
  });
}

export { registerExternalValues };
