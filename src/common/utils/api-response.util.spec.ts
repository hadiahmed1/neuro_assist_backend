import type { ApiResponseEnvelope } from '../interfaces/api-response.interface.js';
import { createEnvelope } from '../utils/api-response.util.js';

describe('createEnvelope', () => {
  it('marks non-error status codes as successful and includes the payload', () => {
    const envelope = createEnvelope({
      statusCode: 201,
      message: 'Resource created successfully.',
      data: { id: 1 },
      path: '/auth/signup',
    });

    expect(envelope).toEqual({
      success: true,
      statusCode: 201,
      message: 'Resource created successfully.',
      data: { id: 1 },
      timestamp: expect.any(String),
      path: '/auth/signup',
    } satisfies ApiResponseEnvelope<{ id: number }>);
  });

  it('omits the errors field unless one is provided', () => {
    const envelope = createEnvelope({
      statusCode: 400,
      message: 'Validation failed.',
      path: '/auth/login',
    });

    expect(envelope.data).toBeNull();
    expect(envelope).not.toHaveProperty('errors');
    expect(envelope.success).toBe(false);
  });

  it('keeps 4xx/5xx responses marked as failures and carries errors through', () => {
    const envelope = createEnvelope({
      statusCode: 400,
      message: 'Validation failed.',
      errors: ['email must be an email'],
      path: '/auth/login',
    });

    expect(envelope.success).toBe(false);
    expect(envelope.errors).toEqual(['email must be an email']);
  });
});
