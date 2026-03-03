import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';
import { UploadFilesDto, UploadFilesResponseDto } from './dto';
import { FilesValidationPipe } from './pipes';

@ApiTags('Archivos AWS S3')
@Controller('aws/files')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Subir archivos a S3',
    description:
      'Sube hasta 10 archivos a AWS S3. Enviar como multipart/form-data con el campo "files"',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivos a subir junto con sus metadatos',
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Archivos subidos exitosamente',
    type: UploadFilesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Archivos inválidos o metadatos incorrectos',
  })
  async uploadFiles(
    @UploadedFiles(new FilesValidationPipe()) files: Express.Multer.File[],
    @Body() uploadFilesDto: UploadFilesDto,
  ): Promise<UploadFilesResponseDto> {
    return this.awsService.uploadFiles(files, uploadFilesDto);
  }

  @Get(':fileId/download')
  @ApiOperation({
    summary: 'Obtener URL de descarga',
    description: 'Genera una URL pre-firmada de S3 para descargar el archivo',
  })
  @ApiParam({
    name: 'fileId',
    description: 'UUID del archivo',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'expiresIn',
    required: false,
    description: 'Tiempo de expiración en segundos (default: 3600)',
    example: 3600,
  })
  @ApiResponse({
    status: 200,
    description: 'URL pre-firmada generada',
    schema: { type: 'object', properties: { url: { type: 'string' } } },
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async getDownloadUrl(
    @Param('fileId') fileId: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<{ url: string }> {
    const expirationTime = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.awsService.getDownloadUrl(fileId, expirationTime);
    return { url };
  }

  @Get('post/:livestockPostId')
  @ApiOperation({
    summary: 'Obtener archivos de un post',
    description: 'Retorna todos los archivos asociados a un post de ganado',
  })
  @ApiParam({
    name: 'livestockPostId',
    description: 'UUID del post de ganado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Lista de archivos del post' })
  async getFilesByPost(@Param('livestockPostId') livestockPostId: string) {
    const files = await this.awsService.getFilesByPost(livestockPostId);
    return {
      success: true,
      count: files.length,
      files,
    };
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Eliminar un archivo' })
  @ApiParam({
    name: 'fileId',
    description: 'UUID del archivo a eliminar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo eliminado exitosamente',
    type: UploadFilesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async deleteFile(
    @Param('fileId') fileId: string,
  ): Promise<UploadFilesResponseDto> {
    return this.awsService.deleteFile(fileId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Eliminar múltiples archivos',
    description: 'Elimina varios archivos de S3 en una sola operación',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['550e8400-e29b-41d4-a716-446655440000'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Archivos eliminados exitosamente',
    type: UploadFilesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'No se proporcionaron IDs de archivos',
  })
  async deleteFiles(
    @Body('fileIds') fileIds: string[],
  ): Promise<UploadFilesResponseDto> {
    if (!fileIds || fileIds.length === 0) {
      throw new BadRequestException('No file IDs provided');
    }
    return this.awsService.deleteFiles(fileIds);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check del módulo AWS' })
  @ApiResponse({
    status: 200,
    description: 'Servicio operativo',
    schema: {
      type: 'object',
      properties: { status: { type: 'string', example: 'ok' } },
    },
  })
  healthCheck() {
    return { status: 'ok' };
  }
}
