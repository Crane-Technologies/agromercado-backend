import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { UserNotFoundException } from '../exceptions/auth.exceptions';

interface JwtPayload {
  sub: string;
  email: string;
  role_id: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined in .env');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    // 1. Extraer el refresh token del body
    const refreshToken = req.body.refresh_token;

    // 2. Extraer el user_id del payload
    const userId = payload.sub;

    // 3. Buscar el usuario en la base de datos
    const user = await this.usersService.findById(userId);

    // 4. Si el usuario no existe, lanzar error
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 5. Retornar el usuario y el refresh token
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      refreshToken, // Pasar el refresh token para validarlo después
    };
  }
}