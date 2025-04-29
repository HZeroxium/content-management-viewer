// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

export type Role = 'admin' | 'editor' | 'client';

/**
 * @Roles('admin','editor')
 * Attaches an array of allowed roles to the route’s metadata.
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
