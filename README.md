# bitping.me

**bitping.me** is a simple, no-frills **Bitcoin price alert service** that notifies you via **SMS or Email** when Bitcoin hits your target price. No accounts, no ads — just a fast BTC ping when you need it.

⚡ **Lightning Payments** — Pay per alert using the **Bitcoin Lightning Network**. No subscriptions. No credit cards.

🌐 **Live at:** [https://bitping.me](https://bitping.me)

## ✨ Features
- 🔔 **BTC/USD Price Alerts** via **SMS or Email (SMTP)**
- ⚡ **Pay-Per-Alert** using **Bitcoin Lightning Invoices** (Lightning-only)
- 🛡️ No signups, no accounts — privacy-first!
- 🌐 Supports limited exchanges: `kraken`, `mempool`, `coinbase`, `coingecko`, `binance`, `bitstamp`
- 📈 Real-time price tracking with interval cloud function
- 💡 Simple UI — set a target price, pay, get notified.

## 🚀 How It Works
1. **Enter a target BTC/USD price** (e.g., "Alert me when BTC hits $40,000").
2. Select your **preferred exchange** for price data.
3. Choose **SMS or Email** for notifications.
4. Pay the **Lightning invoice**.
5. A scheduled cloud function monitors prices — you'll get a ping when it's time.

## 🧩 Tech Stack
- **Frontend:** Next.js + React + TypeScript
- **Backend:** Next.js + TypeScript + Prisma ORM (SQLite)
- **Database:** Local SQLite file
- **Pricing API Sources:** Kraken, Mempool.space, Coinbase, CoinGecko, Binance, Bitstamp
- **Payments:** Bitcoin Lightning Network (Invoices Only)
- **Notifications:** Mailgun API for SMS (via SMTP gateway) and Mailgun Email (via SMTP)
- **Deployment:** Docker Container on App Platform or Netlify Functions
- **Alert Runner:** Cloud function invoked on interval to process pending alerts

## 🏗️ Local Development
1. **Fork and clone the repo:**
    ```bash
    git clone https://github.com/yourusername/bitping.me.git
    cd bitping.me
    ```
2. **Install dependencies:**
    ```bash
    pnpm install
    ```
3. **Set up environment variables:**
    Create a `.env` file using the template:
    ```bash
    cp template.env .env
    ```
    Open it and add your environment variables:
    ```conf
    # App
    APP_NAME=<APP_NAME> # Your app name (e.g. mybitpinger)
    APP_API_URL=<APP_API_URL> # Leave blank for localhost
    APP_API_KEY=<APP_API_KEY> # UUID (e.g. e9dd40cc-1adb-450d-96fb-a38376e2d368)
    APP_DATABASE_URL=<APP_DATABASE_URL> # SQLite local file (e.g. file:./mybitpinger.db)

    # Test
    TEST_PHONE_NUMBER=<TEST_PHONE_NUMBER> # Used for test scripts/
    TEST_PHONE_CARRIER=<TEST_PHONE_CARRIER> # Used for test scripts/
    TEST_EMAIL_ADDRESS=<TEST_EMAIL_ADDRESS> # Used for test scripts/

    # Mailgun
    MAILGUN_DOMAIN=<MAILGUN_DOMAIN> # Either sandbox or custom domain name
    MAILGUN_FROM_EMAIL=<MAILGUN_FROM_EMAIL> # Email address to send SMS or SMTP from
    MAILGUN_API_USER=<MAILGUN_API_USER> # api
    MAILGUN_SMTP_PASSWORD=<MAILGUN_SMTP_PASSWORD> # Your password
    MAILGUN_SENDING_API_KEY=<MAILGUN_SENDING_API_KEY> # Your sending api key
    MAILGUN_API_KEY=<MAILGUN_API_KEY> # Your api key (optional)

    # Speed
    SPEED_PUBLIC_KEY=<SPEED_PUBLIC_KEY> # Tryspeed pubkey
    SPEED_SECRET_KEY=<SPEED_SECRET_KEY> # Tryspeed seckey
    SPEED_API_KEY=<SPEED_API_KEY> # Tryspeed api key
    SPEED_API_URL=<SPEED_API_URL> # https://api.tryspeed.com
    ```
4. **Setup database:**
    ```bash
    pnpm db:generate
    ```
5. **Run database migrations:**
    ```bash
    pnpm db:migrate-dev-init
    ```
5. **Start the dev server:**
    ```bash
    pnpm dev
    ```

## 🏗️ Production Development

COMING SOON

## ⚡ Payments with Lightning
BitPing uses **Lightning Invoices** for quick, cheap, one-time payments. You can pay via:
- Mobile Lightning Wallets (Phoenix, Breez, Muun, etc.)
- Desktop Wallets (Zeus, Zap, etc.)
- Lightning-enabled exchanges

## 🕒 Cloud Function for Price Monitoring
- A **scheduled serverless function** (Netlify Function or Docker-based cron task) runs at fixed intervals.
- This function checks pending alerts and sends notifications when target prices are met.
- Make sure to configure your deployment platform to **invoke the function every X minutes**.

## 📬 Notifications
SMS and Email alerts are sent through **SMTP gateways**. Ensure your SMTP provider supports sending SMS via Email-to-SMS gateways or use carrier-specific email formats.

## 📅 Roadmap
- Add multi-currency support (EUR, GBP, etc.)
- Add more exchanges
- Optional login and user dashboard to view active alerts
- On-chain Bitcoin and Lightning Address payments (LNURL-Pay)

## 📜 License
[Unlicense](LICENSE) - Free and unencumbered software released into the public domain.

## 🙌 Contributions
PRs, issues, and feature requests are welcome! Feel free to open an [Issue](https://github.com/bnonni/bitping.me/issues) or submit a PR.

## 🔗 Live Demo
Visit [https://bitping.me](https://bitping.me) and try it out.
