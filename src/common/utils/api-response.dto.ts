import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiProperty,
  ApiResponseOptions,
  getSchemaPath,
  ApiResponse as ApiResponseType,
} from '@nestjs/swagger';
import { ApiResponseEnvelope } from '../interfaces/api-response.interface.js';

/**
 * Generic OpenAPI model of the standard response envelope.
 *
 * `@nestjs/swagger` needs concrete types, so endpoints use
 * `ApiEnvelopeResponse(SomeDto)` (see `common/decorators`), which
 * composes this wrapper around the endpoint's own response shape.
 */
export class ApiResponseEnvelopeDto<TData = unknown> implements ApiResponseEnvelope<TData> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'Request successful.' })
  message!: string;

  @ApiProperty({ nullable: true })
  data!: TData | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: [String],
    example: ['email must be an email'],
    description: 'Only set when the response carries structured validation details.',
  })
  errors?: unknown[];

  @ApiProperty({ example: '2026-11-02T10:15:30.000Z' })
  timestamp!: string;

  @ApiProperty({ example: '/auth/login' })
  path!: string;
}

/**
 * Documents a route under the standard response envelope, wrapping
 * whatever payload DTO it would previously have documented.
 *
 * @example `ApiEnvelopeResponse(AuthResponseDto, { status: 201 })`
 */
export const ApiEnvelopeResponse = (
  type: Type | undefined,
  options: Omit<ApiResponseOptions, 'type' | 'schema' | 'status'> & { status: HttpStatus },
): MethodDecorator =>
  applyDecorators(
    ...(type ? [ApiExtraModels(type)] : []),
    ApiResponseType({
      ...options,
      schema: type
        ? {
            allOf: [{ $ref: getSchemaPath(ApiResponseEnvelopeDto) }],
            properties: { data: { $ref: getSchemaPath(type) } },
          }
        : { $ref: getSchemaPath(ApiResponseEnvelopeDto) },
    }),
  );
