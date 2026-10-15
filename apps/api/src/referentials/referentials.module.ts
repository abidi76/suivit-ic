import { Module } from '@nestjs/common';
import { ReferentialsController } from './referentials.controller';
import { ReferentialsService } from './referentials.service';
import { CascadesController } from './cascades.controller';
import { CascadesService } from './cascades.service';

@Module({
  controllers: [ReferentialsController, CascadesController],
  providers: [ReferentialsService, CascadesService],
  exports: [ReferentialsService, CascadesService],
})
export class ReferentialsModule {}