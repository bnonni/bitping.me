import { SPEED_API_HEADERS } from '@/lib/constants';
import prisma from '@/lib/db';
import { BitPingInvoice, SpeedInvoice } from '@/lib/db/models/Invoice';
import type { Invoice } from '@/prisma/generated';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    /**
     * GET /api/invoice: Read an invoice by ID
     */
    if (req.method === 'GET') {
      // Extract the ID from the query parameters
      const { id } = req.query ?? {};

      // Validate the ID parameter
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid ID' });
      }

      // Fetch the invoice from the database using Prisma
      const invoice: Invoice | null = await prisma.invoice.findUnique({ where: { id }});

      // If the invoice is not found, return a 404 error
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Return the invoice in the response
      return res.status(200).json({ invoice });
    }

    /**
     * POST /api/invoice: Create a new invoice for an alert.
     */
    if(req.method === 'POST') {
      // Validate the request body, this should be an alert.id
      const { id } = req.body ?? {};
      if(!id) {
        return res.status(400).json({ error: 'Missing or invalid ID' });
      }

      // Fetch the full alertInvoice from the database
      const alert = await prisma.alert.findUnique({ where: { id: String(id) } });

      // If the alert is not found, return a 404 error
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      // Fetch a new invoice from the Speed API
      SPEED_API_HEADERS.authorization = `Basic ${process.env.SPEED_API_KEY}`;
      const response = await fetch(`${process.env.SPEED_API_URL}/payments`, {
        method  : 'POST',
        headers : SPEED_API_HEADERS,
        body    : JSON.stringify({
          currency        : 'USD',
          amount          : 1,
          target_currency : 'SATS',
          payment_methods : ['lightning'],
          metadata        : alert
        })
      });

      if (!response.ok) {
        console.error('Error creating invoice:', response);
        return res.status(500).json({ error: 'Failed to create invoice' });
      }
      // Parse the response data
      const data: SpeedInvoice = await response.json();

      // Create a new invoice in the database
      const invoice: Invoice = await prisma.invoice.create({ data: BitPingInvoice.fromJSON(data) });

      return res.status(201).json({ invoice });
    }

    // If the method is not GET or POST, return a 405 Method Not Allowed error
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error Reading Invoice:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error Reading Invoice' });
  }
}