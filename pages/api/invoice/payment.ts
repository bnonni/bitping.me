import prisma from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check for the API key in the Authorization header
    if (req.headers.authorization !== `Basic ${process.env.APP_API_KEY}`) return res.status(401).json({ error: 'Unauthorized' });

    // TODO: Not implemented - GET /api/invoice/payment - Check payment status and return details
    if(req.method === 'GET') {
      return res.status(500).json({ error: 'Not implemented' });
    }

    // POST /api/invoice/payment: Process a payment
    if( req.method === 'POST') {
      const alertId = req.body.alertId;

      await prisma.alert.update({
        where : { id: alertId },
        data  : { paid: true },
      });

      return res.status(200).json({ alertId, status: 'paid' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}