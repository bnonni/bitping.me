import { API_HEADERS, APP_API_URL, SPEED_API_HEADERS } from '@/lib/constants';
import prisma from '@/lib/db';
import type { SpeedInvoice } from '@/lib/db/models/Invoice';
import type { Alert, Invoice } from '@/prisma/generated';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    /**
     * GET /api/alert: Fetch all alerts
     */
    if(req.method === 'GET') {
      // Fetch all alerts from the database, ordered by creation date
      const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, include: { invoice: true } });

      SPEED_API_HEADERS.authorization = `Basic ${process.env.SPEED_API_KEY}`;
      // Fetch a new invoice from the Speed API
      const response = await fetch(`${process.env.SPEED_API_URL}/payments`, {
        method  : 'GET',
        headers : SPEED_API_HEADERS
      });

      // Check if the response is ok, if not log the error and return a 500 status
      if (!response.ok) {
        console.error('Error reading invoices:', response);
        return res.status(500).json({ error: 'Failed to read invoices' });
      }

      // Parse the response data
      const { data: invoices }: { data: SpeedInvoice[] } = await response.json();

      // Iterate over each invoice and update the status in the database
      for(const invoice of invoices) {
        // Find the invoice that matches the alert
        const alert = await prisma.alert.findUnique({ where: { invoiceId: invoice.id }, include: { invoice: true } });
        // If no alert is found for the invoice, log a warning and continue to the next iteration
        if(!alert) {
          console.warn(`No alert found for invoice ${invoice.id}`);
          continue;
        }
        // Else update the invoice status in the database
        await prisma.invoice.update({ where: { id: invoice.id }, data: { status: invoice.status }});
        // And update the alert's paid status based on the invoice status
        await prisma.alert.update({ where: { invoiceId: invoice.id }, data: { paid: invoice.status === 'paid' } });
      }

      // Return the alerts in the response
      return res.status(200).json({ alerts });
    }

    /**
     * POST /api/alert: Create a new alert
     */
    if (req.method === 'POST') {
      let {
        alertType,
        phoneNumber,
        phoneCarrier,
        emailAddress,
        triggerPrice,
        triggerLogic,
        exchange,
      } = req.body;

      if (!(alertType || triggerPrice || triggerLogic || exchange)) {
        return res.status(400).json({ error: 'Missing required alert fields' });
      }

      if(!phoneNumber && !emailAddress) {
        return res.status(400).json({ error: 'Missing required contact fields' });
      }

      if(phoneNumber && !phoneCarrier) {
        return res.status(400).json({ error: 'Missing required sms fields' });
      }

      // Create the alert in the database
      const { id }: Alert = await prisma.alert.create({ data: req.body });

      // Request an invoice from BitPing API
      const response = await fetch(`${APP_API_URL}/api/invoice`, {
        method  : 'POST',
        headers : API_HEADERS,
        body    : JSON.stringify({ id }),
      });

      // If the response is not ok, log the error and return a 500 status
      if (!response.ok) {
        console.error('Error creating payment request:', response);
        return res.status(500).json({ error: 'Failed to create payment request' });
      }

      // Parse the response data
      const { invoice }: { invoice: Invoice } = await response.json();

      // Link the invoice to the alert in the database
      const alert = await prisma.alert.update({
        where   : { id },
        data    : { invoice: { connect: { id: invoice.id } },},
        include : { invoice: true },
      });

      return res.status(201).json({ alert });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error reading or creating alert(s):', error.message);
    return res.status(500).json({ error, message: error.message || 'Internal Server Error' });
  }
}