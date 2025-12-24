# Bitcoin Savings Tracker

A web application to help users track their Bitcoin savings and investments.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)

## Screenshot

![Bitcoin Savings Tracker Screenshot](https://raw.githubusercontent.com/mahdico/bitcoin-savings-tracker/main/docs/app-screenshot.png)

## Features

- **Dashboard:** View key metrics like total holdings, investment value, and profit/loss.
- **Purchase Tracking:** Easily add, edit, and delete your Bitcoin purchase records.
- **Data Visualization:** Interactive charts to visualize your portfolio growth over time.
- **Real-time Price:** Live Bitcoin price ticker from CoinGecko and Nobitex.
- **Authentication & Sync:** Securely log in with Google and sync your data across devices using Supabase.
- **Data Portability:** Import and export your purchase history in CSV and JSON formats.
- **PWA Support:** Install the app on your mobile or desktop for a native-like experience.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/installation)
- A [Supabase](https://supabase.com/) account for database and authentication.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mahdico/bitcoin-savings-tracker.git
    cd bitcoin-savings-tracker
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add the following variables. You can get these from your Supabase project dashboard.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
    ```

4.  **Set up the database:**
    Log in to your Supabase account and run the SQL scripts located in the `/scripts` directory in the Supabase SQL Editor to set up the necessary tables and policies.

## Usage

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Mahdi co - [@mahdilow](https://twitter.com/mahdilow) - mahdi@mahdico.com

Project Link: [https://github.com/mahdilow/bitcoin-savings-tracker](https://github.com/mahdilow/bitcoin-savings-tracker)

---

### توضیحات فارسی

این پروژه یک ابزار تحت وب برای دنبال کردن و مدیریت پس‌انداز بیت‌کوین است. با استفاده از این ابزار، کاربران می‌توانند تاریخچه خریدهای خود را ثبت کرده، ارزش فعلی دارایی خود را مشاهده کنند و عملکرد سرمایه‌گذاری خود را از طریق نمودارها و معیارهای کلیدی تحلیل نمایند. این برنامه با قابلیت نصب (PWA)، امکان استفاده آفلاین و تجربه‌ای شبیه به اپلیکیشن‌های بومی را فراهم می‌کند.
