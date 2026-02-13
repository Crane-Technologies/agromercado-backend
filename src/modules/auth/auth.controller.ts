import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{
    statusCode: number;
    message: string;
    data: AuthResponse;
  }> {
    // 1. Crear usuario (UsersService maneja la encriptación)
    const user = await this.usersService.register(registerDto);

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

  // ENDPOINTS TEMPORALES DE PRUEBA

  // Enpoint para probar JWT
  @Get('test-jwt')
  testJwt() {
    return this.authService.testJwtGeneration();
  }

  // Endpoint para probar excepciones
  @Get('test-exception/:type')
  testException(@Param('type') type: string) {
    switch(type) {
      case 'invalid-credentials':
        throw new InvalidCredentialsException();
      case 'user-exists':
        throw new UserAlreadyExistsException('test@example.com');
      case 'token-expired':
        throw new TokenExpiredException();
      case 'invalid-token':
        throw new InvalidTokenException();
      case 'token-revoked':
        throw new RefreshTokenRevokedException();
      case 'user-not-found':
        throw new UserNotFoundException('123');
      case 'database':
        throw new DatabaseException('test operation');
      case 'token-not-found':
        throw new TokenNotFoundException();
      default:
        return { 
          message: 'Exception tester',
          availableTypes: [
            'invalid-credentials',
            'user-exists',
            'token-expired',
            'invalid-token',
            'token-revoked',
            'user-not-found',
            'database',
            'token-not-found'
          ]
        };
    }
  }

  @Get()
  healthCheck() {
    return { 
      status: 'ok',
      message: 'Auth module is working'
    };
  }
}