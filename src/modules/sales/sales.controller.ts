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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { GetSalesQueryDto, UpdateSaleRequestDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface AuthenticatedUser {
  app_user_id: string;
  role_id: number;
}

@ApiTags('Ventas')
@ApiBearerAuth('access-token')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // Lista ventas con paginación y filtros; aplica visibilidad según el usuario autenticado.
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar ventas', description: 'Retorna ventas con paginación y filtros. Los administradores ven todas las ventas; los usuarios normales solo ven las suyas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(
    @Query() query: GetSalesQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.salesService.findAll(query, currentUser);
  }

  // Retorna una venta puntual y valida autorización cuando no es admin.
  @Get(':saleId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener venta por ID', description: 'Los administradores pueden ver cualquier venta; los usuarios normales solo las suyas' })
  @ApiParam({ name: 'saleId', description: 'UUID de la venta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Datos de la venta' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permiso para ver esta venta' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async findById(
    @Param('saleId') saleId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.salesService.findById(saleId, currentUser);
  }

  // Actualiza una venta; este endpoint está restringido a administradores.
  @Patch(':saleId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Actualizar venta (admin)', description: 'Actualiza los campos de una venta. Solo accesible para administradores' })
  @ApiParam({ name: 'saleId', description: 'UUID de la venta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Venta actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de administrador' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async updateById(
    @Param('saleId') saleId: string,
    @Body() dto: UpdateSaleRequestDto,
  ) {
    return this.salesService.updateById(saleId, dto);
  }

  // Elimina una venta; este endpoint está restringido a administradores.
  @Delete(':saleId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Eliminar venta (admin)', description: 'Elimina una venta del sistema. Solo accesible para administradores' })
  @ApiParam({ name: 'saleId', description: 'UUID de la venta', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Venta eliminada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos de administrador' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async deleteById(@Param('saleId') saleId: string) {
    return this.salesService.deleteById(saleId);
  }
}
