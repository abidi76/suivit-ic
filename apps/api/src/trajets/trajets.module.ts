import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TrajetsController } from './trajets.controller';
import { TrajetsService } from './trajets.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TrajetsController],
  providers: [TrajetsService],
})
export class TrajetsModule {}