import { TrackingEvent } from '../entities/tracking-event.entity';

export const TRACKING_REPOSITORY = 'TRACKING_REPOSITORY';

export interface TrackingRepository {
  findByPackageId(packageId: string): Promise<TrackingEvent[]>;
  save(event: TrackingEvent): Promise<TrackingEvent>;
}
