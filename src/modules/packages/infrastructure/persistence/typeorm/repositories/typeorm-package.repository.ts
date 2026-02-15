import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageRepository } from '@modules/packages/domain/repositories/package.repository';
import { Package } from '@modules/packages/domain/entities/package.entity';
import { PackageOrmEntity } from '@modules/packages/infrastructure/persistence/typeorm/entities/package.orm-entity';

@Injectable()
export class TypeOrmPackageRepository implements PackageRepository {
  constructor(
    @InjectRepository(PackageOrmEntity)
    private readonly repo: Repository<PackageOrmEntity>,
  ) {}

  async findById(id: string): Promise<Package | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByTrackingCode(trackingCode: string): Promise<Package | null> {
    const entity = await this.repo.findOne({ where: { trackingCode } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Package[]> {
    const entities = await this.repo.find({ where: { ownerId } });
    return entities.map((e) => this.toDomain(e));
  }

  async findAll(): Promise<Package[]> {
    const entities = await this.repo.find();
    return entities.map((e) => this.toDomain(e));
  }

  async save(pkg: Package): Promise<Package> {
    const entity = this.toOrm(pkg);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, data: Partial<Package>): Promise<Package> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  private toDomain(entity: PackageOrmEntity): Package {
    return new Package({
      id: entity.id,
      trackingCode: entity.trackingCode,
      description: entity.description,
      weight: Number(entity.weight),
      originAddress: entity.originAddress,
      destinationAddress: entity.destinationAddress,
      recipientName: entity.recipientName,
      recipientPhone: entity.recipientPhone,
      status: entity.status,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toOrm(pkg: Package): Partial<PackageOrmEntity> {
    return {
      id: pkg.id,
      trackingCode: pkg.trackingCode,
      description: pkg.description,
      weight: pkg.weight,
      originAddress: pkg.originAddress,
      destinationAddress: pkg.destinationAddress,
      recipientName: pkg.recipientName,
      recipientPhone: pkg.recipientPhone,
      status: pkg.status,
      ownerId: pkg.ownerId,
    };
  }
}
