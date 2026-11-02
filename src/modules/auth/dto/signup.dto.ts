import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { LoginDto } from './login.dto.js';

export class SignupDto extends LoginDto {
  @ApiPropertyOptional({ example: 'Jane Doe', minLength: 2, maxLength: 80 })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(80)
  name?: string;
}
