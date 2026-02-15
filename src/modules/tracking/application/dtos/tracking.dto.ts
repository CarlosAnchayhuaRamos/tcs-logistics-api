import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrackingEventDto {
  @ApiProperty({ example: 'Lima, Almacén Central', description: 'Ubicación actual del paquete' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @ApiProperty({ example: 'in_transit', description: 'Estado en este punto del recorrido' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status: string;

  @ApiPropertyOptional({ example: 'Paquete recibido en almacén central para despacho' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class TrackingEventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  packageId: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  registeredBy: string;

  @ApiProperty()
  timestamp: Date;
}
