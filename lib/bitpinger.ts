import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { IMailgunClient } from 'mailgun.js/Interfaces/MailgunClient/IMailgunClient';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * BitPinger class for sending alerts via SMS and SMTP using Mailgun.
 * It supports sending both price alerts and OTPs.
 * @class BitPinger
 * @type {BitPinger}
 */
export class BitPinger {
  /**
   * Mailgun client for sending SMS messages.
   * @type {Mailgun}
   */
  public static sms: IMailgunClient = new Mailgun(FormData).client({
    username : 'api',
    key      : process.env.MAILGUN_SENDING_API_KEY!,
  });

  /**
   * SMTP transporter for sending emails via Mailgun.
   * @type {Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>}
   */
  public static smtp: Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> = nodemailer.createTransport({
    host : 'smtp.mailgun.org',
    port : 587,
    auth : {
      user : process.env.MAILGUN_FROM_EMAIL,
      pass : process.env.MAILGUN_SMTP_PASSWORD,
    },
  });

  /**
   * Default sender email address and subject for alerts.
   * @type {string}
   */
  public from: string;

  /**
   * Default subject for alerts.
   * @type {string}
   */
  public subject: string;

  /**
   * Default domain for sending SMS messages.
   * @type {string}
   */
  public domain: string;

  /**
   * Creates an instance of the BitPinger class.
   * @param {string} [from] - The sender's email address.
   * @param {string} [subject] - The subject of the email.
   * @param {string} [domain] - The domain for sending SMS messages.
   */
  constructor(from?: string, subject?: string, domain?: string) {
    this.from = from || `${process.env.APP_NAME || 'BitPingMe'} Postmaster <${process.env.MAILGUN_FROM_EMAIL || 'postmaster@bitping.me'}>`;
    this.subject = subject || `🚨 ${process.env.APP_NAME} Alert 🚨`;
    this.domain = domain || process.env.MAILGUN_DOMAIN || 'bitping.me';
  }

  /**
   * Sends an email alert.
   * @param {number} price - The current price of BTC/USD.
   * @param {string} logic - The logic determining the alert.
   * @param {number} trigger - The trigger price for the alert.
   * @param {string} to - The recipient's email address.
   * @returns {Promise<boolean>} - A promise that resolves to true if the email was sent successfully.
   */
  public async sendEmail(price: number, logic: string, trigger: number, to: string): Promise<boolean> {
    try {
      const data = await BitPinger.smtp.sendMail({
        headers : { 'Return-Path': this.from, },
        from    : this.from,
        to      : [to],
        subject : this.subject,
        text    : `BTC/USD $${price.toLocaleString()} is ${logic} your trigger price of $${trigger.toLocaleString()}`,
      });
      console.log('BitPinger: Mailgun SMTP response:', data);
      return true;
    } catch (error: any) {
      console.error('BitPinger: Error sending email:', error);
      return false;
    }
  }

  /**
   * Sends an email alert.
   * @param {number} price - The current price of BTC/USD.
   * @param {string} logic - The logic determining the alert.
   * @param {number} trigger - The trigger price for the alert.
   * @param {string} to - The recipient's email address.
   * @returns {Promise<boolean>} - A promise that resolves to true if the email was sent successfully.
   */
  public async sendText(price: number, logic: string, trigger: number, to: string): Promise<boolean> {
    try {
      const data = await BitPinger.sms.messages.create(this.domain, {
        from    : this.from,
        to      : [to],
        subject : this.subject,
        text    : `BTC/USD $${price.toLocaleString()} is ${logic} your trigger price of $${trigger.toLocaleString()}`,
      });
      console.log('BitPinger: Mailgun SMS response:', data);
      return true;
    } catch (error: any) {
      console.error('BitPinger: Error sending text:', error);
      return false;
    }
  }

  /**
   * Send an OTP code via the specified protocol.
   * @param {string} protocol - The protocol to use ('smtp' or 'sms').
   * @param {string} code - The OTP code to send.
   * @param {string} to - The recipient's phone number or email address.
   * @returns {Promise<boolean>} - A promise that resolves to true if the OTP was sent successfully.
   */
  public async sendOtp(protocol: string, code: string, to: string): Promise<boolean> {
    switch (protocol) {
      case 'smtp':
        return this.sendOtpEmail(code, to);
      case 'sms':
        return this.sendOtpText(code, to);
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  }

  /**
   * Send an OTP code via SMTP email.
   * @param {string} code - The OTP code to send.
   * @param {string} to - The recipient's email address.
   * @returns {Promise<boolean>} - A promise that resolves to true if the OTP was sent successfully.
   */
  public async sendOtpEmail(code: string, to: string): Promise<boolean> {
    try {
      const data = await BitPinger.smtp.sendMail({
        headers : { 'Return-Path': this.from, },
        from    : this.from,
        to      : [to],
        subject : 'BitPing Me OTP',
        text    : `Your BitPing Me OTP is ${code}. Do not share it with anyone. It will expire in 10 minutes.`,
      });
      console.log('BitPinger: Mailgun SMTP response:', data);
      return true;
    } catch (error: any) {
      console.error('BitPinger: Error sending OTP email:', error);
      return false;
    }
  }

  /**
   * Send an OTP code via SMS text.
   * @param {string} code - The OTP code to send.
   * @param {string} to - The recipient's phone number.
   * @returns {Promise<boolean>} - A promise that resolves to true if the OTP was sent successfully.
   */
  public async sendOtpText(code: string, to: string): Promise<boolean> {
    try {
      const data = await BitPinger.sms.messages.create('bitping.me', {
        from    : this.from,
        to      : [to],
        subject : 'BitPing Me OTP',
        text    : `Your BitPing Me OTP is ${code}. Do not share it with anyone. It will expire in 10 minutes.`,
      });
      console.log('BitPinger: Mailgun SMS response:', data);
      return true;
    } catch (error: any) {
      console.error('BitPinger: Error sending OTP text:', error);
      return false;
    }
  }

}

export default new BitPinger();