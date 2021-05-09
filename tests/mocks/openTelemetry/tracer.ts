import { Tracer } from '@opentelemetry/api';
import { spanMock } from './span';

const startSpanMock = jest.fn();
const tracerMock = ({
  startSpan: startSpanMock,
} as unknown) as Tracer;

function initTrace(): void {
  startSpanMock.mockReturnValue(spanMock);
}

export { tracerMock, startSpanMock, initTrace };
