// src/common/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Read required roles from metadata (if none, allow)
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 2. Get user (populated by JwtStrategy) from request
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('No user role found');
    }

    // 3. Check if user.role is in requiredRoles
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role "${user.role}" not authorized. Requires: ${requiredRoles.join(
          ', ',
        )}`,
      );
    }

    return true;
  }
}
