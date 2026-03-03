import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@ApiTags('Archivos')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear archivo' })
  @ApiResponse({ status: 201, description: 'Archivo creado exitosamente' })
  create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.create(createFileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los archivos' })
  @ApiResponse({ status: 200, description: 'Lista de archivos' })
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener archivo por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico del archivo', example: 1 })
  @ApiResponse({ status: 200, description: 'Datos del archivo' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar archivo' })
  @ApiParam({ name: 'id', description: 'ID numérico del archivo', example: 1 })
  @ApiResponse({ status: 200, description: 'Archivo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar archivo' })
  @ApiParam({ name: 'id', description: 'ID numérico del archivo', example: 1 })
  @ApiResponse({ status: 200, description: 'Archivo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
