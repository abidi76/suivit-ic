import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtConfig } from './jwt-config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useClass: JwtConfig,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuditService, JwtStrategy, JwtConfig],
  exports: [AuthService, AuditService],
})
export class AuthModule {}
