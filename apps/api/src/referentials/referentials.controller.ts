import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReferentialsService } from './referentials.service';
import { CreateCreDto } from './dto/create-cre.dto';
import { CreateGouvernoratDto } from './dto/create-gouvernorat.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/client';

@Controller('referentials')
export class ReferentialsController {
  constructor(private service: ReferentialsService) {}

  // ==========================================
  // CRE
  // ==========================================

  @Get('cre')
  findAllCre() {
    return this.service.findAllCre();
  }

  @Get('cre/:id')
  findOneCre(@Param('id') id: string) {
    return this.service.findOneCre(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('cre')
  createCre(@Body() dto: CreateCreDto) {
    return this.service.createCre(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('cre/:id')
  updateCre(@Param('id') id: string, @Body() dto: Partial<CreateCreDto>) {
    return this.service.updateCre(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('cre/:id')
  desactiverCre(@Param('id') id: string) {
    return this.service.desactiverCre(id);
  }

  // ==========================================
  // GOUVERNORAT
  // ==========================================

  @Get('gouvernorat')
  findAllGouvernorat() {
    return this.service.findAllGouvernorat();
  }

  @Get('gouvernorat/:id')
  findOneGouvernorat(@Param('id') id: string) {
    return this.service.findOneGouvernorat(id);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Post('gouvernorat')
  createGouvernorat(@Body() dto: CreateGouvernoratDto) {
    return this.service.createGouvernorat(dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Patch('gouvernorat/:id')
  updateGouvernorat(@Param('id') id: string, @Body() dto: Partial<CreateGouvernoratDto>) {
    return this.service.updateGouvernorat(id, dto);
  }

  @Roles(Role.ADMIN_CENTRAL)
  @Delete('gouvernorat/:id')
  desactiverGouvernorat(@Param('id') id: string) {
    return this.service.desactiverGouvernorat(id);
  }
}