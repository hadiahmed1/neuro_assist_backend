import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import {
  ApiEnvelopeResponse,
  ApiResponseEnvelopeDto,
} from '../../common/utils/api-response.dto.js';

export const SignupDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register a new account',
      description:
        'Creates a user account with the PATIENT role and immediately issues an access/refresh token pair.',
    }),
    ApiBody({ type: SignupDto }),
    ApiEnvelopeResponse(AuthResponseDto, {
      status: 201,
      description: 'Account created and session issued, wrapped in the standard response envelope.',
    }),
    ApiBadRequestResponse({
      description: 'Request body failed validation; the error response lists field violations.',
    }),
    ApiConflictResponse({
      description: 'An account with this email already exists.',
    }),
  );

export const LoginDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Authenticate with email and password',
      description:
        'Verifies the credentials against a stored argon2id hash and issues a session with an access/refresh token pair.',
    }),
    ApiBody({ type: LoginDto }),
    ApiEnvelopeResponse(AuthResponseDto, {
      status: 200,
      description: 'Authentication succeeded; new session issued, wrapped in the response envelope.',
    }),
    ApiUnauthorizedResponse({
      description: 'Unknown email, wrong password, or deactivated account.',
    }),
  );

/** Re-exported so consumers of these docs can reference the envelope model. */
export { ApiResponseEnvelopeDto };

