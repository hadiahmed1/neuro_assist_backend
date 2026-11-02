import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';

export const SignupDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Register a new account',
      description:
        'Creates a user account with the PATIENT role and immediately issues an access/refresh token pair.',
    }),
    ApiBody({ type: SignupDto }),
    ApiCreatedResponse({
      type: AuthResponseDto,
      description: 'Account created and session issued.',
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
    ApiOkResponse({
      type: AuthResponseDto,
      description: 'Authentication succeeded; new session issued.',
    }),
    ApiUnauthorizedResponse({
      description: 'Unknown email, wrong password, or deactivated account.',
    }),
  );
