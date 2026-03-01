import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DATABASE } from '../database/database.provider';
import Database from '@crane-technologies/database';
import { queries } from '../database/queries';
import * as bcrypt from 'bcrypt';
import {
  InvalidCredentialsException,
  UserNotFoundException,
  DatabaseException,
  RefreshTokenRevokedException,
  InvalidTokenException,
} from './exceptions/auth.exceptions';
import { UsersService, User } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import {
  TokensResponse,
  AuthResponse,
} from './interfaces/auth-response.interface';

interface JwtPayload {
  sub: string;
  email: string;
  role_id: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * LOGIN DE USUARIO
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // 1. Validar credenciales
      const user = await this.validateUser(loginDto.email, loginDto.password);

      if (!user) {
        throw new InvalidCredentialsException();
      }

      // 2. Generar tokens
      const tokens = await this.generateTokens(
        user,
        loginDto.remember_me || false,
      );

      // 3. Guardar refresh token en BD
      await this.saveRefreshToken(
        user.app_user_id,
        tokens.refresh_token,
        loginDto.remember_me || false,
      );

      // 4. Retornar usuario (sin password_hash) y tokens
      const { password_hash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      if (error instanceof InvalidCredentialsException) {
        throw error;
      }
      throw new DatabaseException('login');
    }
  }

  /**
   * LOGOUT
   */
  async logout(userId: string): Promise<{ message: string }> {
    try {
      const result = await this.db.query(queries.auth.revokeAllUserTokens, [
        userId,
      ]);

      return { message: 'Logged out successfully' };
    } catch (error: any) {
      console.error('❌ Error en logout:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);

      throw new DatabaseException('logout');
    }
  }

  /**
   * REFRESH TOKEN
   */
  async refresh(refreshToken: string): Promise<TokensResponse> {
    try {
      // 1. Verificar que el refresh token sea válido (JWT)
      let payload: JwtPayload;
      try {
        payload = this.jwtService.verify(refreshToken, {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        });
      } catch (error) {
        throw new InvalidTokenException();
      }

      // 2. Buscar TODOS los refresh tokens del usuario (no revocados y no expirados)
      const result = await this.db.query(queries.auth.findRefreshToken, [
        payload.sub,
      ]);

      if (result.rows.length === 0) {
        throw new RefreshTokenRevokedException();
      }

      // 3. Comparar el token enviado con cada hash guardado usando bcrypt.compare()
      let tokenFound = false;
      for (const row of result.rows) {
        const isValid = await bcrypt.compare(refreshToken, row.token_hash);
        if (isValid) {
          tokenFound = true;
          break;
        }
      }

      if (!tokenFound) {
        throw new RefreshTokenRevokedException();
      }

      // 4. Buscar usuario
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UserNotFoundException(payload.sub);
      }

      // 5. Generar nuevo access token (mantener el mismo refresh token)
      const accessToken = await this.generateAccessToken(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      if (
        error instanceof InvalidTokenException ||
        error instanceof RefreshTokenRevokedException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }

      console.error('❌ Error in refresh:', error);
      throw new DatabaseException('refresh token');
    }
  }
  /**
   * VALIDAR CREDENCIALES (usado en login)
   */
  private async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      throw new DatabaseException('validate user');
    }
  }

  /**
   * GENERAR ACCESS TOKEN
   */
  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.app_user_id,
      email: user.email,
      role_id: user.role_id,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });
  }

  /**
   * GENERAR REFRESH TOKEN
   */
  private async generateRefreshToken(
    user: User,
    rememberMe: boolean,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: user.app_user_id,
      email: user.email,
      role_id: user.role_id,
    };

    const expiresIn = rememberMe
      ? this.configService.get('JWT_REFRESH_EXPIRATION_REMEMBER')
      : this.configService.get('JWT_REFRESH_EXPIRATION');

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn,
    });
  }

  /**
   * GENERAR AMBOS TOKENS
   */
  private async generateTokens(
    user: User,
    rememberMe: boolean,
  ): Promise<TokensResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user, rememberMe),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * GUARDAR REFRESH TOKEN EN BD
   */
  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
    rememberMe: boolean,
  ): Promise<void> {
    try {
      const hashedToken = await this.hashToken(refreshToken);

      const expiresIn = rememberMe
        ? 7 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + expiresIn);

      await this.db.query(queries.auth.saveRefreshToken, [
        userId,
        hashedToken,
        expiresAt,
      ]);
    } catch (error) {
      throw new DatabaseException('save refresh token');
    }
  }

  /**
   * HASHEAR TOKEN
   */
  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}
