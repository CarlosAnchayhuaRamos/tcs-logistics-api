import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserUseCases } from './user.use-cases';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { User, UserRole, UserStatus } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/user.dto';

const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
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

describe('UserUseCases', () => {
  let userUseCases: UserUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUseCases,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
      ],
    }).compile();

    userUseCases = module.get<UserUseCases>(UserUseCases);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const dto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'Password123!',
        phone: '+51987654321',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, ...dto, id: 'uuid-2' });

      const result = await userUseCases.createUser(dto);
      expect(result).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto: CreateUserDto = {
        name: 'Duplicate User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userUseCases.createUser(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const result = await userUseCases.getUserById('uuid-1');
      expect(result.id).toBe('uuid-1');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      await expect(userUseCases.getUserById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should return list of users without passwords', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser]);
      const result = await userUseCases.getAllUsers();
      expect(result).toHaveLength(1);
      result.forEach((u) => expect(u).not.toHaveProperty('password'));
    });
  });
});
