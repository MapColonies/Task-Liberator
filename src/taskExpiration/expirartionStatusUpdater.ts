import { Logger } from '@map-colonies/js-logger';
import { Tracer } from '@opentelemetry/api';
import { inject, injectable } from 'tsyringe';
import { TasksClient } from '../clients/tasksClient';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { toBoolean } from '../common/utilities/typeConvertors';

@injectable()
export class ExpirationStatusUpdater {
  private readonly enabled: boolean;

  public constructor(
    @inject(Services.CONFIG) config: IConfig,
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.TRACER) private readonly tracer: Tracer,
    private readonly tasksClient: TasksClient
  ) {
    this.enabled = toBoolean(config.get('expirationStatus.enabled'));
  }

  public async run(): Promise<void> {
    if (!this.enabled) {
      this.logger.info('skipping expiration status updater, it is disabled.');
      return;
    }

    const span = this.tracer.startSpan('expiration-status-updater');
    this.logger.info('starting expiration status updater.');

    await this.tasksClient.updateExpiredStatus();

    span.end();
  }
}
