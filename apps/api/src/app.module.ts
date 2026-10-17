import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReferentialsModule } from './referentials/referentials.module';
import { ArrivalsModule } from './arrivals/arrivals.module';
import { EquipmentModule } from './equipment/equipment.module';
import { TicketsModule } from './tickets/tickets.module';
import { InterventionsModule } from './interventions/interventions.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConnectivityModule } from './connectivity/connectivity.module';
import { ReclamationsModule } from './reclamations-connectivite/reclamations.module';
import { TrajetsModule } from './trajets/trajets.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ReferentialsModule,
    ArrivalsModule,
    EquipmentModule,
    TicketsModule,
    InterventionsModule,
    ConnectivityModule,
    ReclamationsModule,
    TrajetsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}