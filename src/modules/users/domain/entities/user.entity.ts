export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
