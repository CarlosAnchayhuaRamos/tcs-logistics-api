import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  PackageRepository,
  PACKAGE_REPOSITORY,
} from '../../domain/repositories/package.repository';
import {
  Package,
  PackageStatus,
} from '../../domain/entities/package.entity';
import {
  CreatePackageDto,
  PackageResponseDto,
  UpdatePackageStatusDto,
} from '../dtos/package.dto';

@Injectable()
export class PackageUseCases {
  constructor(
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: PackageRepository,
  ) {}

  async createPackage(
    dto: CreatePackageDto,
    ownerId: string,
  ): Promise<PackageResponseDto> {
    const trackingCode = this.generateTrackingCode();

    const pkg = new Package({
      id: uuidv4(),
      trackingCode,
      description: dto.description,
      weight: dto.weight,
      originAddress: dto.originAddress,
      destinationAddress: dto.destinationAddress,
      recipientName: dto.recipientName,
      recipientPhone: dto.recipientPhone,
      status: PackageStatus.PENDING,
      ownerId,
    });

    const saved = await this.packageRepository.save(pkg);
    return this.toResponse(saved);
  }

  async getPackageById(
    id: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<PackageResponseDto> {
    const pkg = await this.findOrFail(id);
    if (requesterRole !== 'admin' && pkg.ownerId !== requesterId) {
      throw new ForbiddenException('No tienes acceso a este paquete');
    }
    return this.toResponse(pkg);
  }

  async getMyPackages(ownerId: string): Promise<PackageResponseDto[]> {
    const packages = await this.packageRepository.findByOwnerId(ownerId);
    return packages.map((p) => this.toResponse(p));
  }

  async getAllPackages(): Promise<PackageResponseDto[]> {
    const packages = await this.packageRepository.findAll();
    return packages.map((p) => this.toResponse(p));
  }

  async updateStatus(
    id: string,
    dto: UpdatePackageStatusDto,
  ): Promise<PackageResponseDto> {
    const pkg = await this.findOrFail(id);

    if (!pkg.canBeUpdated()) {
      throw new BadRequestException(
        `El paquete con estado "${pkg.status}" no puede actualizarse`,
      );
    }

    const updated = await this.packageRepository.update(id, {
      status: dto.status,
    });
    return this.toResponse(updated);
  }

  async getPackageByTrackingCode(trackingCode: string): Promise<PackageResponseDto> {
    const pkg = await this.packageRepository.findByTrackingCode(trackingCode);
    if (!pkg) throw new NotFoundException(`Código de rastreo ${trackingCode} no encontrado`);
    return this.toResponse(pkg);
  }

  // Used by tracking module: accepts either UUID or tracking code
  async getPackageByTrackingCodeOrId(packageIdOrCode: string): Promise<PackageResponseDto> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(packageIdOrCode)) {
      const pkg = await this.packageRepository.findById(packageIdOrCode);
      if (!pkg) throw new NotFoundException(`Paquete ${packageIdOrCode} no encontrado`);
      return this.toResponse(pkg);
    }
    return this.getPackageByTrackingCode(packageIdOrCode);
  }

  private async findOrFail(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findById(id);
    if (!pkg) throw new NotFoundException(`Paquete ${id} no encontrado`);
    return pkg;
  }

  private generateTrackingCode(): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TRK-${dateStr}-${random}`;
  }

  private toResponse(pkg: Package): PackageResponseDto {
    return { ...pkg } as PackageResponseDto;
  }
}
