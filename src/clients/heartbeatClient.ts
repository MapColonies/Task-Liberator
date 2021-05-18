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
    this.targetService = 'Heartbeat';
    this.failedHeartbeatDuration = config.get('heartbeat.failedDurationMS');
    this.baseUrl = config.get('heartbeat.serviceUrl');
  }

  public async getInactiveTasks(): Promise<string[]> {
    const url = `${this.baseUrl}/heartbeat/expired/${this.failedHeartbeatDuration}`;
    return this.get<string[]>(url);
  }

  public async removeTasks(ids: string[]): Promise<void> {
    const url = `${this.baseUrl}/heartbeat/remove`;
    await this.post(url, ids);
  }
}
