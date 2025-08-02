import { API_HEADERS, APP_API_URL } from '@/lib/constants';
import prisma from '@/lib/db';
import { isFailureStatus } from '@/lib/utils';
import type { Invoice } from '@/prisma/generated';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    /**
     * PUT /api/invoice/:id: The alert.invoice has expired. Create a new alert.invoice.
     */
    if(req.method === 'PUT') {
      // Validate the request body, this should be an invoice id.
      const { id } = req.query;
      if(!id) {
        return res.status(400).json({ error: 'Missing or invalid ID' });
      }

      const alert = await prisma.alert.findUnique({ where: { invoiceId: String(id) } });

      if(!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      const response = await fetch(`${APP_API_URL}/api/invoice`, {
        method  : 'POST',
        headers : API_HEADERS,
        body    : JSON.stringify({ id: alert.id })
      });

      if(isFailureStatus(response.status)) {
        console.error('Error fetching invoice:', response);
        return res.status(response.status).json({ error: 'Failed to fetch invoice' });
      }

      const { invoice }: { invoice: Invoice } = await response.json();

      // Link the invoice to the alert in the database
      await prisma.alert.update({
        where   : { id: alert.id },
        data    : { invoice: { connect: { id: invoice.id } },},
        include : { invoice: true },
      });

      return res.status(response.status).json({ invoice });
    }

    // If the method is not PATCH, return a 405 Method Not Allowed error
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error Patching Invoice:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error Patching Invoice' });
  }
}