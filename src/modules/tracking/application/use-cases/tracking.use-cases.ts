import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  TrackingRepository,
  TRACKING_REPOSITORY,
} from '../../domain/repositories/tracking.repository';
import { TrackingEvent } from '../../domain/entities/tracking-event.entity';
import {
  CreateTrackingEventDto,
  TrackingEventResponseDto,
} from '../dtos/tracking.dto';
import { PackageUseCases } from '../../../packages/application/use-cases/package.use-cases';

@Injectable()
export class TrackingUseCases {
  constructor(
    @Inject(TRACKING_REPOSITORY)
    private readonly trackingRepository: TrackingRepository,
    private readonly packageUseCases: PackageUseCases,
  ) {}

  async registerEvent(
    packageId: string,
    dto: CreateTrackingEventDto,
    registeredBy: string,
  ): Promise<TrackingEventResponseDto> {
    // Validate package exists (will throw NotFoundException if not)
    await this.packageUseCases.getPackageByTrackingCodeOrId(packageId);

    const event = new TrackingEvent({
      packageId,
      location: dto.location,
      status: dto.status,
      description: dto.description ?? null,
      registeredBy,
      timestamp: new Date(),
    });

    const saved = await this.trackingRepository.save(event);
    return this.toResponse(saved);
  }

  async getHistory(packageId: string): Promise<TrackingEventResponseDto[]> {
    // Validate package exists
    await this.packageUseCases.getPackageByTrackingCodeOrId(packageId);

    const events = await this.trackingRepository.findByPackageId(packageId);
    return events.map((e) => this.toResponse(e));
  }

  private toResponse(event: TrackingEvent): TrackingEventResponseDto {
    return { ...event } as TrackingEventResponseDto;
  }
}
