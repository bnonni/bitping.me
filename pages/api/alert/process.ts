import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';
import { Exchange } from '@/lib/exchange';
import pinger from '@/lib/bitpinger';
import { AvailableExchanges } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.headers.authorization !== `Basic ${process.env.APP_API_KEY}`) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const alerts = await prisma.alert.findMany({
      where : { sent: false, paid: true, },
    });

    const sentIds: string[] = [];

    for (const alert of alerts) {
      const exchange = Exchange.getExchangeInstance(alert.exchange as AvailableExchanges);
      const price = await exchange.getTicker();

      const conditionMet =
      (alert.triggerLogic === 'above' && price >= alert.triggerPrice) ||
      (alert.triggerLogic === 'below' && price <= alert.triggerPrice);

      if (!conditionMet) continue;

      if (alert.alertType === 'sms') {
        await pinger.sendText(price, alert.triggerLogic, alert.triggerPrice, `${alert.phoneNumber}@${alert.phoneCarrier}`);
      } else {
        await pinger.sendEmail(price, alert.triggerLogic, alert.triggerPrice, alert.emailAddress!);
      }

      await prisma.alert.update({
        where : { id: alert.id },
        data  : { sent: true },
      });
      sentIds.push(alert.id);
    }

    return res.status(200).json({ checked: alerts.length, sent: sentIds.length, sentIds });
  } catch (error: any) {
    console.error('Error processing alerts:', error.message);
    return res.status(500).json({ error, message: error.message || 'Internal Server Error' });
  }
}