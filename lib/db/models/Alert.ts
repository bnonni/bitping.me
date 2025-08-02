import { BitPingInvoice } from './Invoice';
import { Maybe } from '../../types';

export interface PrismaAlert {
  id: string;
  createdAt: Date;
  alertType: 'sms' | 'email';
  phoneNumber?: string;
  phoneCarrier?: string;
  emailAddress?: string;
  triggerPrice: number;
  triggerLogic: 'above' | 'below';
  sent: boolean;
  paid: boolean;
  invoice?: BitPingInvoice;
}

export class BitPingAlert implements PrismaAlert {
  id: string;
  createdAt: Date;
  alertType: 'sms' | 'email';
  phoneNumber?: string;
  phoneCarrier?: string;
  emailAddress?: string;
  triggerPrice: number;
  triggerLogic: 'above' | 'below';
  sent: boolean;
  paid: boolean;
  invoice?: BitPingInvoice;

  constructor(data: Maybe<PrismaAlert>) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.alertType = data.alertType;
    this.phoneNumber = data?.phoneNumber;
    this.phoneCarrier = data?.phoneCarrier;
    this.emailAddress = data?.emailAddress;
    this.triggerPrice = data.triggerPrice;
    this.triggerLogic = data.triggerLogic;
    this.sent = data.sent;
    this.paid = data.paid;
  }

  static fromJSON(data: Maybe<PrismaAlert>): BitPingAlert {
    return new BitPingAlert(data);
  }
}