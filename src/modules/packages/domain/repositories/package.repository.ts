import { Package } from '../entities/package.entity';

export const PACKAGE_REPOSITORY = 'PACKAGE_REPOSITORY';

export interface PackageRepository {
  findById(id: string): Promise<Package | null>;
  findByTrackingCode(trackingCode: string): Promise<Package | null>;
  findByOwnerId(ownerId: string): Promise<Package[]>;
  findAll(): Promise<Package[]>;
  save(pkg: Package): Promise<Package>;
  update(id: string, data: Partial<Package>): Promise<Package>;
}
