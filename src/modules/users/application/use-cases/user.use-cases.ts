import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../domain/repositories/user.repository';
import {
  User,
  UserRole,
  UserStatus,
} from '../../domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dtos/user.dto';

@Injectable()
export class UserUseCases {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`El email ${dto.email} ya está registrado`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new User({
      id: uuidv4(),
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      phone: dto.phone ?? null,
      role: dto.role ?? UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    const saved = await this.userRepository.save(user);
    return this.toResponse(saved);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return this.toResponse(user);
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => this.toResponse(u));
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    const updated = await this.userRepository.update(id, dto);
    return this.toResponse(updated);
  }

  // Internal - for auth module
  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email.toLowerCase());
  }

  private toResponse(user: User): UserResponseDto {
    const { password, ...rest } = user;
    return rest as UserResponseDto;
  }
}
