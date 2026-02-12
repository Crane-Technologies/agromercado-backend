import {HttpException, HttpStatus, BadRequestException, UnauthorizedException, ConflictException, NotFoundException} from '@nestjs/common';

// Excepción para credenciales inválidas
export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid email or password',
      error: 'Unauthorized',
    });
  }
}

// Excepción para usuario ya existent
export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super({
      statusCode: HttpStatus.CONFLICT,
      message: `User with email ${email} already exists`,
      error: 'Conflict',
    });
  }
}

// Excepción para token expirado
export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Token has expired',
      error: 'Token Expired',
    });
  }
}

// Excepción para token inválido
export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid or malformed token',
      error: 'Invalid Token',
    });
  }
}

// Excepción para refresh token revocado
export class RefreshTokenRevokedException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Refresh token has been revoked',
      error: 'Token Revoked',
    });
  }
}

// Excepción para usuario no encontrado
export class UserNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message: identifier 
        ? `User with identifier ${identifier} not found` 
        : 'User not found',
      error: 'Not Found',
    });
  }
}

// Excepción para errores de base de datos
export class DatabaseException extends BadRequestException {
  constructor(operation: string) {
    super({
      statusCode: HttpStatus.BAD_REQUEST,
      message: `Database operation failed: ${operation}`,
      error: 'Database Error',
    });
  }
}

// Excepción para token no proporcionado
export class TokenNotFoundException extends UnauthorizedException {
  constructor() {
    super({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'No token provided',
      error: 'Token Not Found',
    });
  }
}