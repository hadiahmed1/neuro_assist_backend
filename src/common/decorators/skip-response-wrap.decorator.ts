import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_WRAP_METADATA = 'skipResponseWrap';

/**
 * Marks a route (or whole controller) to bypass the response
 * envelope and return the handler payload untouched.
 *
 * Useful for raw file streams, webhooks echoed back verbatim,
 * or third-party contract endpoints.
 */
export const SkipResponseWrap = () => SetMetadata(SKIP_RESPONSE_WRAP_METADATA, true);
