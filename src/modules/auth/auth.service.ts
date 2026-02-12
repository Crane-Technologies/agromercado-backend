import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Método temporal para probar JWT
  testJwtGeneration() {
    // Payload de prueba
    const payload = {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      role_id: 1,
    };

    // Generar token
    const token = this.jwtService.sign(payload);

    // Decodificar token para verificar
    const decoded = this.jwtService.decode(token);

    return {
      message: 'JWT generated successfully',
      config: {
        secret: this.configService.get('JWT_ACCESS_SECRET') ? '✅ Configured' : '❌ Missing',
        expiration: this.configService.get('JWT_ACCESS_EXPIRATION'),
      },
      token: token,
      decoded: decoded,
    };
  }
}