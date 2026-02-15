import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUseCases } from './auth.use-cases';
import { UserUseCases } from '../../../users/application/use-cases/user.use-cases';
import { User, UserRole, UserStatus } from '../../../users/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserUseCases = {
  findByEmailForAuth: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
};

const mockUser: User = new User({
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  phone: '+51999000000',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AuthUseCases', () => {
  let authUseCases: AuthUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUseCases,
        { provide: UserUseCases, useValue: mockUserUseCases },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authUseCases = module.get<AuthUseCases>(AuthUseCases);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user on valid credentials', async () => {
      mockUserUseCases.findByEmailForAuth.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authUseCases.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('mocked.jwt.token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserUseCases.findByEmailForAuth.mockResolvedValue(null);

      await expect(
        authUseCases.login({ email: 'notfound@example.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockUserUseCases.findByEmailForAuth.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authUseCases.login({ email: 'test@example.com', password: 'WrongPass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = new User({ ...mockUser, status: UserStatus.INACTIVE });
      mockUserUseCases.findByEmailForAuth.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authUseCases.login({ email: 'test@example.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
