import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackageStatus } from '../../domain/entities/package.entity';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty({ example: 'Laptop Dell XPS 15', description: 'Descripción del paquete' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: 2.5, description: 'Peso en kg' })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  weight: number;

  @ApiProperty({ example: 'Av. Arequipa 1234, Lima, Perú' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  originAddress: string;

  @ApiProperty({ example: 'Calle Los Pinos 567, Ayacucho, Perú' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  destinationAddress: string;

  @ApiProperty({ example: 'María García' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  recipientName: string;

  @ApiProperty({ example: '+51987654321' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  recipientPhone: string;
}

export class UpdatePackageStatusDto {
  @ApiProperty({ enum: PackageStatus, example: PackageStatus.IN_TRANSIT })
  @IsEnum(PackageStatus)
  status: PackageStatus;
}

export class PackageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'TRK-20240101-001' })
  trackingCode: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  originAddress: string;

  @ApiProperty()
  destinationAddress: string;

  @ApiProperty()
  recipientName: string;

  @ApiProperty()
  recipientPhone: string;

  @ApiProperty({ enum: PackageStatus })
  status: PackageStatus;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
