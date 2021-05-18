import { Logger } from '@map-colonies/js-logger';
import { inject, injectable } from 'tsyringe';
import { Services } from '../common/constants';
import { IConfig } from '../common/interfaces';
import { HttpClient, IHttpRetryConfig } from './httpClient';

interface ITaskType {
  jobType: string;
  taskType: string;
}
@injectable()
export class TasksClient extends HttpClient {
  private readonly baseUrl: string;
  private readonly updateTimeout: number;
  private readonly taskTypes?: ITaskType[];

  public constructor(@inject(Services.CONFIG) config: IConfig, @inject(Services.LOGGER) logger: Logger) {
    const retryConfig = TasksClient.parseConfig(config.get<IHttpRetryConfig>('httpRetry'));
    super(logger, retryConfig);
    this.targetService = 'JobService';
    this.baseUrl = config.get('jobServiceUrl');
    this.updateTimeout = config.get('updateTime.failedDurationSec');
    this.taskTypes = this.parseTypes(config);
  }

  public async getInactiveTasks(): Promise<string[]> {
    const url = `${this.baseUrl}/tasks/findInactive`;
    const body = {
      inactiveTimeSec: this.updateTimeout,
      types: this.taskTypes,
    };
    return this.post<string[]>(url, body);
  }

  public async releaseTasks(ids: string[]): Promise<string[]> {
    const url = `${this.baseUrl}/tasks/releaseInactive`;
    return this.post<string[]>(url, ids);
  }

  private parseTypes(config: IConfig): ITaskType[] | undefined {
    let types = config.get('updateTime.taskTypes');
    if (typeof types === 'string') {
      types = JSON.parse(types);
    }
    const parseTypes = types as ITaskType[];
    if (parseTypes.length > 0) {
      return parseTypes;
    }
    return undefined;
  }
}
