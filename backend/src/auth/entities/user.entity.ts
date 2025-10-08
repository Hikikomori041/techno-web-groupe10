export interface User {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: 'local' | 'google';
  createdAt: Date;
}

