import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-user.repository';
import { UserUseCases } from './application/use-cases/user.use-cases';
import { UsersController } from './infrastructure/controllers/users.controller';
import { USER_REPOSITORY } from './domain/repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UsersController],
  providers: [
    UserUseCases,
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [UserUseCases],
})
export class UsersModule {}
