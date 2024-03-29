import { readPackageJsonSync } from '@map-colonies/read-pkg';

export const DEFAULT_SERVER_PORT = 80;
export const SERVICE_NAME = readPackageJsonSync().name ?? 'unknown_service';
export const IGNORED_OUTGOING_TRACE_ROUTES = [/^.*\/v1\/metrics.*$/];
export const IGNORED_INCOMING_TRACE_ROUTES = [/^.*\/docs.*$/];

export enum Services {
  LOGGER = 'ILogger',
  CONFIG = 'IConfig',
  TRACER = 'TRACER',
}
