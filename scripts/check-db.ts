import prisma from '@/lib/db';

// const invoices = await prisma.invoice.deleteMany({ where: { status: 'expired' } });
const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
console.log('Invoices:', invoices);

// const alerts = await prisma.alert.deleteMany({ where: { sent: false } });
const alerts = await prisma.alert.findMany({ orderBy: { createdAt: 'desc' }, include: { invoice: true } });
console.log('Alerts:', alerts);
