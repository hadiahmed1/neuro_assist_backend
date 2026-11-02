import { ArgumentsHost, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter.js';

const hostWith = (): { host: ArgumentsHost; json: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> } => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'POST', url: '/auth/login' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, json, status };
};

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('nests the exception payload in the standard envelope', () => {
    const { host, json, status } = hostWith();

    filter.catch(new BadRequestException('Invalid credentials.'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      statusCode: 400,
      message: 'Invalid credentials.',
      data: null,
      timestamp: expect.any(String),
      path: '/auth/login',
    });
  });

  it('splits validation message arrays into a summary message and an errors field', () => {
    const { host, json } = hostWith();

    filter.catch(new BadRequestException(['email must be an email']), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'email must be an email',
        errors: ['email must be an email'],
      }),
    );
  });

  it('degrades unknown exceptions to a 500 internal error envelope', () => {
    const { host, json, status } = hostWith();

    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      statusCode: 500,
      message: 'An unexpected internal server error occurred.',
      data: null,
      timestamp: expect.any(String),
      path: '/auth/login',
    });
  });

  it('preserves the status code of uncaught HTTP exceptions above 500', () => {
    const { host, status } = hostWith();

    filter.catch(new InternalServerErrorException('Dependency timed out.'), host);

    expect(status).toHaveBeenCalledWith(500);
  });
});
