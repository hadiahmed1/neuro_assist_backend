import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor.js';
import { ApiResponseMessage } from '../decorators/api-response-message.decorator.js';
import { SkipResponseWrap } from '../decorators/skip-response-wrap.decorator.js';

const Payload = { user: { id: 1 } };

const contextWith = (handler: () => void, method: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ method, url: '/auth/login' }),
      getResponse: () => ({ statusCode: 200 }),
    }),
    getHandler: () => handler,
    getClass: () => class {},
  }) as unknown as ExecutionContext;

const nextWith = (payload: unknown) => ({ handle: () => of(payload) }) as unknown as CallHandler;

describe('ResponseInterceptor', () => {
  const interceptor = new ResponseInterceptor(new Reflector());

  it('wraps the handler payload with a verb-aware success message', async () => {
    const result = await firstValueFrom(
      interceptor.intercept(contextWith(() => {}, 'POST'), nextWith(Payload)),
    );

    expect(result).toEqual({
      success: true,
      statusCode: 200,
      message: 'Resource created successfully.',
      data: Payload,
      timestamp: expect.any(String),
      path: '/auth/login',
    });
  });

  it('uses the message declared via `@ApiResponseMessage` when present', async () => {
    const handler = (): void => {};
    ApiResponseMessage('Signed in successfully.')(handler);
    const result = await firstValueFrom(
      interceptor.intercept(contextWith(handler, 'POST'), nextWith(Payload)),
    );

    expect(result).toMatchObject({ message: 'Signed in successfully.' });
  });

  it('passes the payload through untouched for skipped routes', async () => {
    const handler = (): void => {};
    SkipResponseWrap()(handler);
    const result = await firstValueFrom(
      interceptor.intercept(contextWith(handler, 'POST'), nextWith(Payload)),
    );

    expect(result).toBe(Payload);
  });
});
