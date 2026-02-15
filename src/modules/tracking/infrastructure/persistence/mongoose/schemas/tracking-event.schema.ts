import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrackingEventDocument = TrackingEventSchema & Document;

@Schema({ collection: 'tracking_events', timestamps: false })
export class TrackingEventSchema {
  @Prop({ required: true, index: true })
  packageId: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  status: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  registeredBy: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;
}

export const TrackingEventMongoSchema = SchemaFactory.createForClass(
  TrackingEventSchema,
);
