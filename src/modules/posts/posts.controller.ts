import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { LivestockPostsService } from './posts.service';
import { UploadLivestockPostDto, UpdateLivestockPostDto } from './dto';
import { SearchLivestockPostsQueryDto } from './dto/request/search-livestock-posts.query.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Posts de Ganado')
@Controller('posts')
export class LivestockPostsController {
  constructor(private readonly livestockPostsService: LivestockPostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Crear post de ganado',
    description:
      'Crea un nuevo post de ganado con imágenes opcionales. Enviar como multipart/form-data',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Post creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async uploadLivestockPost(
    @Body() dto: UploadLivestockPostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('Received DTO:', dto);
    return await this.livestockPostsService.uploadLivestockPost(dto, files);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar posts de ganado por texto',
    description:
      'Búsqueda por relevancia usando el término indicado en `q`. Soporta filtros por ubicación, precio, peso, tipo y sexo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados ordenados por relevancia',
  })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  search(@Query() query: SearchLivestockPostsQueryDto) {
    return this.livestockPostsService.search(query);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los posts de ganado' })
  @ApiResponse({ status: 200, description: 'Lista de posts de ganado' })
  getAll() {
    return this.livestockPostsService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener post de ganado por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del post',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Datos del post de ganado' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  findOne(@Param('id') id: string) {
    return this.livestockPostsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar post de ganado' })
  @ApiParam({ name: 'id', description: 'ID numérico del post', example: 1 })
  @ApiResponse({ status: 200, description: 'Post actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateLivestockPostDto: UpdateLivestockPostDto,
  ) {
    return this.livestockPostsService.update(+id, updateLivestockPostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar post de ganado' })
  @ApiParam({ name: 'id', description: 'ID numérico del post', example: 1 })
  @ApiResponse({ status: 200, description: 'Post eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Post no encontrado' })
  remove(@Param('id') id: string) {
    return this.livestockPostsService.remove(+id);
  }
}
