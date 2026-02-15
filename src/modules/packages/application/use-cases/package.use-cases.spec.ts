import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PackageUseCases } from './package.use-cases';
import { PACKAGE_REPOSITORY } from '../../domain/repositories/package.repository';
import { Package, PackageStatus } from '../../domain/entities/package.entity';

const mockPackageRepository = {
  findById: jest.fn(),
  findByTrackingCode: jest.fn(),
  findByOwnerId: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockPackage: Package = new Package({
  id: 'pkg-uuid-1',
  trackingCode: 'TRK-20240101-00001',
  description: 'Laptop Dell XPS',
  weight: 2.5,
  originAddress: 'Lima, Perú',
  destinationAddress: 'Ayacucho, Perú',
  recipientName: 'María García',
  recipientPhone: '+51987654321',
  status: PackageStatus.PENDING,
  ownerId: 'user-uuid-1',
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PackageUseCases', () => {
  let packageUseCases: PackageUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackageUseCases,
        { provide: PACKAGE_REPOSITORY, useValue: mockPackageRepository },
      ],
    }).compile();

    packageUseCases = module.get<PackageUseCases>(PackageUseCases);
    jest.clearAllMocks();
  });

  describe('createPackage', () => {
    it('should create a package with auto-generated tracking code', async () => {
      const dto = {
        description: 'Test Package',
        weight: 1.5,
        originAddress: 'Lima',
        destinationAddress: 'Cusco',
        recipientName: 'Ana López',
        recipientPhone: '+51999111222',
      };

      mockPackageRepository.save.mockResolvedValue({ ...mockPackage, ...dto });
      const result = await packageUseCases.createPackage(dto, 'user-uuid-1');

      expect(result).toBeDefined();
      expect(mockPackageRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPackageById', () => {
    it('should return package when owner requests it', async () => {
      mockPackageRepository.findById.mockResolvedValue(mockPackage);
      const result = await packageUseCases.getPackageById('pkg-uuid-1', 'user-uuid-1', 'user');
      expect(result.id).toBe('pkg-uuid-1');
    });

    it('should return package when admin requests it', async () => {
      mockPackageRepository.findById.mockResolvedValue(mockPackage);
      const result = await packageUseCases.getPackageById('pkg-uuid-1', 'admin-uuid', 'admin');
      expect(result.id).toBe('pkg-uuid-1');
    });

    it('should throw ForbiddenException when non-owner requests it', async () => {
      mockPackageRepository.findById.mockResolvedValue(mockPackage);
      await expect(
        packageUseCases.getPackageById('pkg-uuid-1', 'other-user-uuid', 'user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent package', async () => {
      mockPackageRepository.findById.mockResolvedValue(null);
      await expect(
        packageUseCases.getPackageById('non-existent', 'user-uuid-1', 'user'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update status of a pending package', async () => {
      const updatedPkg = { ...mockPackage, status: PackageStatus.IN_TRANSIT };
      mockPackageRepository.findById.mockResolvedValue(mockPackage);
      mockPackageRepository.update.mockResolvedValue(updatedPkg);

      const result = await packageUseCases.updateStatus('pkg-uuid-1', {
        status: PackageStatus.IN_TRANSIT,
      });
      expect(result.status).toBe(PackageStatus.IN_TRANSIT);
    });

    it('should throw BadRequestException when updating delivered package', async () => {
      const deliveredPkg = new Package({ ...mockPackage, status: PackageStatus.DELIVERED });
      mockPackageRepository.findById.mockResolvedValue(deliveredPkg);

      await expect(
        packageUseCases.updateStatus('pkg-uuid-1', { status: PackageStatus.IN_TRANSIT }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
