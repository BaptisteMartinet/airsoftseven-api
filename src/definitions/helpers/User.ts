import { UserRole } from '@definitions/enums';

export function isUserAdmin(user: { role: UserRole | null }) {
  return user.role === UserRole.ADMIN;
}
