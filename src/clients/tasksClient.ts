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
  private readonly ignoredTaskTypes?: ITaskType[];

  public constructor(@inject(Services.CONFIG) config: IConfig, @inject(Services.LOGGER) logger: Logger) {
    const retryConfig = TasksClient.parseConfig(config.get<IHttpRetryConfig>('httpRetry'));
    super(logger, retryConfig);
    this.targetService = 'JobService';
    this.baseUrl = config.get('jobServiceUrl');
    this.updateTimeout = config.get('updateTime.failedDurationSec');
    this.taskTypes = this.parseTypes(config.get('updateTime.taskTypes'));
    this.ignoredTaskTypes = this.parseTypes(config.get('updateTime.ignoredTaskTypes'));
  }

  public async getInactiveTasks(): Promise<string[]> {
    const url = `${this.baseUrl}/tasks/findInactive`;
    const body = {
      inactiveTimeSec: this.updateTimeout,
      types: this.taskTypes,
      ignoreTypes: this.ignoredTaskTypes,
    };
    return this.post<string[]>(url, body);
  }

  public async releaseTasks(ids: string[], shouldRaiseAttempts = true): Promise<string[]> {
    const url = `${this.baseUrl}/tasks/releaseInactive/?shouldRaiseAttempts=${String(shouldRaiseAttempts)}`;
    return this.post<string[]>(url, ids);
  }

  public async updateExpiredStatus(): Promise<void> {
    const url = `${this.baseUrl}/tasks/updateExpiredStatus`;
    await this.post(url);
  }

  private parseTypes(types: unknown): ITaskType[] | undefined {
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
