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
  LogoutDocs,
  CheckAuthDocs,
} from './auth.swagger';

@ApiTags('auth')
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
    const { access_token } = this.authService.googleLogin(req);
 
    // ✅ SEULEMENT le JWT dans un cookie httpOnly sécurisé
    res.cookie('access_token', access_token, {
      httpOnly: true,        // Empêche l'accès JavaScript (protection XSS)
      secure: true,          // ✅ TOUJOURS HTTPS (configure ton reverse proxy en dev si nécessaire)
      sameSite: 'strict',    // ✅ Protection CSRF renforcée
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: '/',             // Disponible sur tout le site
    });

    
    return res.redirect(`${process.env.REDIRECT_LOGIN_URL}`);
  }

  // Email/Password Authentication Routes
  @Post('register')
  @RegisterDocs()
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto);
    

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,          // ✅ TOUJOURS HTTPS
      sameSite: 'strict',    // ✅ Protection CSRF renforcée
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      message: result.message,
      user: {
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      }
    });
  }

  @Post('login')
  @LoginDocs()
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);
    
    // ✅ SEULEMENT le JWT dans un cookie httpOnly sécurisé
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: true,          // ✅ TOUJOURS HTTPS
      sameSite: 'strict',    // ✅ Protection CSRF renforcée
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      message: result.message,
      user: {
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      }
    });
  }

  // Protected route example
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @GetProfileDocs()
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  // Logout (clear cookies)
  @Post('logout')
  @LogoutDocs()
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return res.json({ message: 'Logged out successfully' });
  }

  // Check auth status (useful for frontend)
  @Get('check')
  @CheckAuthDocs()
  async checkAuth(@Request() req, @Res() res: Response) {
    const token = req.cookies?.access_token;
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const decoded = this.authService.verifyToken(token);
      const user = await this.authService.getProfile(decoded.sub);
      return res.json({ authenticated: true, user });
    } catch (error) {
      return res.status(401).json({ authenticated: false });
    }
  }
}