# Gemini Project Context

This document provides a summary of the "Bitcoin Savings Tracker" project to aid in understanding its structure, technologies, and purpose.

## Project Overview

The project is a web application designed to help users track their Bitcoin savings and investments. It provides a dashboard to visualize portfolio performance, manage purchase history, and view real-time market data. The application is a Progressive Web App (PWA), allowing users to install it on their devices for a native-like experience.

## Key Features

- **Dashboard:** Displays key metrics such as total BTC holdings, total amount invested, current portfolio value, profit/loss, and average buy price.
- **Purchase Tracking:** Allows users to add, edit, and delete their Bitcoin purchase records.
- **Data Visualization:** Includes charts to visualize portfolio growth and performance over time.
- **Real-time Price Ticker:** Fetches and displays the current price of Bitcoin from external APIs (CoinGecko and Nobitex).
- **User Authentication:** Implements user login via Google OAuth using Supabase for authentication.
- **Cloud Sync:** Enables users to securely back up and sync their purchase data across devices using a Supabase backend.
- **Data Portability:** Supports importing and exporting purchase history in CSV and JSON formats.
- **PWA Support:** Can be installed on mobile and desktop devices for offline access and a better user experience.
- **Localization:** The user interface is in Persian (Farsi) and uses Jalali dates.

## Technical Stack

- **Framework:** Next.js 16 (with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with a custom theme (supporting light and dark modes).
- **UI Components:** A mix of custom components and components from the `shadcn/ui` library.
- **Charting:** `recharts` for data visualization.
- **Backend & Database:** Supabase for user authentication and data storage (PostgreSQL).
- **State Management:** Primarily managed through React hooks (`useState`, `useEffect`).
- **Deployment:** Configured for Vercel.

## Project Structure

- `app/`: Contains the main application logic, including pages, layouts, and API routes.
- `components/`: Houses all React components, with a `ui/` subdirectory for generic UI elements.
- `lib/`: Includes utility functions, type definitions, local storage management, and Supabase client configurations.
- `public/`: Stores static assets like images, icons, and the PWA manifest file.
- `scripts/`: Contains SQL scripts for setting up the Supabase database schema.

## APIs and External Services

- **CoinGecko API:** Used to fetch real-time Bitcoin price data and historical market information.
- **Nobitex API:** An additional source for fetching Bitcoin prices in Iranian Rials (IRT).
- **Supabase:** Provides authentication, database, and serverless functions for the backend.

This summary should provide a solid foundation for understanding the project and fulfilling future requests.
