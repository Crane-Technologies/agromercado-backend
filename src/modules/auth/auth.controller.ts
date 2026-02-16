import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto'; // ← IMPORTANTE: Importar desde users
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse, TokensResponse } from './interfaces/auth-response.interface';
import { 
  InvalidCredentialsException, 
  UserAlreadyExistsException,
  TokenExpiredException,
  InvalidTokenException,
  RefreshTokenRevokedException,
  UserNotFoundException,
  DatabaseException,
  TokenNotFoundException,
} from './exceptions/auth.exceptions';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // Registro de usuario + login automático
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{
    statusCode: number;
    message: string;
    data: AuthResponse;
  }> {
    // 1. Crear usuario (UsersService.create() maneja todo)
    const user = await this.usersService.create(registerDto);

    // 2. Login automático (AuthService genera los tokens)
    const loginResult = await this.authService.login({
      email: registerDto.email,
      password: registerDto.password,
      remember_me: false,
    });

    return {
      statusCode: 201,
      message: 'User registered successfully',
      data: loginResult,
    };
  }

  // Login con email + password
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{
    statusCode: number;
    message: string;
    data: AuthResponse;
  }> {
    const result = await this.authService.login(loginDto);

    return {
      statusCode: 200,
      message: 'Login successful',
      data: result,
    };
  }

  
  // Refresh Token 
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    statusCode: number;
    message: string;
    data: TokensResponse;
  }> {
    const tokens = await this.authService.refresh(refreshTokenDto.refresh_token);

    return {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  // LOGOUT (revoca todos los refresh tokens del usuario)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user): Promise<{
    statusCode: number;
    message: string;
  }> {
    await this.authService.logout(user.app_user_id); // ← Extraer el UUID aquí

    return {
      statusCode: 200,
      message: 'Logged out successfully',
    };
  }

  // Endpoint para obtener la información del usuario actual (protegido por JWT)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user) {
    return {
      statusCode: 200,
      message: 'Current user information',
      data: user,
    };
  }

  // Endpoints temporales...
  @Get('test-jwt')
  testJwt() {
    return this.authService.testJwtGeneration();
  }

  @Get()
  healthCheck() {
    return { 
      status: 'ok',
      message: 'Auth module is working'
    };
  }
}