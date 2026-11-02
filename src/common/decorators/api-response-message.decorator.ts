import { SetMetadata } from '@nestjs/common';

export const API_RESPONSE_MESSAGE_METADATA = 'apiResponseMessage';

/**
 * Overrides the auto-generated success message for the decorated
 * route (or whole class when placed on a controller).
 *
 * @example `@ApiResponseMessage('Account created successfully.')`
 */
export const ApiResponseMessage = (message: string) =>
  SetMetadata(API_RESPONSE_MESSAGE_METADATA, message);
