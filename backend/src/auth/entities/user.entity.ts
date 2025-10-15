import { Role } from '../enums/role.enum';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: 'local' | 'google';
  roles: Role[];
  createdAt: Date;
}

