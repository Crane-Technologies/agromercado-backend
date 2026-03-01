import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { role_id?: number } | undefined;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const rawAdminRoleId = process.env.ADMIN_ROLE_ID;

    if (!rawAdminRoleId) {
      throw new InternalServerErrorException(
        'ADMIN_ROLE_ID is not configured',
      );
    }

    const adminRoleId = Number(rawAdminRoleId);
    if (Number.isNaN(adminRoleId)) {
      throw new InternalServerErrorException('ADMIN_ROLE_ID must be numeric');
    }

    if (user.role_id !== adminRoleId) {
      throw new ForbiddenException(
        `Only admins can access this resource. Required role_id: ${adminRoleId}`,
      );
    }

    return true;
  }
}
