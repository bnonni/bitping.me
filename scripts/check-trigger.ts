import { Exchange } from '@/lib/exchange';
import pinger from '../lib/bitpinger';

const { TEST_EMAIL_ADDRESS, TEST_PHONE_CARRIER, TEST_PHONE_NUMBER } = process.env;

const exchange = Exchange.getExchangeInstance('kraken');

async function SMTP() {
  const price = await exchange.getTicker();
  try {
    const data = '95000';
    const trigger = parseFloat(data);
    if (trigger && price >= trigger) {
      await pinger.sendEmail(price, 'above', trigger, TEST_EMAIL_ADDRESS || '');
      console.log(`Alert sent via smtp at ${price} to ${TEST_EMAIL_ADDRESS || ''} (trigger was ${trigger})`);
    } else {
      console.log(`Price: ${price} < Trigger: ${trigger}`);
    }
  } catch (e) {
    console.error('Error running alert check:', e);
  }
}

async function SMS() {
  const ALERT_SMS = `${TEST_PHONE_NUMBER}@${TEST_PHONE_CARRIER}`;
  const price = await exchange.getTicker();
  try {
    const data = '95000';
    const trigger = parseFloat(data);
    if (trigger && price >= trigger) {
      await pinger.sendText(price, 'above', trigger, ALERT_SMS);
      console.log(`Alert sent via sms at ${price} to ${ALERT_SMS} (trigger was ${trigger})`);
    } else {
      console.log(`Price: ${price} < Trigger: ${trigger}`);
    }
  } catch (e) {
    console.error('Error running alert check:', e);
  }
}

await SMTP();
await SMS();