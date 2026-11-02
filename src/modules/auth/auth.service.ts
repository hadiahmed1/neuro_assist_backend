import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import argon2 from 'argon2';
import { Prisma } from '../../generated/prisma/client.js';
import { Role } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';
import { AuthUserDto } from './dto/auth-response.dto.js';
import { TokenService } from './token.service.js';

/** Kept only to equalize argon2 verification time when the email is unknown, preventing user-enumeration via response timing. */
const SHIELD_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$Ulto1fZxYK3wBsceIMpNqA$QQMG94OfNybVKjhvM6z/c4u73yb3z9PzS1LYCUnZ8/E';

export interface RequestContext {
  ip?: string;
  userAgent?: string;
}

export interface AuthResponse {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(dto: SignupDto, ctx: RequestContext): Promise<AuthResponse> {
    const user = await this.prisma.user
      .create({
        data: {
          email: dto.email.toLowerCase(),
          name: dto.name,
          passwordHash: await argon2.hash(dto.password, { type: argon2.argon2id }),
        },
      })
      // A concurrent signup for the same email must surface as a friendly 409, not a database error.
      .catch((error) => this.mapUniqueViolation(error));

    return this.issueSession(user, ctx);
  }

  async login(dto: LoginDto, ctx: RequestContext): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always run an argon2 verification, even for unknown emails, so authentication timing reveals nothing.
    const passwordMatches = await argon2
      .verify(user?.passwordHash ?? SHIELD_PASSWORD_HASH, dto.password)
      .catch(() => false);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    return this.issueSession(user, ctx);
  }

  private async issueSession(
    user: { id: string; email: string; name: string | null; role: Role },
    ctx: RequestContext,
  ): Promise<AuthResponse> {
    const { access, refresh } = await this.tokenService.issueToken(
      { id: user.id, role: user.role },
      ctx,
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: access,
      refreshToken: refresh,
    };
  }

  private mapUniqueViolation(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('An account with this email already exists.');
    }
    throw error;
  }
}
