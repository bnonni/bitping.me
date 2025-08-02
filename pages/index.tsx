import AlertCard from '@/components/AlertCard';
import BtcPriceChart from '@/components/BtcPriceChart';
import { API_HEADERS, APP_API_URL } from '@/lib/constants';
import { Exchange } from '@/lib/exchange';
import { AlertInvoice, AvailableExchanges, BtcPrice } from '@/lib/types';
import { Invoice } from '@/prisma/generated';
import logo from '@/public/bitping-logo.jpg';
import Image from 'next/image';
import React, { FormEvent, useEffect, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import QRCode from 'react-qr-code';

async function fetchHistory(exchange: AvailableExchanges = 'kraken'): Promise<BitPingServerSidePropsData> {
  try {
    const history = await Exchange.getExchangeInstance(exchange).getTickerHistory();
    const res = await fetch(`${APP_API_URL}/api/alert`, {
      method  : 'GET',
      headers : API_HEADERS,
    });
    const { alerts } = await res.json() ?? { alerts: [] };
    return {
      alerts,
      history,
      exchange,
    };
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return {
      alerts   : [],
      history  : [],
      exchange : 'kraken',
    };
  }
}

type BitPingServerSidePropsData = {
  alerts: AlertInvoice[];
  exchange: string;
  history: BtcPrice[];
}
/**
 * Fetch data from the server.
 * @returns {Promise<BitPingServerSideProps>}
 */
export async function getServerSideProps(): Promise<{ props: BitPingServerSidePropsData }> {
  try {
    const data = await fetchHistory('kraken');
    return { props: data };
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return {
      props : {
        alerts   : [],
        history  : [],
        exchange : 'kraken',
      },
    };
  }
}

/**
 * Home component to display the main page with BTC price chart and alert management.
 * @param {BitPingServerSideProps} serverSideProps - The server-side data containing BTC price history and alerts.
 * @property {BtcPrice[]} serverSideProps.history - The BTC price history data.
 * @property {AlertInvoice[]} serverSideProps.alerts - The list of existing alerts.
 * @returns {React.JSX.Element} - The rendered component.
 */
export default function Home(serverSideProps: BitPingServerSidePropsData): React.JSX.Element {
  /**
   * State variables for managing alert form inputs and alerts.
   */
  // Form state variables
  const [alertType, setAlertType] = useState<string>('select-alert-type');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneCarrier, setPhoneCarrier] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [triggerLogic, setTriggerLogic] = useState<string>('select-trigger');

  // Exchange state variables
  const [exchange, setExchange] = useState<string>('kraken');
  const [historyExchange, setHistoryExchange] = useState<string>('kraken');

  // Alerts and invoice state variables
  const [alerts, setAlerts] = useState<AlertInvoice[]>(serverSideProps.alerts || []);
  const [openQR, setOpenQR] = useState<boolean>(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice>({} as Invoice);
  const [expiration, setExpiration] = useState<string | null>(null);
  const [history, setHistory] = useState<BtcPrice[]>(serverSideProps.history || []);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  /**
   * Fetch alerts from the server every 5 seconds.
   * This effect runs once when the component mounts and sets up an interval to fetch alerts.
   * It cleans up the interval when the component unmounts.
   * @returns {void}
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Fetch the BTC price history from the selected exchange.
   * This effect runs when the historyExchange state changes.
   * It fetches the history data and updates the state.
   * @returns {void}
   */
  useEffect(() => {
    setHistoryLoading(true);
    const exchange = historyExchange ?? 'kraken';
    fetchHistory(exchange as AvailableExchanges).then(data => {
      setHistory(data.history);
      setHistoryLoading(false);
    });
  }, [historyExchange]);

  /**
   * Update the expiration time of the active invoice every second.
   * This effect runs when the QR code modal is open and an active invoice exists.
   * It calculates the remaining time until the invoice expires and updates the state.
   * If the invoice expires, it shows an error message and resets the state.
   * Check the status of the active invoice every 5 seconds.
   * This effect runs when the QR code modal is open and an active invoice exists.
   * It fetches the invoice status and updates the state if the invoice is paid.
   * @returns {void}
   */
  useEffect(() => {
    if (openQR && activeInvoice?.id) {
      // --- Invoice Status Checker (Every 5s) ---
      const statusInterval = setInterval(async () => {
        try {
          console.log('Checking invoice status for:', activeInvoice);
          const response = await fetch(`/api/invoice?id=${activeInvoice.id}`, {
            method  : 'GET',
            headers : API_HEADERS,
          });

          if (!response.ok) {
            toast.error(`Failed to check invoice status: ${response.statusText || 'Unknown error'}`, {
              style : { border: 'solid red 1px' },
            });
            return;
          }

          const { invoice }: { invoice: Invoice } = await response.json();

          if (invoice.status === 'paid') {
            toast.success('Invoice paid successfully!');
            setActiveInvoice(invoice);
            setOpenQR(false);
            clearInterval(statusInterval);
            clearInterval(expirationInterval);
          }

        } catch (error: any) {
          console.error('Error checking invoice status:', error);
          toast.error(`Failed to check invoice status: ${error?.message || 'Unknown error'}`, {
            style : { border: 'solid red 1px' },
          });
        }
      }, 1000); // every 1 second

      // --- Invoice Expiration Countdown (Every 1s) ---
      const expirationInterval = setInterval(() => {
        const newExpiration = calculateExpiration(activeInvoice.expiresAt);
        if (newExpiration === '0 minutes 0 seconds') {
          toast.error('Invoice has expired!');
          setOpenQR(false);
          setActiveInvoice({} as Invoice);
          setExpiration(null);
          clearInterval(statusInterval);
          clearInterval(expirationInterval);
          return;
        }
        setExpiration(newExpiration);
      }, 1000); // every 1 second

      // Cleanup intervals on unmount or deps change
      return () => {
        clearInterval(statusInterval);
        clearInterval(expirationInterval);
      };
    }
  }, [openQR, activeInvoice?.id]);

  /**
   * Reset the alert form to its initial state.
   * This function sets all form fields to their default values.
   * @returns {void}
   */
  function resetForm(): void {
    setAlertType('select-alert-type');
    setPhoneNumber('');
    setPhoneCarrier('');
    setEmailAddress('');
    setTriggerPrice('');
    setTriggerLogic('select-trigger');
  }

  /**
   * Fetch alerts from the server
   * This function makes a GET request to the /api/alert endpoint to retrieve the list of alerts.
   * It updates the state with the fetched alerts.
   * @returns {Promise<void>}
   */
  async function fetchAlerts(): Promise<void> {
    try {
      const res = await fetch('/api/alert', {
        method  : 'GET',
        headers : API_HEADERS,
      });
      const { alerts } = await res.json();
      setAlerts(alerts || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error(`Failed to fetch alerts: ${error?.message || 'Unknown error'}`, {
        style : { border: 'solid red 1px' },
      });
      setAlerts([]);
    }
  };

  /**
   * Handle form submission for creating a new alert
   * @param {FormEvent} e - The form event
   * @returns {Promise<void>}
   */
  async function handleSubmit(e: FormEvent): Promise<void> {
    const loadingId = toast.loading('Submitting alert ...');
    try {
      e.preventDefault();
      const form = {
        alertType,
        phoneNumber  : alertType === 'sms' ? phoneNumber : null,
        phoneCarrier : alertType === 'sms' ? phoneCarrier : null,
        emailAddress : alertType === 'email' ? emailAddress : null,
        triggerPrice : parseFloat(triggerPrice),
        triggerLogic,
        exchange,
      };
      const response = await fetch('/api/alert', {
        method  : 'POST',
        headers : API_HEADERS,
        body    : JSON.stringify(form),
      });
      toast.dismiss(loadingId);
      if (!response.ok) {
        toast.error(`Failed to create alert: ${response.statusText || 'Unknown error'}`, {
          style : { border: 'solid red 1px' },
        });
        return;
      }
      toast.success('Alert created successfully!');
      resetForm();
    } catch (error: any) {
      toast.dismiss(loadingId);
      console.error('Error creating alert:', error);
      toast.error(`Failed to create alert: ${error?.message || 'Unknown error'}`, {
        style : { border: 'solid red 1px' },
      });
    }
  };

  /**
   * Create a new invoice for an alert
   * @param {Invoice} invoice - The invoice object containing the alert ID
   * @returns {Promise<void>}
   */
  async function createNewInvoice(invoice: Invoice): Promise<void> {
    console.log('Creating new invoice for alert ID:', invoice.id);
    const loadingId = toast.loading('Creating new invoice...');
    try {
      if (!invoice.id) {
        toast.error('No invoice ID found to create a new invoice.');
        return;
      }
      const invoiceId = invoice.id;
      const response = await fetch(`/api/invoice/${invoiceId}`, {
        method  : 'PUT',
        headers : API_HEADERS,
      });
      toast.dismiss(loadingId);
      if (!response.ok) {
        toast.error(`Failed to create new invoice: ${response.status} - ${response.statusText}`, {
          style : { border: 'solid red 1px' },
        });
        return;
      }
      await response.json();
      fetchAlerts();
      toast.success('New invoice created successfully!');
    } catch (error: any) {
      toast.dismiss(loadingId);
      console.error('Error creating new invoice:', error);
      toast.error(`Failed to create new invoice: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        style : { border: 'solid red 1px' },
      });
    }
    toast.dismiss(loadingId);
  };

  /**
   * Calculate the expiration time of an invoice
   * @param {Date} expiresAt - The expiration date of the invoice
   * @returns {string} - The formatted expiration time in minutes and seconds
   */
  function calculateExpiration(expiresAt: Date): string {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diff = expirationDate.getTime() - now.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes ${seconds % 60} seconds`;
  };

  /**
   * Show QR code for payment
   * @param {AlertInvoice} alert - Alert object containing invoice details
   * @returns {Promise<void>}
   */
  async function showQR(alert: AlertInvoice): Promise<void> {
    console.log('alert', alert);
    setOpenQR(true);
    try {
      if (!alert?.invoice?.id) {
        toast.error('No invoice ID found to show QR code.');
        return;
      }

      setActiveInvoice(alert.invoice);

      const invoiceId = alert.invoice.id;
      const response = await fetch(`/api/invoice?id=${invoiceId}`, {
        method  : 'GET',
        headers : API_HEADERS,
      });

      if (!response.ok) {
        toast.error(`Failed to get invoice: ${response.status} - ${response.statusText}`, {
          style : { border: 'solid red 1px' },
        });
      }

      const { invoice }: { invoice: Invoice } = await response.json();
      if (invoice.status === 'paid') {
        toast.success('Invoice has been paid!');
      }
    } catch (error) {
      console.error('Error showing QR code:', error);
      toast.error(`Failed to show QR code: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        style : { border: 'solid red 1px' },
      });
    }
  };

  /**
   * Copy text to clipboard
   * @returns {Promise<void>}
   */
  async function copyToClipboard(): Promise<void> {
    try {
      const text = activeInvoice.paymentRequest;
      if (!text) {
        toast.error('No payment request to copy.');
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error: any) {
      toast.error(`Failed to copy to clipboard: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-black text-white">
      <div className="p-4">
        <Image alt="Bitping Logo" width={150} height={150} src={logo} />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <select
          value={alertType}
          onChange={e => setAlertType(e.target.value)}
          className="border px-2 py-1 rounded w-full bg-black text-white"
        >
          <option value="select-alert-type">Select Alert Type</option>
          <option value="sms">SMS</option>
          <option value="email">Email</option>
        </select>

        {
          alertType === 'sms' ?
            (
              <>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="border px-2 py-1 rounded bg-black text-white"
                />
                <select
                  value={phoneCarrier}
                  onChange={e => setPhoneCarrier(e.target.value)}
                  className="border px-2 py-1 rounded w-full bg-black text-white"
                >
                  <option value="select-carrier">Select Carrier</option>
                  <option value="vtext.com">Verizon</option>
                  <option value="txt.att.net">AT&T</option>
                  <option value="messaging.sprintpcs.com">Sprint</option>
                  <option value="tmomail.net">T-Mobile</option>
                </select>
              </>
            ) : (<></>)
        }

        {
          alertType === 'email' ? (
            <input
              type="email"
              placeholder="Email Address"
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
              className="border px-2 py-1 rounded bg-black text-white"
            />
          ) : (<></>)
        }

        {
          alertType !== 'select-alert-type' ? (
            <>
              <input
                type="number"
                placeholder="Price"
                value={triggerPrice}
                onChange={e => setTriggerPrice(e.target.value)}
                className="border px-2 py-1 rounded bg-black text-white"
              />
              <select
                value={triggerLogic}
                onChange={e => setTriggerLogic(e.target.value as 'above' | 'below')}
                className="border px-2 py-1 rounded w-full bg-black text-white"
              >
                <option value="select-trigger">Select Trigger</option>
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>

              <select
                value={exchange}
                onChange={e => setExchange(e.target.value)}
                className="border px-2 py-1 rounded w-full bg-black text-white"
              >
                <option value="select-exchange">Select Exchange</option>
                <option value="kraken">Kraken</option>
                <option value="mempool">Mempool</option>
                <option value="coinbase">Coinbase</option>
                <option value="binance">Binance</option>
                <option value="coingecko">CoinGecko</option>
                <option value="bitstamp">Bitstamp</option>
              </select>
            </>
          ) : (<></>)
        }

        <button type="submit" className="bg-white text-black py-2 px-4 rounded font-bold">
          Submit Alert
        </button>
      </form>
      <hr className="w-full max-w-4xl my-10 border-gray-700" />
      <div className="w-full max-w-4xl h-64">
        {
          historyLoading
            ? (<div className='text-center py-[6rem]'>Loading...</div>)
            : (<BtcPriceChart data={{ history, exchange: historyExchange }} />)
        }
      </div>
      {
        !historyLoading && (
          <div className='mt-10'>
            <select
              value={historyExchange}
              onChange={e => setHistoryExchange(e.target.value)}
              className="border px-2 py-1 rounded w-full bg-black text-white"
            >
              <option value="select-history-exchange">Select Exchange</option>
              <option value="kraken">Kraken</option>
              <option value="mempool">Mempool</option>
            </select>
          </div>
        )
      }
      <hr className="w-full max-w-4xl my-4 border-gray-700" />
      <div className="w-full max-w-4xl">
        <h2 className="text-lg text-center font-semibold mb-2">Submitted Alerts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {
            alerts.map((alert, i) => {
              const { invoice, paid } = alert;
              const expired = new Date() > new Date(invoice?.expiresAt);
              return (
                <div
                  key={i}
                  className="text-center border border-gray-700 rounded-lg p-2 flex flex-col gap-2 bg-[#111]"
                >
                  <AlertCard data={{ alert, expired }} />

                  {
                    !paid && expired ? (
                      <button
                        onClick={async () => await createNewInvoice(alert.invoice)}
                        className="bg-red-500 text-white py-1 px-2 rounded text-sm">
                          New Invoice
                      </button>
                    ) : (
                      <button
                        disabled={paid || !invoice?.paymentRequest}
                        onClick={async () => await showQR(alert)}
                        className={
                          (paid
                            ? 'bg-gray-500'
                            : 'bg-green-500') +
                            ' text-white py-1 px-2 rounded text-sm transition-transform duration-100 ease-in-out hover:scale-95 transform-gpu will-change-transform'
                        }
                      >
                        <span className="block text-sm scale-100"> {/* force text scale */}
                          {paid ? 'Paid ✅' : 'Pay'}
                        </span>
                      </button>

                    )
                  }
                </div>
              );
            })
          }
          {
            openQR && activeInvoice && activeInvoice?.paymentRequest && activeInvoice.status !== 'paid' ? (
              <div className="text-center fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <button
                  onClick={() => setOpenQR(false)}
                  className="absolute top-4 right-6 text-white text-3xl">
                    ✕
                </button>
                <div className="bg-white px-5 py-4 rounded shadow-lg relative max-w-[15em] z-100">
                  <div className="mb-4">
                    <p className="text-black">Expires In</p>
                    <p className="text-black">{expiration}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-black">Invoice ID</p>
                    <p className="text-black">{activeInvoice.id}</p>
                  </div>
                  {
                    expiration && expiration !== '0 minutes 0 seconds' ? (
                      (
                        <div className="grid grid-col-1 text-black text-center gap-4">
                          <QRCode size={200} value={activeInvoice.paymentRequest} />
                          <button
                            onClick={copyToClipboard}
                            className="w-full bg-black hover:bg-red-500 text-white py-2 px-4 rounded">
                              Copy Invoice
                          </button>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={async () => await createNewInvoice(activeInvoice)}
                        className="w-full bg-black hover:bg-red-500 text-white py-2 px-4 rounded">
                          New Invoice
                      </button>
                    )
                  }
                </div>
              </div>
            ) : (<></>)
          }
        </div>
      </div>
      <Toaster />
    </div>
  );
}
