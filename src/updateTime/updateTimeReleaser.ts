import { Logger } from '@map-colonies/js-logger';
import { Tracer } from '@opentelemetry/api';
import { inject, injectable } from 'tsyringe';
import { TasksClient } from '../clients/tasksClient';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { toBoolean } from '../common/utilities/typeConvertors';
import { HeartbeatClient } from '../clients/heartbeatClient';
import { NotFoundError } from '../common/exceptions/http/notFoundError';

@injectable()
export class UpdateTimeReleaser {
  private readonly enabled: boolean;
  private readonly checkHeartbeatEnabled: boolean;

  public constructor(
    @inject(Services.CONFIG) config: IConfig,
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.TRACER) private readonly tracer: Tracer,
    private readonly tasksClient: TasksClient,
    private readonly heartbeatClient: HeartbeatClient
  ) {
    this.enabled = toBoolean(config.get('updateTime.enabled'));
    this.checkHeartbeatEnabled = toBoolean(config.get('updateTime.checkHeartbeat'));
  }

  public async run(): Promise<void> {
    if (!this.enabled) {
      this.logger.info('skipping update time releaser, it is disabled.');
      return;
    }

    const span = this.tracer.startSpan('update-time-releaser');
    this.logger.info('starting update time releaser.');

    const inactiveTasks = await this.tasksClient.getInactiveTasks();
    let deadTasks: string[] = [];
    if (this.checkHeartbeatEnabled) {
      for (const task of inactiveTasks) {
        try {
          await this.heartbeatClient.getHeartbeat(task);
        } catch (error) {
          if (error instanceof NotFoundError) {
            this.logger.debug(`found dead job that never had a heartbeat: ${task}`);
            deadTasks.push(task);
          }
        }
      }
    } else {
      deadTasks = inactiveTasks;
    }
    if (deadTasks.length > 0) {
      this.logger.info(`releasing tasks: ${deadTasks.join()}`);
      const released = await this.tasksClient.releaseTasks(deadTasks);
      this.logger.debug(`released tasks: ${released.join()}`);
    } else {
      this.logger.info('no dead tasks to release');
    }
    span.end();
  }
}
