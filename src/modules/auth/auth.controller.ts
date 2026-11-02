import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, RequestContext } from './auth.service.js';
import { LoginDocs, SignupDocs } from './auth.controller.docs.js';
import { LoginDto } from './dto/login.dto.js';
import { SignupDto } from './dto/signup.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @SignupDocs()
  signup(@Body() dto: SignupDto, @Req() req: Request) {
    return this.authService.signup(dto, this.requestContext(req));
  }

  @Post('login')
  @LoginDocs()
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, this.requestContext(req));
  }

  private requestContext(req: Request): RequestContext {
    return {
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    };
  }
}
