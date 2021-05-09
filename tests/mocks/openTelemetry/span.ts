import { Span } from '@opentelemetry/api';

const endMock = jest.fn();
const spanMock = ({
  end: endMock,
} as unknown) as Span;

export { spanMock, endMock };
