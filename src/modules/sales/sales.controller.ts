import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { GetSalesQueryDto, UpdateSaleRequestDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  app_user_id: string;
  role_id: number;
}

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Lista ventas con paginación y filtros; aplica visibilidad según el usuario autenticado.
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() query: GetSalesQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.salesService.findAll(query, currentUser);
  }

  // Retorna una venta puntual y valida autorización cuando no es admin.
  @Get(':saleId')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('saleId') saleId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.salesService.findById(saleId, currentUser);
  }

  // Actualiza una venta; este endpoint está restringido a administradores.
  @Patch(':saleId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateById(
    @Param('saleId') saleId: string,
    @Body() dto: UpdateSaleRequestDto,
  ) {
    return this.salesService.updateById(saleId, dto);
  }

  // Elimina una venta; este endpoint está restringido a administradores.
  @Delete(':saleId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteById(@Param('saleId') saleId: string) {
    return this.salesService.deleteById(saleId);
  }
}
