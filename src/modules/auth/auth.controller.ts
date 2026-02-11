import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
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
  constructor(private readonly authService: AuthService) {}

  // Endpoint para probar generación de JWT
  @Get('test-jwt')
  testJwt() {
    return this.authService.testJwtGeneration();
  }

  // Endpoint temporal para probar excepciones
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