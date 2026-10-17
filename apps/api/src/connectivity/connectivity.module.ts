import { Module } from '@nestjs/common';
import { ConnectivityController } from './connectivity.controller';
import { ConnectivityService } from './connectivity.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConnectivityController],
  providers: [ConnectivityService],
  exports: [ConnectivityService],
})
export class ConnectivityModule {}