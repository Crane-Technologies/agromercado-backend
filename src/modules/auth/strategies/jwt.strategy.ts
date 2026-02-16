import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
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
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in .env');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    // 1. Extraer el user_id del payload
    const userId = payload.sub;

    // 2. Buscar el usuario en la base de datos
    const user = await this.usersService.findById(userId);

    // 3. Si el usuario no existe, lanzar error
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 4. Retornar el usuario (sin password_hash)
    const { password_hash, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
}