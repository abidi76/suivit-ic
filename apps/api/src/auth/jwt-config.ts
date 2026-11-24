import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class JwtConfig implements JwtOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createJwtOptions(): JwtModuleOptions {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET doit être configuré.');

    return {
      secret,
      signOptions: { expiresIn: '1d' },
    };
  }
}
