export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  isActive: boolean;
  isSystemAdmin?: boolean;
}
