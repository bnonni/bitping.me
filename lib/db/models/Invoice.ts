import { Invoice } from '@/prisma/generated';
import { Maybe } from '../../types';

export interface SpeedInvoice extends Invoice {
  id: string;
  object: 'payment';
  status: string;
  currency: 'USD';
  amount: number;
  conversion: number;
  exchange_rate: number;
  target_currency: 'SATS';
  target_amount: number;
  payment_methods: ['lightning'];
  payment_method_options: {
    on_chain?: null | {
      id: string;
      address: string;
    };
    lightning: {
      id: string;
      payment_request: string;
    };
  };
  transfers: Array<any>;
  ttl: number;
  expires_at: number;
  metadata: Record<string, any>;
  created: number;
  modified: number
}

export class BitPingInvoice implements Invoice {
  id: string;
  status: string;
  currency: string;
  amount: number;
  paymentRequest: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(data: Maybe<SpeedInvoice>) {
    this.id = data?.id;
    this.status = data?.status;
    this.currency = data?.currency;
    this.amount = data?.amount;
    this.paymentRequest = data?.payment_method_options.lightning.payment_request;
    this.expiresAt = new Date(data.expires_at);
    this.createdAt = new Date(data.created);
  }

  static fromJSON(data: Maybe<SpeedInvoice>): BitPingInvoice {
    return new BitPingInvoice(data);
  }
}