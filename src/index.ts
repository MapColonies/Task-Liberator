/* eslint-disable import/first */
// this import must be called before the first import of tsyring
import 'reflect-metadata';
import { Tracing } from '@map-colonies/telemetry';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { container } from 'tsyringe';
import { IGNORED_INCOMING_TRACE_ROUTES, IGNORED_OUTGOING_TRACE_ROUTES } from './common/constants';
import { registerExternalValues } from './containerConfig';
import { UpdateTimeReleaser } from './updateTime/updateTimeReleaser';
import { HeartbeatReleaser } from './heartbeat/heartbeatReleaser';

const tracing = new Tracing('app_tracer', [
  new HttpInstrumentation({ ignoreOutgoingUrls: IGNORED_OUTGOING_TRACE_ROUTES, ignoreIncomingPaths: IGNORED_INCOMING_TRACE_ROUTES }),
]);

registerExternalValues(tracing);
container.resolve(UpdateTimeReleaser).run();
container.resolve(HeartbeatReleaser).run();

void tracing.stop();
