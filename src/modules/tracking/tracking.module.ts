import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TrackingEventSchema,
  TrackingEventMongoSchema,
} from './infrastructure/persistence/mongoose/schemas/tracking-event.schema';
import { MongooseTrackingRepository } from './infrastructure/persistence/mongoose/repositories/mongoose-tracking.repository';
import { TrackingUseCases } from './application/use-cases/tracking.use-cases';
import { TrackingController } from './infrastructure/controllers/tracking.controller';
import { TRACKING_REPOSITORY } from './domain/repositories/tracking.repository';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrackingEventSchema.name, schema: TrackingEventMongoSchema },
    ]),
    PackagesModule,
  ],
  controllers: [TrackingController],
  providers: [
    TrackingUseCases,
    {
      provide: TRACKING_REPOSITORY,
      useClass: MongooseTrackingRepository,
    },
  ],
})
export class TrackingModule {}
