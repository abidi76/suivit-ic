import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuditService } from './audit.service'; // Assurez-vous que le chemin est bon
// ... autres imports

@Module({
  imports: [ /* ... */  
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'votre_secret_par_defaut', // Idéalement dans le .env
      signOptions: { expiresIn: '1d' }, // Durée de vie du token
    }),],
  controllers: [AuthController],
  providers: [
    AuthService, 
    AuditService, // Doit être ici
    // ... autres providers
  ],
  exports: [
    AuthService, 
    AuditService, // <--- IL FAUT L'AJOUTER ICI
  ],
})
export class AuthModule {}