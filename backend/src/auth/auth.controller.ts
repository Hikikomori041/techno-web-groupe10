import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  GoogleAuthDocs,
  GoogleRedirectDocs,
  RegisterDocs,
  LoginDocs,
  GetProfileDocs,
} from './auth.swagger';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Google OAuth Routes
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @GoogleAuthDocs()
  async googleAuth(@Request() req) {}

  @Get('google-redirect')
  @UseGuards(GoogleOAuthGuard)
  @GoogleRedirectDocs()
  googleAuthRedirect(@Request() req, @Res() res: Response) {
    const userData = this.authService.googleLogin(req);

    // Redirect to frontend dashboard with user data
    const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
    return res.redirect(
      `${process.env.REDIRECT_LOGIN_URL}/dashboard?user=${userDataEncoded}`,
    );
  }

  // Email/Password Authentication Routes
  @Post('register')
  @RegisterDocs()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @LoginDocs()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Protected route example
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @GetProfileDocs()
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }
}