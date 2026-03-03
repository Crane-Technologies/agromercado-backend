import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { FindByNameSurnameDto } from './dto/find-by-name-surname.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';
import { GetUsersQueryDto } from './dto/get-users.query.dto';
import { buildLimitOffset } from '../../common/pagination/build-limit-offset.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description: 'Solo accesible para administradores',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de resultados (máx. 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Número de resultados a omitir',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de usuarios (sin password_hash)',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador',
  })
  async getAll(@Query() query: GetUsersQueryDto) {
    const pagination = buildLimitOffset(query.limit, query.offset);
    return this.usersService.getAll(pagination);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Crear usuario (admin)',
    description: 'Crea un nuevo usuario. Solo accesible para administradores',
  })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador',
  })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async createByAdmin(@Body() registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Actualizar perfil propio',
    description: 'Actualiza los datos del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async updateOwnProfile(
    @CurrentUser() currentUser: { app_user_id: string },
    @Body() updateOwnUserDto: UpdateOwnUserDto,
  ) {
    const user = await this.usersService.update(
      currentUser.app_user_id,
      updateOwnUserDto,
    );
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Actualizar usuario (admin)',
    description:
      'Actualiza los datos de cualquier usuario. Solo accesible para administradores',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateByAdmin(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Eliminar usuario (admin)',
    description:
      'Elimina un usuario del sistema. Solo accesible para administradores',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteByAdmin(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  @Get('search/name-surname')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Buscar usuarios por nombre y apellido (admin)',
    description: 'Solo accesible para administradores',
  })
  @ApiResponse({ status: 200, description: 'Lista de usuarios que coinciden' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador',
  })
  async findByNameAndSurname(@Query() query: FindByNameSurnameDto) {
    const users = await this.usersService.findByNameAndSurname(
      query.first_name,
      query.surname,
    );
    return users.map(({ password_hash, ...safeUser }) => safeUser);
  }

  // Endpoint para probar findByEmail
  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar usuario por email' })
  @ApiParam({
    name: 'email',
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @ApiResponse({ status: 200, description: 'Resultado de búsqueda por email' })
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return {
      message: user ? 'User found' : 'User not found',
      user: user,
    };
  }

  // Endpoint para probar findById
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Datos del usuario' })
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      message: user ? 'User found' : 'User not found',
      user: user,
    };
  }

  // Endpoint para probar emailExists
  @Get('check/email/:email')
  @ApiOperation({ summary: 'Verificar si un email ya está registrado' })
  @ApiParam({
    name: 'email',
    description: 'Email a verificar',
    example: 'usuario@ejemplo.com',
  })
  @ApiResponse({ status: 200, description: 'Indica si el email existe' })
  async checkEmail(@Param('email') email: string) {
    const exists = await this.usersService.emailExists(email);
    return {
      email: email,
      exists: exists,
    };
  }
}
