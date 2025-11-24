# LedgerWise

A modern personal finance management application for tracking expenses, budgets, goals, and recurring payments.

## Overview

LedgerWise is a comprehensive financial tracking solution built with Next.js and React. It provides an intuitive interface for managing personal finances, including transaction tracking, budget planning, financial goals, and recurring expense management.

## Technology Stack

### Frontend Framework
- **Next.js 16.0.3** - React framework with App Router for server-side rendering and routing
- **React 19.2.0** - UI component library
- **Tailwind CSS 4.0** - Utility-first CSS framework for responsive design

### State Management
- **React Context API** - Global state management for transactions, budgets, goals, and settings
- **localStorage** - Client-side data persistence

### Database & Backend
- **Firebase 12.6.0** - Backend-as-a-Service (configured, currently using localStorage fallback)
- **Firestore** - NoSQL database for data storage

### Utilities
- **date-fns 4.1.0** - Modern JavaScript date utility library
- **PostCSS** - CSS processing

### Development Tools
- **ESLint** - Code linting
- **TypeScript 5.x** - Type checking support

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LedgerWise Application                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─── Next.js App Router
                              │    ├─── Server Components
                              │    └─── Client Components
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                       Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Navigation (Responsive)   │   Pages                        │
│  - Dashboard               │   - Transactions               │
│  - Add Transaction         │   - Budget Planning            │
│  - Recurring Expenses      │   - Goals                      │
│  - Settings                │   - Dark/Light Theme           │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                    State Management Layer                   │
├─────────────────────────────────────────────────────────────┤
│  AppContext (React Context)                                 │
│  - Transactions State       - Settings State                │
│  - Budgets State            - Goals State                   │
│  - Recurring Expenses       - Theme Management              │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────┴─────────────────────────────┐
│                      Data Persistence Layer                 │
├─────────────────────────────────────────────────────────────┤
│  localStorage (Current)     │   Firebase/Firestore (Future) │
│  - Immediate persistence    │   - Cloud sync capability     │
│  - Browser-based storage    │   - Multi-device support      │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
ledger_wise/
├── app/
│   ├── components/
│   │   ├── Navigation.jsx          # Main navigation component
│   │   └── ThemeInitializer.jsx    # Theme management
│   ├── context/
│   │   └── AppContext.jsx           # Global state management
│   ├── firebase/
│   │   └── config.js                # Firebase configuration
│   ├── add-transaction/
│   │   └── page.jsx                 # Add transaction page
│   ├── budget-planning/
│   │   └── page.jsx                 # Budget planning page
│   ├── goals/
│   │   └── page.jsx                 # Financial goals page
│   ├── recurring/
│   │   └── page.jsx                 # Recurring expenses page
│   ├── settings/
│   │   └── page.jsx                 # Application settings
│   ├── transactions/
│   │   └── page.jsx                 # Transaction history page
│   ├── layout.jsx                   # Root layout
│   ├── page.jsx                     # Dashboard (home page)
│   ├── providers.jsx                # Context providers wrapper
│   └── globals.css                  # Global styles
├── public/                          # Static assets
├── package.json                     # Dependencies and scripts
├── tailwind.config.js              # Tailwind configuration
└── next.config.js                  # Next.js configuration
```

## Features

### Dashboard
- Real-time financial overview
- Total balance, income, and expenses
- Upcoming bills tracker
- Recent transaction history

### Transaction Management
- Add, view, and delete transactions
- Category-based organization
- Search and filter capabilities
- Income vs expense tracking

### Budget Planning
- Monthly budget creation
- Category-based budget allocation
- Spending tracking and visualization
- Budget vs actual comparison

### Financial Goals
- Goal creation and tracking
- Progress visualization
- Target amount and deadline management
- Contribution tracking

### Recurring Expenses
- Recurring bill management
- Automatic payment tracking
- Due date reminders
- Category organization

### Settings
- Theme customization (Light/Dark mode)
- Currency selection
- Language preferences
- Notification settings

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (version 9.x or higher) or **yarn**
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bishestabohara/LedgerWise.git
cd ledger_wise
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Copy your Firebase configuration
   - Update `app/firebase/config.js` with your credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

Note: The application currently uses localStorage as the default storage mechanism and will work without Firebase configuration.

## Running Locally

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
```
http://localhost:3000
```

### Production Build

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The optimized production build will be available at:
```
http://localhost:3000
```

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Environment Configuration

Create a `.env.local` file in the root directory for environment-specific configuration:

```env
# Firebase Configuration (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Data Storage

### Current Implementation (localStorage)

All application data is stored in the browser's localStorage:
- Transactions: `ledgerwise-transactions`
- Budgets: `ledgerwise-budgets`
- Goals: `ledgerwise-goals`
- Recurring Expenses: `ledgerwise-recurring`
- Settings: `ledgerwise-settings`

Data persists across sessions but is device-specific.

### Future Implementation (Firebase/Firestore)

When Firebase is fully configured, data will sync across devices and provide:
- Cloud-based storage
- Real-time synchronization
- Data backup and recovery
- Multi-device access

## Deployment

### Vercel (Recommended)

This application is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will auto-detect Next.js and configure build settings
4. Deploy

The application will automatically build and deploy on every push to the main branch.

### Other Platforms

The application can be deployed to any platform that supports Node.js and Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Heroku
- DigitalOcean App Platform

## Browser Support

LedgerWise supports all modern browsers:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Contact

For questions or support, please contact:
- Email: boharabishesta12@gmail.com
- GitHub: @bishestabohara

## Acknowledgments

Built with modern web technologies and best practices for performance, accessibility, and user experience.
