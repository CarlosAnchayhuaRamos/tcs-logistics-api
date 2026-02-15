import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrackingRepository } from '@modules/tracking/domain/repositories/tracking.repository';
import { TrackingEvent } from '@modules/tracking/domain/entities/tracking-event.entity';
import {
  TrackingEventSchema,
  TrackingEventDocument,
} from '../schemas/tracking-event.schema';

@Injectable()
export class MongooseTrackingRepository implements TrackingRepository {
  constructor(
    @InjectModel(TrackingEventSchema.name)
    private readonly model: Model<TrackingEventDocument>,
  ) {}

  async findByPackageId(packageId: string): Promise<TrackingEvent[]> {
    const docs = await this.model
      .find({ packageId })
      .sort({ timestamp: -1 })
      .exec();
    return docs.map((d) => this.toDomain(d));
  }

  async save(event: TrackingEvent): Promise<TrackingEvent> {
    const doc = await this.model.create({
      packageId: event.packageId,
      location: event.location,
      status: event.status,
      description: event.description,
      registeredBy: event.registeredBy,
      timestamp: event.timestamp,
    });
    return this.toDomain(doc);
  }

  private toDomain(doc: TrackingEventDocument): TrackingEvent {
    return new TrackingEvent({
      id: doc._id.toString(),
      packageId: doc.packageId,
      location: doc.location,
      status: doc.status,
      description: doc.description,
      registeredBy: doc.registeredBy,
      timestamp: doc.timestamp,
    });
  }
}
