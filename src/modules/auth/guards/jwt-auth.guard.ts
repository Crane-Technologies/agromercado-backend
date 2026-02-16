import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  InvalidTokenException, 
  TokenExpiredException,
  TokenNotFoundException 
} from '../exceptions/auth.exceptions';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Agregar lógica personalizada antes de llamar a la strategy
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Manejar errores de forma personalizada
    
    // Si hay un error o no hay usuario
    if (err || !user) {
      // Token expirado
      if (info?.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      }
      
      // Token inválido o malformado
      if (info?.name === 'JsonWebTokenError') {
        throw new InvalidTokenException();
      }
      
      // No se proporcionó token
      if (info?.message === 'No auth token') {
        throw new TokenNotFoundException();
      }
      
      // Otro error
      throw err || new UnauthorizedException('Authentication failed');
    }
    
    return user;
  }
}