import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { HttpClient, IHttpRetryConfig } from './httpClient';

@injectable()
export class TasksClient extends HttpClient {
  private readonly baseUrl: string;
  private readonly updateTimeout: number;

  public constructor(@inject(Services.CONFIG) config: IConfig, @inject(Services.LOGGER) logger: Logger) {
    const retryConfig = TasksClient.parseConfig(config.get<IHttpRetryConfig>('httpRetry'));
    super(logger, retryConfig);
    this.baseUrl = config.get('jobServiceUrl');
    this.updateTimeout = config.get('updateTime.failedDuration');
  }

  public getInactiveTasks(): string[] {
    //TODO: implement
    return [];
  }

  public releaseTasks(ids: string[]): string[] {
    //TODO: implement
    return [];
  }
}
