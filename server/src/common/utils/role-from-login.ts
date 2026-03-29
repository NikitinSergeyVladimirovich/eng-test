import { UserRole } from '@prisma/client';

export function resolveRoleForNewUser(login: string): UserRole {
  if (login === 'admin') {
    return UserRole.admin;
  }
  if (login === 'Никита') {
    return UserRole.nikita;
  }
  return UserRole.survivor;
}
