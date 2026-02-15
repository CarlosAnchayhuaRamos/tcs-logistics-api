export class TrackingEvent {
  id: string;
  packageId: string;
  location: string;
  status: string;
  description: string;
  registeredBy: string;
  timestamp: Date;

  constructor(partial?: Partial<TrackingEvent>) {
    Object.assign(this, partial);
  }
}
