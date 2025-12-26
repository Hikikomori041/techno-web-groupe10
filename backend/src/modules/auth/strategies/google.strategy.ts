import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/schemas/user.schema';
import { Role } from '../../../common/enums/role.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    // Get callback URL from environment or use defaults
    const callbackUrlEnv = configService
      .get<string>('GOOGLE_CALLBACK_URL')
      ?.trim();
    const nodeEnv = configService.get<string>('NODE_ENV');
    const renderUrl = configService.get<string>('RENDER_EXTERNAL_URL');

    // Determine callback URL with explicit priority
    let callbackURL: string;
    if (callbackUrlEnv) {
      // Highest priority: explicit GOOGLE_CALLBACK_URL env var
      callbackURL = callbackUrlEnv;
    } else if (nodeEnv === 'production' || renderUrl) {
      // Production: use production URL
      const baseUrl = renderUrl || 'https://achetez-fr.onrender.com';
      callbackURL = `${baseUrl}/auth/google-redirect`.replace(
        /([^:]\/)\/+/g,
        '$1',
      ); // Remove double slashes
    } else {
      // Development: use localhost
      callbackURL = 'http://localhost:3000/auth/google-redirect';
    }

    // Log for debugging (before super call using console.log since logger needs super first)
    console.log('=== Google OAuth Configuration ===');
    console.log(`Callback URL: ${callbackURL}`);
    console.log(`NODE_ENV: ${nodeEnv || 'not set'}`);
    console.log(`GOOGLE_CALLBACK_URL env: ${callbackUrlEnv || 'not set'}`);
    console.log(`RENDER_EXTERNAL_URL: ${renderUrl || 'not set'}`);

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL,
      scope: ['email', 'profile'],
    } as any);

    // Log again after super call for logger
    this.logger.log(`Google OAuth Callback URL: ${callbackURL}`);
    this.logger.log(`NODE_ENV: ${nodeEnv || 'not set'}`);
    this.logger.log(
      `GOOGLE_CALLBACK_URL from env: ${callbackUrlEnv || 'not set'}`,
    );
  }
  
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    // Check if user already exists
    let user = await this.userModel.findOne({ email: emails[0].value });
    
    if (!user) {
      // Create new user if doesn't exist
      user = await this.userModel.create({
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos[0].value,
        googleId: id,
        provider: 'google',
        password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        roles: [Role.USER],
      });
    }
    
    const userObject = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      roles: user.roles,
      accessToken,
      refreshToken,
    };
    
    done(null, userObject);
  }
}
