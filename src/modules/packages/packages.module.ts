import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageOrmEntity } from './infrastructure/persistence/typeorm/entities/package.orm-entity';
import { TypeOrmPackageRepository } from './infrastructure/persistence/typeorm/repositories/typeorm-package.repository';
import { PackageUseCases } from './application/use-cases/package.use-cases';
import { PackagesController } from './infrastructure/controllers/packages.controller';
import { PACKAGE_REPOSITORY } from './domain/repositories/package.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PackageOrmEntity])],
  controllers: [PackagesController],
  providers: [
    PackageUseCases,
    {
      provide: PACKAGE_REPOSITORY,
      useClass: TypeOrmPackageRepository,
    },
  ],
  exports: [PackageUseCases],
})
export class PackagesModule {}
