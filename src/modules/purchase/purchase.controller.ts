import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseRequestDto } from './dto/request/create-purchase.request.dto';
import { UpdatePurchaseRequestDto } from './dto/request/update-purchase.request.dto';

@ApiTags('Solicitudes de Compra')
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Crear solicitud de compra', description: 'Un comprador potencial envía una solicitud de compra para un post de ganado' })
  @ApiResponse({ status: 201, description: 'Solicitud de compra creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  createPurchaseRequest(@Body() dto: CreatePurchaseRequestDto) {
    return this.purchaseService.createPurchaseRequest(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las solicitudes de compra' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes de compra' })
  getAll() {
    return this.purchaseService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud de compra por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la solicitud de compra', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Datos de la solicitud de compra' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  getById(@Param('id') id: string) {
    return this.purchaseService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar solicitud de compra', description: 'Actualiza el estado u otros campos de la solicitud (ej. aceptar o rechazar)' })
  @ApiParam({ name: 'id', description: 'UUID de la solicitud de compra', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Solicitud actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseService.update(id, updatePurchaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar solicitud de compra' })
  @ApiParam({ name: 'id', description: 'UUID de la solicitud de compra', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Solicitud eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(id);
  }
}
