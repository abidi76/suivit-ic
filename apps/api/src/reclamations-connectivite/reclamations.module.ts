import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ReclamationsController } from './reclamations.controller';
import { ReclamationsService } from './reclamations.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ReclamationsController],
  providers: [ReclamationsService],
})
export class ReclamationsModule {}