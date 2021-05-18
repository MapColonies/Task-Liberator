import { Logger } from '@map-colonies/js-logger';
import { Tracer } from '@opentelemetry/api';
import { inject, injectable } from 'tsyringe';
import { HeartbeatClient } from '../clients/heartbeatClient';
import { TasksClient } from '../clients/tasksClient';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { toBoolean } from '../common/utilities/typeConvertors';

@injectable()
export class HeartbeatReleaser {
  private readonly enabled: boolean;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public constructor(
    @inject(Services.CONFIG) config: IConfig,
    @inject(Services.LOGGER) private readonly logger: Logger,
    @inject(Services.TRACER) private readonly tracer: Tracer,
    private readonly heartbeatClient: HeartbeatClient,
    private readonly tasksClient: TasksClient
  ) {
    this.enabled = toBoolean(config.get('heartbeat.enabled'));
  }

  public async run(): Promise<void> {
    if (!this.enabled) {
      this.logger.info('skipping heartbeat releaser, it is disabled.');
      return;
    }

    const span = this.tracer.startSpan('heartbeat-releaser');
    this.logger.info('starting heartbeat releaser.');

    const deadTasks = await this.heartbeatClient.getInactiveTasks();
    if (deadTasks.length > 0) {
      this.logger.info(`releasing tasks: ${deadTasks.join()}`);
      const releasedTasks = await this.tasksClient.releaseTasks(deadTasks);
      this.logger.debug(`released tasks: ${releasedTasks.join()}`);
      const completedTasks = deadTasks.filter((value) => !releasedTasks.includes(value));
      if (completedTasks.length > 0) {
        this.logger.debug(`removing already closed tasks from heartbeat" ${completedTasks.join()}`);
        await this.heartbeatClient.removeTasks(completedTasks);
      } else {
        this.logger.debug('no closed tasks to remove from heartbeat');
      }
    } else {
      this.logger.info('no dead heartbeats');
    }

    span.end();
  }
}
