import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { HttpClient, IHttpRetryConfig } from './httpClient';

@injectable()
export class HeartbeatClient extends HttpClient {
  private readonly failedHeartbeatDuration: string;
  private readonly baseUrl: string;

  public constructor(@inject(Services.CONFIG) config: IConfig, @inject(Services.LOGGER) logger: Logger) {
    const retryConfig = HeartbeatClient.parseConfig(config.get<IHttpRetryConfig>('httpRetry'));
    super(logger, retryConfig);
    this.failedHeartbeatDuration = config.get('heartbeat.failedDuration');
    this.baseUrl = config.get('heartbeat.serviceUrl');
  }

  public getInactiveTasks(): string[] {
    //TODO: implement
    return [];
  }

  public removeTasks(ids: string[]): void {
    //TODO: implement
  }
}
