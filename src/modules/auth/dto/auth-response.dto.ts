import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums.js';

export class AuthUserDto {
  @ApiProperty({ example: '0d3f8c98-2b1e-4b7f-9a3d-6f2e1c5b7a11', format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'Jane Doe', nullable: true, type: String })
  name!: string | null;

  @ApiProperty({ example: 'PATIENT', enum: Object.values(Role) })
  role!: Role;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Short-lived JWT used to authenticate API requests.',
  })
  accessToken!: string;

  @ApiProperty({
    example: '6d1c1f8a-2f9e-4c1d-8a4b-9f0e2d3c5b6a.e1f2...a9',
    description: 'Long-lived refresh token. Store securely; never expose to third parties.',
  })
  refreshToken!: string;
}
