export enum PackageStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class Package {
  id: string;
  trackingCode: string;
  description: string;
  weight: number;
  originAddress: string;
  destinationAddress: string;
  recipientName: string;
  recipientPhone: string;
  status: PackageStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<Package>) {
    Object.assign(this, partial);
  }

  canBeUpdated(): boolean {
    return this.status !== PackageStatus.DELIVERED && this.status !== PackageStatus.CANCELLED;
  }
}
