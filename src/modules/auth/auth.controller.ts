import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import {
  AuthResponse,
  TokensResponse,
} from './interfaces/auth-response.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea el usuario y envía un código de verificación al email. No devuelve tokens.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado. Verificar email para obtener acceso.',
  })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  @ApiResponse({ status: 400, description: 'Datos de registro inválidos' })
  async register(@Body() registerDto: RegisterDto): Promise<{
    statusCode: number;
    message: string;
    data: { userId: string; message: string };
  }> {
    const result = await this.authService.register(registerDto);
    return {
      statusCode: 201,
      message: result.message,
      data: result,
    };
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 300_000 } })
  @ApiOperation({
    summary: 'Verificar email con código de 6 dígitos',
    description:
      'Valida el código enviado al email. Si es correcto, marca el usuario como verificado y devuelve tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verificado exitosamente, retorna tokens',
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido, expirado o ya utilizado',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<{ statusCode: number; message: string; data: AuthResponse }> {
    const result = await this.authService.verifyEmail(dto);
    return {
      statusCode: 200,
      message: 'Email verified successfully',
      data: result,
    };
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @ApiOperation({
    summary: 'Reenviar código de verificación',
    description:
      'Genera un nuevo código y lo envía al email. Invalida el código anterior.',
  })
  @ApiResponse({ status: 200, description: 'Código reenviado exitosamente' })
  @ApiResponse({ status: 400, description: 'El usuario ya está verificado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<{ statusCode: number; message: string }> {
    const result = await this.authService.resendVerification(dto.email);
    return {
      statusCode: 200,
      message: result.message,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario con email y contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso, retorna access_token y refresh_token',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
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
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Renovar token de acceso',
    description: 'Genera un nuevo access_token usando el refresh_token',
  })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o revocado',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{
    statusCode: number;
    message: string;
    data: TokensResponse;
  }> {
    const tokens = await this.authService.refresh(
      refreshTokenDto.refresh_token,
    );

    return {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: tokens,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async logout(@CurrentUser() user): Promise<{
    statusCode: number;
    message: string;
  }> {
    const userId = user.app_user_id;
    await this.authService.logout(userId);

    return {
      statusCode: 200,
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener usuario actual',
    description: 'Retorna la información del usuario autenticado',
  })
  @ApiResponse({ status: 200, description: 'Información del usuario actual' })
  @ApiResponse({
    status: 401,
    description: 'Token de acceso inválido o expirado',
  })
  getMe(@CurrentUser() user) {
    return {
      statusCode: 200,
      message: 'Current user information',
      data: user,
    };
  }
}
