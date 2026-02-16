import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos del decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 3. Obtener el usuario del request (debe estar autenticado primero)
    const { user } = context.switchToHttp().getRequest();

    // 4. Si no hay usuario (no debería pasar si JwtAuthGuard está antes)
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // 5. Verificar si el usuario tiene uno de los roles requeridos
    const hasRole = requiredRoles.includes(user.role_id);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role_id}`
      );
    }

    return true;
  }
}