import { Logger } from '@map-colonies/js-logger';
import { Tracer } from '@opentelemetry/api';
import { inject, injectable } from 'tsyringe';
import { TasksClient } from '../clients/tasksClient';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { toBoolean } from '../common/utilities/typeConvertors';

@injectable()
export class UpdateTimeReleaser {
  private readonly enabled: boolean;

  public constructor(
    @inject(Services.CONFIG) config: IConfig,
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.TRACER) private readonly tracer: Tracer,
    private readonly tasksClient: TasksClient
  ) {
    this.enabled = toBoolean(config.get('updateTime.enabled'));
  }

  public run(): void {
    if (!this.enabled) {
      this.logger.info('skipping update time releaser, it is disabled.');
      return;
    }

    const span = this.tracer.startSpan('update-time-releaser');
    this.logger.info('starting update time releaser.');

    const deadTasks = this.tasksClient.getInactiveTasks();
    this.logger.info(`releasing tasks: ${deadTasks.join()}`);
    const released = this.tasksClient.releaseTasks(deadTasks);
    this.logger.debug(`relesed tasks: ${released.join()}`);
    span.end();
  }
}
