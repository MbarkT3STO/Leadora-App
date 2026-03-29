# Leadora

Leadora is a modern, premium lead generation application that allows users to find targeted leads (decision-makers) and their business emails using the Apollo.io API.

This project was built entirely using **HTML, CSS, and Vanilla TypeScript** as per requirements, avoiding any UI frameworks or CSS libraries. It utilizes Vite for fast development and building with Netlify Serverless Functions for secure API communication.

## Features

- **Apollo.io Integration**: Real-time Lead search using the Apollo Mixed People/Organization API.
- **Granular Filtering**: Search by Job Title, Industry/Domain, and Location (City/Country).
- **Premium UI/UX**: Designed with a SaaS aesthetic, featuring smooth animations, glassmorphism elements, and precise typography (Inter font).
- **Dark/Light Themes**: Built-in toggle using CSS variables for a seamless transition between themes.
- **Serverless Backend**: Built with Netlify Functions to safely encapsulate your Apollo API Key.
- **Responsive Layout**: Designed to look great on desktop and mobile.
- **Micro-interactions**: Hover effects, loading states, and direct copy-to-clipboard for lead emails with success feedback.
- **Type-safe**: Strict TypeScript patterns across the frontend and backend.

## Architecture

The codebase follows a modular, maintainable structure:
- `/src/core` - Application initialization and bootstrapping (`app.ts`).
- `/src/services` - Data fetching via Netlify functions (`api.ts`).
- `/src/modules` - Functional sections (`SearchForm`, `ResultsGrid`).
- `/src/components` - Reusable UI elements (`Input`, `Button`, `Card`).
- `/src/types` - TypeScript interfaces guaranteeing type-safety.
- `/src/utils` - Helpers like `ThemeManager` and form validation.
- `/src/styles` - Pure CSS architecture utilizing HSL Custom Properties for theming.
- `/netlify/functions` - Secure backend handlers for Apollo API communication.

## Getting Started Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Apollo API key:
   ```env
   APOLLO_API_KEY=your_real_apollo_api_key_here
   ```
   *If no key is provided, the app will gracefully fallback to premium mock data.*

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app in your browser.

4. **Build for Production**
   ```bash
   npm run build
   ```

## Deployment on Netlify

This project is optimized for Netlify deployment with built-in serverless functions.

### Automated Deployment (Recommended)
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Go to Netlify -> **Add New Site** -> **Import from an existing project**.
3. Select this repository.
4. Set the **Build Command** to `npm run build`.
5. Set the **Publish directory** to `dist`.
6. Add `APOLLO_API_KEY` to the **Environment Variables** in Netlify dashboard.
7. Click **Deploy Site**.
